
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface TestTypeSelectionProps {
  testType: string | null;
  setTestType: (type: string) => void;
  onNext: () => void;
}

const TestTypeSelection = ({ testType, setTestType, onNext }: TestTypeSelectionProps) => {
  return (
    <div className="text-center space-y-8 max-w-md mx-auto py-4">
      <h2 className="text-2xl font-bold text-slate-200">
        What type of test would you like to generate?
      </h2>
      
      <div className="grid gap-4">
        {["Full Syllabus", "Subject Wise", "Multi-Subject Test"].map((type) => (
          <Button
            key={type}
            variant={testType === type ? "default" : "outline"}
            className={`w-full py-6 text-lg transition-all ${
              testType === type 
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30" 
                : "bg-transparent border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setTestType(type)}
          >
            {type}
          </Button>
        ))}
      </div>
      
      <Button
        className="bg-indigo-600 hover:bg-indigo-500 text-white w-full h-12 text-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
        size="lg"
        disabled={!testType}
        onClick={onNext}
      >
        Next <ChevronRight className="ml-1 h-5 w-5" />
      </Button>
    </div>
  );
};

export default TestTypeSelection;
