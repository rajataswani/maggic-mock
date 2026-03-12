
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, FileText, List, MessageSquare, BrainCircuit, Calendar, Braces } from "lucide-react";

const AdminDashboard = () => {
  const [questionCount, setQuestionCount] = useState(0);
  const [testResponsesCount, setTestResponsesCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [specialTestsCount, setSpecialTestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get question count
        const questionSnapshot = await getDocs(collection(db, "questions"));
        setQuestionCount(questionSnapshot.size);

        // Get test responses count
        const responsesSnapshot = await getDocs(collection(db, "testResponses"));
        setTestResponsesCount(responsesSnapshot.size);

        // Get feedback count from the correct collection name 'feedbacks'
        const feedbackSnapshot = await getDocs(collection(db, "feedbacks"));
        setFeedbackCount(feedbackSnapshot.size);
        
        // Get special tests count
        const specialTestsSnapshot = await getDocs(collection(db, "specialTests"));
        setSpecialTestsCount(specialTestsSnapshot.size);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 relative">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none transform -translate-y-1/2"></div>
      
      <div className="container mx-auto relative z-10 px-4 shrink-0">
        <h1 className="text-3xl font-bold mb-10 text-slate-100 flex items-center">
          <BrainCircuit className="h-8 w-8 mr-3 text-indigo-400" />
          Admin Dashboard
        </h1>

      {loading ? (
        <div className="text-center">Loading dashboard data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Questions
                </CardTitle>
                <FileText className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">{questionCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Test Attempts
                </CardTitle>
                <List className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">{testResponsesCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Feedbacks
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">{feedbackCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Special Tests
                </CardTitle>
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">{specialTestsCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Link to="/admin/add-question">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <FilePlus className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Add Question</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/add-pyq-question">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <Calendar className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Add PYQ</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/questions">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <FileText className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Question Bank</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/special-tests">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <BrainCircuit className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Special Tests</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/test-responses">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <List className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Responses</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/feedbacks">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-6 w-6 mb-2 text-indigo-400" />
                  <span>Feedbacks</span>
                </div>
              </Button>
            </Link>
            <Link to="/admin/json-converter">
              <Button variant="outline" className="w-full h-24 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center">
                  <Braces className="h-6 w-6 mb-2 text-emerald-400" />
                  <span>JSON Converter</span>
                </div>
              </Button>
            </Link>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
