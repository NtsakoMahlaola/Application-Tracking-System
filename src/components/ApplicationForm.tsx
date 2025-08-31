import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepIndicator } from './StepIndicator';
import { UploadStep } from './UploadStep';
import { ValidateStep } from './ValidateStep';
import { CompleteStep } from './CompleteStep';
import { SuccessStep } from './SuccessStep';
import { LeadershipSelection } from './LeadershipSelection';
import respublicaLogo from '/Respublica-logo.jpg';
import uctLogo from '/uct logo.jpg';
import { useToast } from '@/hooks/use-toast';

// Formspree form ID
const FORMSPREE_FORM_ID = 'xjkerjkb';

export interface ExtractedData {
  experience: string[];
  leadership: string[];
  profile_summary: string;
  education: string[];
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface ApplicationData {
  name: string;
  surname: string;
  studentNumber: string;
  leadershipRoles: string[];
  otherRole?: string;
  terms_accepted: boolean;
  cv?: File;
}

export const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [applicationData, setApplicationData] = useState<Partial<ApplicationData>>({});
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const { toast } = useToast();

  const steps = [
    { number: 1, title: 'Application Summary', completed: currentStep > 0 },
    { number: 2, title: 'Upload Documents', completed: currentStep > 1 },
    { number: 3, title: 'Complete Application', completed: currentStep > 2 }
  ];

  const extractCVData = async (file: File): Promise<ExtractedData> => {
    // Simulate data extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          experience: ['Previous experience 1', 'Previous experience 2'],
          leadership: ['Leadership role 1', 'Leadership role 2'],
          profile_summary: 'Extracted profile summary from CV',
          education: ['Degree from University'],
          full_name: 'Extracted Name',
          email: 'extracted@example.com',
          phone: '123-456-7890'
        });
      }, 1000);
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await extractCVData(file);
      setExtractedData(data);
      // Set basic application data from extracted data
      setApplicationData(prev => ({
        ...prev,
        name: data.full_name?.split(' ')[0] || '',
        surname: data.full_name?.split(' ').slice(1).join(' ') || '',
        cv: file
      }));
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the uploaded file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitToFormspree = async (data: ApplicationData) => {
    const formData = new FormData();
    formData.append('name', `${data.name} ${data.surname}`);
    formData.append('student_number', data.studentNumber);
    if (data.cv) {
      formData.append('cv', data.cv);
    }
    
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit application');
    }
  };

  if (applicationSubmitted) {
    return <SuccessStep />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-8 mb-6">
            <img src={respublicaLogo} alt="Respublica Logo" className="h-16" />
            <img src={uctLogo} alt="UCT Logo" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subwarden Application</h1>
          <p className="text-gray-600">Apply for the Subwarden position at Respublica</p>
        </div>

        <Card className="mb-8">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </Card>

        <Card className="p-6">
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Application Summary</h2>
              <p className="mb-6">
                Please prepare the following information before starting your application:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Your CV in PDF format (combining CV and cover letter)</li>
                <li>Your student number</li>
              </ul>
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(1)}>Start Application</Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <UploadStep
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 2 && extractedData && (
            <ValidateStep
              data={extractedData}
              onComplete={(data) => {
                // Update application data with validated extracted data
                setApplicationData(prev => ({
                  ...prev,
                  ...data,
                  full_name: data.full_name || ''
                }));
                setCurrentStep(3);
              }}
            />
          )}

          {currentStep === 3 && extractedData && (
            <CompleteStep
              extractedData={extractedData}
              onSubmit={async (finalData) => {
                setIsProcessing(true);
                try {
                  const completeData = {
                    ...applicationData,
                    ...finalData
                  } as ApplicationData;
                  await submitToFormspree(completeData);
                  setApplicationSubmitted(true);
                } catch (error) {
                  console.error('Error submitting application:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to submit application. Please try again.',
                    variant: 'destructive',
                  });
                } finally {
                  setIsProcessing(false);
                }
              }}
              isProcessing={isProcessing}
            />
          )}
        </Card>
      </div>
    </div>
  );
};