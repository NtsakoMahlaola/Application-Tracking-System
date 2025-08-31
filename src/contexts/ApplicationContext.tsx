import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExtractedData } from '@/components/ApplicationForm';

interface ApplicationContextType {
  documents: {
    cv: File | null;
    motivation: File | null;
  };
  extractedData: ExtractedData | null;
  applicationData: any; // Adjust this type according to your needs
  setDocuments: (documents: { cv: File | null; motivation: File | null }) => void;
  setExtractedData: (data: ExtractedData | null) => void;
  setApplicationData: (data: any) => void;
  clearStorage: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<{ cv: File | null; motivation: File | null }>({
    cv: null,
    motivation: null,
  });
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('applicationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setExtractedData(parsedData.extractedData || null);
        setApplicationData(parsedData.applicationData || null);
      } catch (error) {
        console.error('Failed to parse saved application data', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      extractedData,
      applicationData,
      documents: {
        cv: documents.cv ? documents.cv.name : null,
        motivation: documents.motivation ? documents.motivation.name : null,
      },
    };
    localStorage.setItem('applicationData', JSON.stringify(dataToSave));
  }, [extractedData, applicationData, documents]);

  const clearStorage = () => {
    localStorage.removeItem('applicationData');
    setDocuments({ cv: null, motivation: null });
    setExtractedData(null);
    setApplicationData(null);
  };

  return (
    <ApplicationContext.Provider
      value={{
        documents,
        extractedData,
        applicationData,
        setDocuments,
        setExtractedData,
        setApplicationData,
        clearStorage,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};
