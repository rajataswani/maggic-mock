
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, AlertTriangle, TrendingUp, TrendingDown, BookOpen } from "lucide-react";

interface SubjectPerformanceProps {
  subjectPerformance: {
    subject: string;
    total: number;
    scored: number;
    attempted: number;
    skipped: number;
    totalQuestions: number;
    percentage: number;
  }[];
}

const SubjectPerformance = ({ subjectPerformance }: SubjectPerformanceProps) => {
  // Vibrant, engaging colors for subjects
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-rose-500", 
    "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", 
    "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500"
  ];
  
  const textColors = [
    "text-blue-700", "text-purple-700", "text-pink-700", "text-rose-700", 
    "text-orange-700", "text-amber-700", "text-yellow-700", "text-lime-700", 
    "text-green-700", "text-emerald-700", "text-teal-700", "text-cyan-700"
  ];

  const bgLightColors = [
    "bg-blue-50", "bg-purple-50", "bg-pink-50", "bg-rose-50", 
    "bg-orange-50", "bg-amber-50", "bg-yellow-50", "bg-lime-50", 
    "bg-green-50", "bg-emerald-50", "bg-teal-50", "bg-cyan-50"
  ];

  return (
    <Card className="shadow-sm border-t-4 border-t-purple-500">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Subject Performance Breakdown
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-gray-600">
              <tr>
                <th className="text-left font-semibold py-3 px-4">Subject Focus</th>
                <th className="text-center font-semibold py-3 px-2">Questions</th>
                <th className="text-center font-semibold py-3 px-2">Attempted</th>
                <th className="text-center font-semibold text-gray-400 py-3 px-2">Skipped</th>
                <th className="text-center font-semibold py-3 px-2">Total Marks</th>
                <th className="text-center font-semibold py-3 px-2">Scored</th>
                <th className="text-left font-semibold py-3 px-4 w-1/3">Mastery Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjectPerformance.map((subject, index) => {
                const isStrong = subject.percentage >= 75;
                const isWeak = subject.percentage < 50;
                
                return (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} shadow-sm`} />
                      <span className={`font-medium ${textColors[index % textColors.length]}`}>
                        {subject.subject}
                      </span>
                      {isStrong && (
                        <div title="Strong Subject" className="ml-1 flex items-center justify-center bg-green-100 text-green-600 rounded-full w-5 h-5">
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      )}
                      {isWeak && (
                        <div title="Needs Improvement" className="ml-1 flex items-center justify-center bg-red-100 text-red-600 rounded-full w-5 h-5">
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-2 font-medium text-gray-700">{subject.totalQuestions}</td>
                  <td className="text-center py-4 px-2 text-indigo-600 font-medium">{subject.attempted}</td>
                  <td className="text-center py-4 px-2 text-gray-400">{subject.skipped}</td>
                  <td className="text-center py-4 px-2 text-gray-500">{subject.total}</td>
                  <td className="text-center py-4 px-2 font-bold text-gray-900">{subject.scored}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className={isStrong ? "text-green-600" : isWeak ? "text-red-500" : "text-blue-600"}>
                          {subject.percentage}% Mastery
                        </span>
                        {isStrong ? <TrendingUp className="h-3 w-3 text-green-500" /> : 
                         isWeak ? <TrendingDown className="h-3 w-3 text-red-400" /> : null}
                      </div>
                      <Progress
                        className="h-2 w-full bg-gray-100"
                        value={subject.percentage}
                      />
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPerformance;
