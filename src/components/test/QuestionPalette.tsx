
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Flag, Calculator, Cpu } from "lucide-react";

// Status colors for question palette
const statusColors = {
  notVisited: "bg-gray-200",
  attempted: "bg-green-500 text-white",
  skipped: "bg-red-500 text-white",
  attemptedReview: "bg-purple-500 text-white",
  skippedReview: "bg-orange-500 text-white"
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
        return <CheckCircle className="h-3 w-3" />;
      case "skipped":
        return <XCircle className="h-3 w-3" />;
      case "attemptedReview":
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
          {Object.entries(statusColors).map(([key, color]) => (
            <div key={key} className="flex items-center text-xs">
              <div className={cn("w-4 h-4 rounded mr-2", color)}></div>
              <span className="capitalize">
                {key === "notVisited" ? "Not Visited" : 
                 key === "attemptedReview" ? "Attempted & Marked" : 
                 key === "skippedReview" ? "Skipped & Marked" : 
                 key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
