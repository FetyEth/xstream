import { CheckCircle } from "lucide-react";

interface UploadStepsProps {
  currentStep: number;
}

export default function UploadSteps({ currentStep }: UploadStepsProps) {
  const getStepLabel = (step: number) => {
    switch (step) {
      case 1:
        return "Upload Video";
      case 2:
        return "Video Details";
      case 3:
        return "Pricing & Settings";
      case 4:
        return "Review & Publish";
      case 5:
        return "Complete!";
      default:
        return "";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light transition-all ${
                step <= currentStep
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/50 backdrop-blur-xl"
              } ${
                step === currentStep
                  ? "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                  : ""
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div
                className={`w-8 md:w-16 h-0.5 transition-all ${
                  step < currentStep ? "bg-white" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-3">
        <div className="text-sm text-white/70 font-light">
          {getStepLabel(currentStep)}
        </div>
      </div>
    </div>
  );
}
