import { CheckCircle, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const SuccessStep = () => {
  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-card backdrop-blur-glass shadow-card border-0 p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-accent mx-auto animate-pulse" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for applying! We've received your application and will review it carefully. 
          You should hear back from us within 5-7 business days.
        </p>
        
        {/* What Happens Next */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                1
              </div>
              <p className="text-sm">Your application will be reviewed by our recruitment team</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                2
              </div>
              <p className="text-sm">If shortlisted, we'll contact you to schedule an interview</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                3
              </div>
              <p className="text-sm">We'll keep you updated throughout the entire process</p>
            </div>
          </div>
        </div>
        
        {/* Application Reference */}
        <div className="bg-gradient-accent/10 border border-accent/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-1">Your Application Reference</p>
          <p className="text-lg font-mono font-semibold text-accent">
            APP-{new Date().getFullYear()}-{Math.random().toString(36).substr(2, 8).toUpperCase()}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Download Confirmation
          </Button>
          
          <Button 
            className="bg-gradient-button hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <Calendar className="w-4 h-4" />
            Submit Another Application
          </Button>
        </div>
        
        {/* Contact Information */}
        <div className="mt-8 pt-6 border-t border-muted">
          <p className="text-sm text-muted-foreground">
            Have questions? Contact our HR team at{' '}
            <a href="mailto:hr@company.com" className="text-primary hover:underline">
              hr@company.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};