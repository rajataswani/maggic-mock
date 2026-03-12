
import { cn } from "@/lib/utils";
import { Check, Flag, Calculator, Cpu } from "lucide-react";

// Status colors for question palette
const statusColors = {
  notVisited: "bg-white border text-slate-800",
  visited: "bg-red-500 text-white",
  attempted: "bg-green-500 text-white",
  attemptedReview: "bg-purple-600 text-white",
  skippedReview: "bg-orange-500 text-white",
  skipped: "bg-red-500 text-white" // Map skipped to Red as well since it's visited but unanswered
};

export interface QuestionPaletteProps {
  questionsCount: number;
  questionStatus: Record<number, string>;
  currentQuestion: number;
  onJumpToQuestion: (index: number) => void;
  isFullLengthTest?: boolean;
}

const QuestionPalette = ({
  questionsCount,
  questionStatus,
  currentQuestion,
  onJumpToQuestion,
  isFullLengthTest = false,
}: QuestionPaletteProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attempted":
        return <Check className="h-3 w-3" />;
      case "attemptedReview":
        return <Check className="h-3 w-3 font-bold" />;
      case "skippedReview":
        return <Flag className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-72 bg-white shadow-lg p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3">Question Palette</h3>
      
      {isFullLengthTest && questionsCount >= 65 ? (
        <>
          {/* Aptitude Section */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2 text-indigo-700">
              <Calculator className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Aptitude Section</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array(10).fill(0).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-8 h-8 text-xs font-medium rounded flex items-center justify-center relative",
                    statusColors[questionStatus[index] as keyof typeof statusColors] || statusColors.notVisited,
                    currentQuestion === index && "ring-2 ring-black ring-offset-1"
                  )}
                  onClick={() => onJumpToQuestion(index)}
                >
                  {index + 1}
                  <div className="absolute -top-1 -right-1">
                    {getStatusIcon(questionStatus[index])}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Technical Section */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2 text-indigo-700">
              <Cpu className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Technical Section</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array(questionsCount - 10).fill(0).map((_, i) => {
                const index = i + 10;
                return (
                  <button
                    key={index}
                    className={cn(
                      "w-8 h-8 text-xs font-medium rounded flex items-center justify-center relative",
                      statusColors[questionStatus[index] as keyof typeof statusColors] || statusColors.notVisited,
                      currentQuestion === index && "ring-2 ring-black ring-offset-1"
                    )}
                    onClick={() => onJumpToQuestion(index)}
                  >
                    {index + 1}
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(questionStatus[index])}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Default single section for non-full-length tests */
        <div className="mb-4 flex flex-wrap gap-1">
          {Array(questionsCount).fill(0).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-8 h-8 text-xs font-medium rounded flex items-center justify-center relative",
                statusColors[questionStatus[index] as keyof typeof statusColors] || statusColors.notVisited,
                currentQuestion === index && "ring-2 ring-black ring-offset-1"
              )}
              onClick={() => onJumpToQuestion(index)}
            >
              {index + 1}
              <div className="absolute -top-1 -right-1">
                {getStatusIcon(questionStatus[index])}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="border-t pt-3">
        <div className="text-xs font-medium mb-1">Legend:</div>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center text-xs"><div className="w-4 h-4 rounded mr-2 bg-white border border-gray-300"></div><span>not visited the question yet.</span></div>
          <div className="flex items-center text-xs"><div className="w-4 h-4 rounded mr-2 bg-red-500"></div><span>visited but not answered </span></div>
          <div className="flex items-center text-xs"><div className="w-4 h-4 rounded mr-2 bg-green-500"></div><span>answered</span></div>
          <div className="flex items-center text-xs"><div className="w-4 h-4 rounded mr-2 bg-orange-500"></div><span>not answered but marked it for review.</span></div>
          <div className="flex items-center text-xs"><div className="w-4 h-4 rounded mr-2 bg-purple-600"></div><span className="flex items-center gap-1">answered and marked it for review <Check className="h-2 w-2" /></span></div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
