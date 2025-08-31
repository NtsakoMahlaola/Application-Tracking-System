import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ExtractedData, ApplicationData } from './ApplicationForm';
import { Loader2 } from 'lucide-react';

interface CompleteStepProps {
  extractedData: ExtractedData;
  onSubmit: (data: Partial<ApplicationData>) => void;
  isProcessing: boolean;
}

export const CompleteStep = ({ extractedData, onSubmit, isProcessing }: CompleteStepProps) => {
  const [formData, setFormData] = useState({
    terms_accepted: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit(formData);
  };

  const isFormValid = formData.terms_accepted;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4">Complete Your Application</h2>
        <p className="text-muted-foreground">
          Just a few more details to complete your application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="terms"
            checked={formData.terms_accepted}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, terms_accepted: checked === true }))
            }
            className="mt-1"
          />
          <div>
            <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
              I agree to the terms and conditions <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              By submitting this application, I confirm that the information provided is accurate 
              and I agree to the processing of my personal data for recruitment purposes.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-6">
          <Button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className="px-8 py-3 bg-gradient-button hover:opacity-90 transition-opacity disabled:opacity-50"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
          
          {!isFormValid && !isProcessing && (
            <p className="text-sm text-muted-foreground mt-2">
              Please fill in all required fields to submit your application
            </p>
          )}
        </div>
      </form>
    </div>
  );
};