
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, Timer } from "lucide-react";

interface ResultSummaryCardsProps {
  rawMarks: number;
  lossMarks: number;
  scaledMarks: number;
  totalMarks: number;
  utilizedTime?: number; // Added time props
  totalTime?: number;
}

const ResultSummaryCards = ({
  rawMarks,
  lossMarks,
  scaledMarks,
  totalMarks,
  utilizedTime = 0,
  totalTime = 0
}: ResultSummaryCardsProps) => {
  const displayTotal = totalMarks === 65 ? 100 : totalMarks;
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-500">Raw Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{rawMarks}</span>
            <span className="text-gray-500 ml-1">/ {totalMarks}</span>
          </div>
          <TrendingUp className="h-5 w-5 text-green-500 mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-500">Loss Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-red-500">-{lossMarks}</span>
          </div>
          <TrendingDown className="h-5 w-5 text-red-500 mt-2" />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1 border-l-4 border-l-indigo-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-500">Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{scaledMarks}</span>
            <span className="text-gray-500 ml-1">
              {totalMarks === 65 ? "/ 100" : `/ ${totalMarks}`}
            </span>
            <span className="ml-2 text-gray-500">
              ({Math.round((scaledMarks / displayTotal) * 100)}%)
            </span>
          </div>
          <Progress
            className="mt-2"
            value={(scaledMarks / displayTotal) * 100}
          />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-500">Time Utilized</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end">
            <span className="text-2xl font-bold">{formatTime(utilizedTime)}</span>
          </div>
          <Timer className="h-5 w-5 text-indigo-400 mt-2" />
        </CardContent>
      </Card>

      <Card className="md:col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-gray-500">Total Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end">
            <span className="text-2xl font-bold">{formatTime(totalTime)}</span>
          </div>
          <Clock className="h-5 w-5 text-indigo-400 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultSummaryCards;
