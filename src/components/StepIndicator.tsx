import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="w-full mb-6 md:mb-8">
      {/* Mobile View - Current step indicator */}
      <div className="md:hidden flex items-center justify-between mb-4 px-2">
        <div className="text-sm font-medium text-primary">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-sm font-medium text-primary">
          {steps[currentStep - 1]?.title || 'Step'}
        </div>
      </div>
      
      <div className="flex items-center justify-between relative">
        {/* Progress Line - Hidden on mobile */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1.5 bg-muted -z-10 rounded-full">
          <div 
            className="h-full bg-gradient-button transition-all duration-500 ease-in-out rounded-full"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
        
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
            {/* Step Circle with responsive sizing */}
            <div 
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                text-white font-semibold text-sm sm:text-base
                transition-all duration-300 ease-smooth
                border-2 border-transparent
                ${step.completed 
                  ? 'bg-accent shadow-button' 
                  : step.number === currentStep 
                  ? 'bg-gradient-button shadow-button scale-110 border-white ring-2 ring-primary' 
                  : 'bg-muted-foreground/30'
                }
              `}
            >
              {step.completed ? (
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <span className={step.number === currentStep ? 'scale-125' : ''}>
                  {step.number}
                </span>
              )}
            </div>
            
            {/* Step Title - Responsive text */}
            <span 
              className={`hidden md:block mt-2 text-xs sm:text-sm font-medium text-center px-1
                ${step.number === currentStep 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground'
                }`}
            >
              {step.title}
            </span>
            
            {/* Mobile Progress Indicator */}
            <div className="md:hidden absolute -bottom-4 w-full flex justify-center">
              {step.number === currentStep && (
                <div className="h-1.5 w-10 bg-gradient-button rounded-full" />
              )}
            </div>
            
            {/* Mobile step connector */}
            {index < steps.length - 1 && (
              <div className="md:hidden absolute top-5 left-2/4 right-0 h-0.5 bg-muted -z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};