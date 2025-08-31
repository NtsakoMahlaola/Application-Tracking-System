import { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadStepProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const UploadStep = ({ onFileUpload, isProcessing }: UploadStepProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (isProcessing) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-4">Processing your CV...</h3>
        <p className="text-muted-foreground">
          We're extracting information from your document. This may take a few moments.
        </p>
        <div className="mt-8 w-full bg-muted rounded-full h-2">
          <div className="bg-gradient-button h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-6">Upload Your Application</h2>
      <p className="text-muted-foreground mb-8">
        Please upload a single PDF document containing both your CV and cover letter combined
      </p>
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-12 mb-6 cursor-pointer
          transition-all duration-300 ease-smooth
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center">
          <div className="mb-4">
            {isDragOver ? (
              <Upload className="w-16 h-16 text-primary animate-bounce" />
            ) : (
              <FileText className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-2">
            {isDragOver ? 'Drop your combined document here' : 'Drag & drop your combined document here'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            or click to browse and select your file
          </p>
          
          <Button 
            variant="outline" 
            className="bg-gradient-card hover:bg-gradient-button hover:text-white transition-all duration-300"
          >
            Choose File
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Please combine your CV and cover letter into a single PDF document (max 5MB)
      </p>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};