
import React from "react";
import QuestionPalette from "./QuestionPalette";

interface TestPaletteProps {
  questionsCount: number;
  questionStatus: Record<number, string>;
  currentQuestion: number;
  onJumpToQuestion: (index: number) => void;
  isFullLengthTest?: boolean;
}

const TestPalette: React.FC<TestPaletteProps> = ({
  questionsCount,
  questionStatus,
  currentQuestion,
  onJumpToQuestion,
  isFullLengthTest
}) => {
  return (
    <div className="lg:w-1/4">
      <QuestionPalette
        questionsCount={questionsCount}
        questionStatus={questionStatus}
        currentQuestion={currentQuestion}
        onJumpToQuestion={onJumpToQuestion}
        isFullLengthTest={isFullLengthTest}
      />
    </div>
  );
};

export default TestPalette;
