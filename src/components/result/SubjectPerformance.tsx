
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, AlertTriangle, BookOpen } from "lucide-react";

interface SubjectPerformanceProps {
  subjectPerformance: {
    subject: string;
    total: number;
    scored: number;
    lostMarks: number;
    actualMarks: number;
    attempted: number;
    skipped: number;
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    percentage: number;
  }[];
}

const pct = (num: number, den: number) =>
  den > 0 ? Math.round((num / den) * 100) : 0;

const SubjectPerformance = ({ subjectPerformance }: SubjectPerformanceProps) => {
  const dotColors = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-rose-500",
    "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
    "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500"
  ];
  const textColors = [
    "text-blue-700", "text-purple-700", "text-pink-700", "text-rose-700",
    "text-orange-700", "text-amber-700", "text-yellow-700", "text-lime-700",
    "text-green-700", "text-emerald-700", "text-teal-700", "text-cyan-700"
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
          <table className="w-full text-[10px] sm:text-xs">
            <thead className="bg-gray-50/80 text-gray-600">
              <tr>
                <th className="text-left font-semibold py-3 px-3 min-w-[130px]">Subject</th>
                <th className="text-center font-semibold py-3 px-2">Total Qs</th>
                <th className="text-center font-semibold py-3 px-2">Attempted</th>
                <th className="text-center font-semibold py-3 px-2">Skipped</th>
                <th className="text-center font-semibold py-3 px-2">Correct</th>
                <th className="text-center font-semibold py-3 px-2">Incorrect</th>
                <th className="text-center font-semibold py-3 px-2">+ve Marks</th>
                <th className="text-center font-semibold py-3 px-2">Lost Marks</th>
                <th className="text-center font-semibold py-3 px-2">Actual Marks</th>
                <th className="text-center font-semibold py-3 px-2">% Attempted</th>
                <th className="text-center font-semibold py-3 px-2">% Correct (Total)</th>
                <th className="text-center font-semibold py-3 px-2">% Marks Scored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjectPerformance.map((s, index) => {
                const isStrong = s.percentage >= 75;
                const isWeak   = s.percentage < 50;

                const attemptedPct = pct(s.attempted, s.totalQuestions);
                const skippedPct   = pct(s.skipped,   s.totalQuestions);
                const correctPct   = pct(s.correctCount, s.totalQuestions);
                const incorrectPct = pct(s.incorrectCount, s.totalQuestions);
                
                const scoredPct    = pct(s.scored,     s.total);
                const lostPct      = pct(s.lostMarks,  s.total);
                const actualPct    = pct(Math.max(0, s.actualMarks), s.total);

                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    {/* Subject name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColors[index % dotColors.length]}`} />
                        <span className={`font-medium ${textColors[index % textColors.length]}`}>
                          {s.subject}
                        </span>
                        {isStrong && (
                          <div title="Strong" className="ml-1 flex items-center justify-center bg-green-100 text-green-600 rounded-full w-4 h-4">
                            <Star className="h-2.5 w-2.5 fill-current" />
                          </div>
                        )}
                        {isWeak && (
                          <div title="Needs Improvement" className="ml-1 flex items-center justify-center bg-red-100 text-red-600 rounded-full w-4 h-4">
                            <AlertTriangle className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Total questions */}
                    <td className="text-center py-3 px-2 font-medium text-gray-700">{s.totalQuestions}</td>

                    {/* Attempted */}
                    <td className="text-center py-3 px-2 text-indigo-600 font-medium">
                      {s.attempted}
                    </td>

                    {/* Skipped */}
                    <td className="text-center py-3 px-2 text-gray-400">
                      {s.skipped}
                    </td>

                    {/* Correct (questions, with percentage) */}
                    <td className="text-center py-3 px-2 text-green-600 font-semibold">
                      {s.correctCount}
                      <span className="text-[10px] ml-0.5 font-normal">({correctPct}%)</span>
                    </td>

                    {/* Incorrect (questions, with percentage) */}
                    <td className="text-center py-3 px-2 text-red-500 font-semibold">
                      {s.incorrectCount}
                      <span className="text-[10px] ml-0.5 font-normal">({incorrectPct}%)</span>
                    </td>

                    {/* Positive/raw marks (with %) */}
                    <td className="text-center py-3 px-2 text-green-600 font-medium">
                      +{s.scored}
                      <span className="text-gray-400 text-[10px] ml-0.5">({scoredPct}%)</span>
                    </td>

                    {/* Lost marks (with %) */}
                    <td className="text-center py-3 px-2 text-red-500 font-medium">
                      {s.lostMarks > 0 ? `-${s.lostMarks}` : "0"}
                      <span className="text-gray-400 text-[10px] ml-0.5">({lostPct}%)</span>
                    </td>

                    {/* Actual marks (with %) */}
                    <td className={`text-center py-3 px-2 font-bold ${s.actualMarks < 0 ? "text-red-600" : "text-gray-900"}`}>
                      {s.actualMarks}
                      <span className="text-gray-400 text-[10px] ml-0.5">({actualPct}%)</span>
                    </td>

                    {/* % Attempted */}
                    <td className="py-3 px-2 min-w-[70px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-center font-medium">{attemptedPct}%</span>
                        <Progress className="h-1 bg-gray-100" value={attemptedPct} />
                      </div>
                    </td>

                    {/* % Correct (Total) */}
                    <td className="py-3 px-2 min-w-[70px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-center font-medium">{correctPct}%</span>
                        <Progress className="h-1 bg-gray-100" value={correctPct} />
                      </div>
                    </td>

                    {/* % Marks Scored */}
                    <td className="py-3 px-2 min-w-[70px]">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[10px] text-center font-medium ${actualPct >= 75 ? "text-green-600" : actualPct < 50 ? "text-red-500" : "text-blue-600"}`}>
                          {actualPct}%
                        </span>
                        <Progress className="h-1 bg-gray-100" value={actualPct} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPerformance;
