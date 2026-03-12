
import { Question } from "@/lib/types";

interface SubjectPerformance {
  subject: string;
  total: number;       // total marks available
  scored: number;      // positive marks earned (raw)
  lostMarks: number;   // negative marks lost
  actualMarks: number; // scored - lostMarks
  attempted: number;
  totalQuestions: number;
  percentage: number;
}

interface TestResults {
  rawMarks: number;
  lossMarks: number;
  actualMarks: number;
  scaledMarks: number;
  totalMarks: number;
  subjectPerformance: SubjectPerformance[];
  weakSubjects: string[];
}

export const useTestResults = () => {
  const calculateResults = (
    questions: Question[],
    userAnswers: (string | string[] | null)[],
    questionStatus?: Record<number, string> // optional in case of legacy usage
  ): TestResults & { sillyMistakes: Record<number, boolean> } => {
    let rawMarks = 0;
    let lossMarks = 0;
    const sillyMistakes: Record<number, boolean> = {};
    
    // Track marks by subject
    const subjectPerformance: Record<string, {
      total: number,
      scored: number,
      lostMarks: number,
      attempted: number,
      skipped: number,
      totalQuestions: number,
      correctCount: number,
      incorrectCount: number
    }> = {};
    
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const qStatus = questionStatus ? questionStatus[index] : undefined;
      
      // Initialize subject tracking
      if (!subjectPerformance[question.subject]) {
        subjectPerformance[question.subject] = {
          total: 0,
          scored: 0,
          lostMarks: 0,
          attempted: 0,
          skipped: 0,
          totalQuestions: 0,
          correctCount: 0,
          incorrectCount: 0
        };
      }
      
      // Count total marks and questions by subject
      subjectPerformance[question.subject].total += question.marks;
      subjectPerformance[question.subject].totalQuestions += 1;
      
      // Check if skipped based on explicit question status or missing answer
      const explicitlySkipped = qStatus === "skipped" || qStatus === "skippedReview" || qStatus === "notVisited";
      
      // Consider an answer attempted if it's not null and not empty
      const isAttempted = !explicitlySkipped && userAnswer !== null && 
        (typeof userAnswer !== 'string' || userAnswer.trim() !== '') &&
        (!Array.isArray(userAnswer) || userAnswer.length > 0);
        
      if (isAttempted) {
        subjectPerformance[question.subject].attempted += 1;
        
        // For MCQ
        if (question.type === "MCQ" && typeof userAnswer === "string") {
          if (userAnswer === question.correctOption) {
            rawMarks += question.marks;
            subjectPerformance[question.subject].scored += question.marks;
            subjectPerformance[question.subject].correctCount += 1;
          } else {
            const neg = Math.abs(question.negativeMark || 0);
            lossMarks += neg;
            subjectPerformance[question.subject].lostMarks += neg;
            subjectPerformance[question.subject].incorrectCount += 1;
          }
        }
        // For MSQ
        else if (question.type === "MSQ" && Array.isArray(userAnswer) && question.correctOptions) {
          // Check if user selected all the correct options and nothing else
          const allCorrectOptionsSelected = question.correctOptions.every(opt => 
            userAnswer.includes(opt)
          );
          
          const noIncorrectOptionsSelected = userAnswer.every(opt => 
            question.correctOptions?.includes(opt)
          );
          
          // User must select ALL correct options AND ONLY correct options
          if (allCorrectOptionsSelected && noIncorrectOptionsSelected) {
            rawMarks += question.marks;
            subjectPerformance[question.subject].scored += question.marks;
            subjectPerformance[question.subject].correctCount += 1;
          } else {
            const numCorrectSelected = userAnswer.filter(opt => question.correctOptions?.includes(opt)).length;
            const numIncorrectSelected = userAnswer.length - numCorrectSelected;
            const totalCorrectOptions = question.correctOptions.length;
            const missedOne = (numCorrectSelected === totalCorrectOptions - 1) && (numIncorrectSelected === 0);
            const extraOne = (numCorrectSelected === totalCorrectOptions) && (numIncorrectSelected === 1);
            if (missedOne || extraOne) sillyMistakes[index] = true;
            const neg = Math.abs(question.negativeMark || 0);
            lossMarks += neg;
            subjectPerformance[question.subject].lostMarks += neg;
            subjectPerformance[question.subject].incorrectCount += 1;
          }
        }
        // For NAT
        else if (question.type === "NAT" && typeof userAnswer === "string" && 
                question.rangeStart !== undefined && question.rangeEnd !== undefined) {
          const numAnswer = parseFloat(userAnswer);
          if (!isNaN(numAnswer) && numAnswer >= question.rangeStart && numAnswer <= question.rangeEnd) {
            rawMarks += question.marks;
            subjectPerformance[question.subject].scored += question.marks;
            subjectPerformance[question.subject].correctCount += 1;
          } else {
            if (!isNaN(numAnswer)) {
              const rangeDiff = question.rangeEnd - question.rangeStart || 1;
              const tolerance = Math.max(0.1, rangeDiff * 0.1);
              if (numAnswer >= question.rangeStart - tolerance && numAnswer <= question.rangeEnd + tolerance) {
                sillyMistakes[index] = true;
              }
            }
            const neg = Math.abs(question.negativeMark || 0);
            lossMarks += neg;
            subjectPerformance[question.subject].lostMarks += neg;
            subjectPerformance[question.subject].incorrectCount += 1;
          }
        }
      } else {
        subjectPerformance[question.subject].skipped += 1;
      }
    });
    
    // Format subject performance for UI
    const formattedSubjectPerformance = Object.entries(subjectPerformance).map(
      ([subject, data]) => ({
        subject,
        total: data.total,
        scored: data.scored,
        lostMarks: data.lostMarks,
        actualMarks: data.scored - data.lostMarks,
        attempted: data.attempted,
        skipped: data.skipped,
        totalQuestions: data.totalQuestions,
        correctCount: data.correctCount,
        incorrectCount: data.incorrectCount,
        percentage: data.total > 0 ? Math.round((data.scored / data.total) * 100) : 0
      })
    );
    
    // Find weak subjects (less than 50% score)
    const weakSubjects = formattedSubjectPerformance
      .filter(subject => subject.percentage < 50)
      .map(subject => subject.subject);
    
    // Allow negative final score
    const actualMarks = rawMarks - lossMarks;
    const totalMarks = questions.reduce((total, q) => total + q.marks, 0);
    
    // Scale based on test type - use actual total marks for non-standard tests
    const scaledMarks = totalMarks === 65 ? Math.round((actualMarks / totalMarks) * 100) : actualMarks;
    
    return {
      rawMarks,
      lossMarks,
      actualMarks,
      scaledMarks,
      totalMarks,
      subjectPerformance: formattedSubjectPerformance,
      weakSubjects,
      sillyMistakes
    };
  };

  return { calculateResults };
};
