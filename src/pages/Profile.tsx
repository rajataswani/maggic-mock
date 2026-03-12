
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestHistory {
  id: string;
  testType: string;
  paperType: string;
  year: string | null;
  totalMarks: number;
  scoredMarks: number;
  scaledMarks: number;
  timestamp: Date;
  totalTime: number;
}

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tests");

  useEffect(() => {
    if (!currentUser) return;

    const fetchTestHistory = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "testResponses"), 
          where("userId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const history: TestHistory[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          history.push({
            id: doc.id,
            testType: data.testType,
            paperType: data.paperType,
            year: data.year,
            totalMarks: data.totalMarks,
            scoredMarks: data.scoredMarks,
            scaledMarks: data.scaledMarks,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            totalTime: data.totalTime
          });
        });
        
        setTestHistory(history);
      } catch (error) {
        console.error("Error fetching test history:", error);
        toast({
          title: "Error",
          description: "Failed to load test history. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, [currentUser, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = isNaN(seconds) || seconds === undefined || seconds === null ? 0 : seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const viewTestResult = (testId: string) => {
    // We'll need to fetch the specific test result and put it in session storage
    // Then navigate to result page
    const getTestDetails = async () => {
      try {
        // Fetch the test details from Firestore
        const q = query(collection(db, "testResponses"), where("__name__", "==", testId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const testData = querySnapshot.docs[0].data();
          
          // Store in session storage for result page
          sessionStorage.setItem('testResults', JSON.stringify({
            rawMarks: testData.scoredMarks,
            lossMarks: testData.lossMarks,
            actualMarks: testData.scoredMarks,
            scaledMarks: testData.scaledMarks,
            totalMarks: testData.totalMarks,
            subjectPerformance: testData.subjectPerformance || [],
            weakSubjects: testData.weakSubjects || [],
            testResponseId: testId,
            questions: testData.questions?.map((q: any) => ({
              id: q.questionId || q.id,
              text: q.questionText || q.text,
              type: q.questionType || q.type,
              options: q.options || [],
              correctOption: q.correctOption,
              correctOptions: q.correctOptions || [],
              rangeStart: q.rangeStart,
              rangeEnd: q.rangeEnd,
              marks: q.marks,
              subject: q.subject
            })) || [],
            userAnswers: testData.questions?.map((q: any) => q.userAnswer) || [],
            questionStatus: testData.questions?.reduce((acc: any, q: any, index: number) => {
              acc[index] = q.status || "notVisited";
              return acc;
            }, {}) || {},
            timeSpent: testData.questions?.map((q: any) => q.timeSpent || 0) || [],
            paperType: testData.paperType
          }));
          
          // Navigate to the result page
          navigate('/result');
        } else {
          toast({
            title: "Test not found",
            description: "Could not find the test details. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading test details:", error);
        toast({
          title: "Error",
          description: "Failed to load test details. Please try again.",
          variant: "destructive",
        });
      }
    };

    getTestDetails();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 relative">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
                {currentUser && (
                  <p className="text-slate-400">{currentUser.email}</p>
                )}
              </div>
              <Button onClick={handleLogout} variant="outline" className="border-white/10 hover:bg-white/10 hover:text-white">Logout</Button>
            </div>
            
            <Separator className="my-6 bg-white/10" />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-slate-900 border border-slate-800">
                <TabsTrigger value="tests" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Test History</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests">
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-10 text-slate-400">
                      <p>Loading test history...</p>
                    </div>
                  ) : testHistory.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 border border-slate-800 rounded-lg">
                      <p className="text-slate-400">You haven't taken any tests yet.</p>
                      <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg hover:shadow-indigo-500/20">
                        Go to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">#</TableHead>
                            <TableHead className="text-slate-400">Paper Type</TableHead>
                            <TableHead className="text-slate-400">Test Type</TableHead>
                            <TableHead className="text-right text-slate-400">Score</TableHead>
                            <TableHead className="text-slate-400">Time Taken</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-center text-slate-400">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testHistory.map((test, index) => (
                            <TableRow key={test.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="text-slate-300">{index + 1}</TableCell>
                              <TableCell className="text-slate-300">{test.paperType}</TableCell>
                              <TableCell className="text-slate-300">
                                {test.testType === "PYQ" 
                                  ? `${test.year} PYQ` 
                                  : "Practice Test"}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium text-slate-200">
                                  {test.scoredMarks}/{test.totalMarks}
                                </span>
                                <span className="text-sm text-slate-500 ml-2">
                                  ({test.totalMarks > 0 ? Math.round((test.scoredMarks / test.totalMarks) * 100) : 0}%)
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-300">{formatTime(test.totalTime)}</TableCell>
                              <TableCell className="text-slate-300">
                                {format(test.timestamp, "dd MMM yyyy, HH:mm")}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                  onClick={() => viewTestResult(test.id)}
                                >
                                  View Result
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-6 py-4">
                  <h3 className="text-lg font-medium text-slate-200">User Information</h3>
                  <p className="text-slate-400">
                    Email: {currentUser?.email}
                  </p>
                  <p className="text-slate-400">
                    Account created: {currentUser?.metadata.creationTime ? 
                      format(new Date(currentUser.metadata.creationTime), "dd MMM yyyy") : "N/A"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
