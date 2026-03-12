
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Question, TestParams } from "@/lib/types";
import { generateSpecialTest } from "@/services/testService";

export const useTestLoader = (year: string | undefined, paperType: string | null, testId?: string | undefined, set?: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<(string | string[] | null)[]>([]);
  const [timeSpent, setTimeSpent] = useState<number[]>([]);
  const [questionStatus, setQuestionStatus] = useState<Record<number, string>>({});
  const [remainingTime, setRemainingTime] = useState<number>(10800);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<string>("Full Syllabus");

  useEffect(() => {
    const loadTest = async () => {
      try {
        let testParams: TestParams | null = null;
        const params = new URLSearchParams(window.location.search);
        
        // Get testId from params if not passed directly
        const specialTestId = testId || (window.location.pathname.includes('/test/special/') 
          ? window.location.pathname.split('/test/special/')[1]
          : null);
        
        console.log("URL pathname:", window.location.pathname);
        console.log("Extracted testId from URL:", specialTestId);
        
        const storedParams = sessionStorage.getItem('testParams');
        
        if (storedParams) {
          testParams = JSON.parse(storedParams);
          sessionStorage.removeItem('testParams');
          console.log("Using stored test parameters:", testParams);
        } 
        
        // Handle special test case
        else if (specialTestId) {
          console.log("Loading special test with ID:", specialTestId);
          const specialTestParams = await generateSpecialTest(specialTestId);
          
          if (specialTestParams && specialTestParams.questions && specialTestParams.questions.length > 0) {
            console.log("Special test loaded successfully:", specialTestParams);
            testParams = specialTestParams;
          } else {
            console.error("Failed to load special test or no questions found");
            setError("Failed to load special test. Please try again.");
            toast({
              title: "Error",
              description: "Failed to load special test or no questions found. Please try again.",
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
        }
        // Handle PYQ test case
        else if (year) {
          const baseType = paperType?.replace(" ", "_");
          // New format: pyqQuestions_GATE_CS_2020_set1
          // Legacy fallback: pyqQuestions_GATE_CS_2020
          const collectionName = set
            ? `pyqQuestions_${baseType}_${year}_${set}`
            : `pyqQuestions_${baseType}_${year}`;

          console.log("Loading PYQ test from collection:", collectionName);
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          const fetchedQuestions: Question[] = [];
          querySnapshot.forEach((doc) => {
            fetchedQuestions.push({ id: doc.id, ...doc.data() } as Question);
          });

          // Legacy fallback: if new format returned nothing, try old format
          if (fetchedQuestions.length === 0 && set) {
            const legacyCollection = `pyqQuestions_${baseType}_${year}`;
            console.log("No questions found in new format, trying legacy:", legacyCollection);
            const legacySnapshot = await getDocs(query(collection(db, legacyCollection)));
            legacySnapshot.forEach((doc) => {
              fetchedQuestions.push({ id: doc.id, ...doc.data() } as Question);
            });
          }

          const shiftLabel = set ? ` Shift ${set.replace('set', '')}` : '';
          
          if (fetchedQuestions.length === 0) {
            setError("No questions found");
            toast({
              title: "No questions found",
              description: `No questions found for ${paperType} ${year}${shiftLabel}. Please try another paper.`,
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
          
          if (fetchedQuestions.length < 65) {
            toast({
              title: "Insufficient questions",
              description: `Only ${fetchedQuestions.length}/65 questions available for ${paperType} ${year}${shiftLabel}.`,
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
          
          const selectedQuestions = fetchedQuestions.slice(0, 65);
          testParams = {
            questions: selectedQuestions,
            duration: 180,
            testType: "PYQ"
          };
        } else {
          setError("No test parameters found");
          toast({
            title: "Error",
            description: "No test parameters found. Returning to dashboard.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        if (testParams && testParams.questions && testParams.questions.length > 0) {
          console.log(`Setting up test with ${testParams.questions.length} questions`);
          setQuestions(testParams.questions);
          setRemainingTime(testParams.duration * 60); // Convert minutes to seconds
          setTestType(testParams.testType);
          
          const answers = Array(testParams.questions.length).fill(null);
          setUserAnswers(answers);
          setTimeSpent(Array(testParams.questions.length).fill(0));
          setQuestionStatus(
            Array(testParams.questions.length)
              .fill(0)
              .reduce((acc, _, index) => ({ ...acc, [index]: "notVisited" }), {})
          );
        } else {
          console.error("Invalid test parameters:", testParams);
          setError("Invalid test parameters");
          toast({
            title: "Error",
            description: "Invalid test parameters or no questions found. Returning to dashboard.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading test:", error);
        setError("Failed to load test");
        toast({
          title: "Error",
          description: "Failed to load test data. Please try again.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };
    
    loadTest();
  }, [year, set, paperType, toast, navigate, testId]);

  return {
    questions,
    loading,
    userAnswers,
    setUserAnswers,
    timeSpent,
    setTimeSpent,
    questionStatus,
    setQuestionStatus,
    remainingTime,
    setRemainingTime,
    error,
    testType
  };
};
