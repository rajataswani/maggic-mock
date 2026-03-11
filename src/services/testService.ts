import { Question, TestParams } from "@/lib/types";
import { fetchQuestions, shuffleArray } from "@/utils/test-utils";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Subject weightage for full-length test (100 marks total)
const SUBJECT_WEIGHTAGE = {
  "Programming & Data Structure": 10,
  "Algorithms": 7,
  "Operating Systems": 9,
  "DBMS": 7,
  "Computer Networks": 8,
  "COA": 10, // Computer Organization & Architecture
  "Discrete Mathematics": 11,
  "Theory of Computation": 8,
  "Compiler Design": 6,
  "Digital Logic": 5,
  "Engineering Mathematics": 4,
  "Aptitude": 15
};

// Process questions and prepare them for test
export const processQuestions = async (
  questions: Question[],
  numQuestions: number,
  duration: number,
  selectedTestType: string
): Promise<TestParams | null> => {
  if (questions.length === 0) {
    return null;
  }
  
  const shuffledQuestions = shuffleArray(questions);
  const selectedQuestions = shuffledQuestions.slice(0, numQuestions);
  
  const testParams: TestParams = {
    questions: selectedQuestions,
    duration: duration,
    testType: selectedTestType
  };
  
  return testParams;
};

// Generate full syllabus test with subject weightage
export const generateFullSyllabusTest = async (
  paperType: string,
  numQuestions: number = 65,
  duration: number = 180
): Promise<TestParams | null> => {
  try {
    console.log(`Generating full syllabus test for ${paperType} with ${numQuestions} questions`);
    
    // First, get all questions from the database for the paper type
    const questionsRef = collection(db, "questions");
    const q = query(
      questionsRef,
      where("paperType", "==", paperType)
    );
    
    const querySnapshot = await getDocs(q);
    const allQuestions: Question[] = [];
    
    querySnapshot.forEach(doc => {
      allQuestions.push({ id: doc.id, ...doc.data() } as Question);
    });
    
    console.log(`Retrieved total of ${allQuestions.length} questions for ${paperType}`);
    
    // Default configuration for a 65 Question test:
    // 30 questions of 1 mark, 35 questions of 2 marks
    // Aptitude exactly 5x1M, 5x2M (Sequence: 1. 1M Aptitude, 2. 2M Aptitude)
    // Technical exactly 25x1M, 30x2M (Sequence: 3. 1M Tech, 4. 2M Tech)
    if (numQuestions === 65) {
      const aptOneMarkQuota = 5;
      const aptTwoMarkQuota = 5;
      const techOneMarkQuota = 25;
      const techTwoMarkQuota = 30;

      // Group available questions into buckets
      let availableAptOneMark = allQuestions.filter(q => q.subject.toLowerCase() === "aptitude" && q.marks === 1);
      let availableAptTwoMark = allQuestions.filter(q => q.subject.toLowerCase() === "aptitude" && q.marks === 2);
      let availableTechOneMark = allQuestions.filter(q => q.subject.toLowerCase() !== "aptitude" && q.marks === 1);
      let availableTechTwoMark = allQuestions.filter(q => q.subject.toLowerCase() !== "aptitude" && q.marks === 2);

      // Verify we have enough aptitude questions. If not, just warn but we will grab whatever we can.
      const selectedAptOneMark = shuffleArray(availableAptOneMark).slice(0, aptOneMarkQuota);
      const selectedAptTwoMark = shuffleArray(availableAptTwoMark).slice(0, aptTwoMarkQuota);
      
      // Calculate how many questions to fetch from each Technical subject based on weightage
      const techSubjects = Object.keys(SUBJECT_WEIGHTAGE).filter(s => s.toLowerCase() !== "aptitude");
      // Calculate total weight of technical subjects to find proportions
      const totalTechWeight = techSubjects.reduce((sum, subject) => sum + (SUBJECT_WEIGHTAGE[subject as keyof typeof SUBJECT_WEIGHTAGE] || 0), 0);

      const selectedTechOneMark: Question[] = [];
      const selectedTechTwoMark: Question[] = [];
      
      // We will try to fulfill exact proportional pools, keeping track of deficits.
      let remainingTechOneMarkQuota = techOneMarkQuota;
      let remainingTechTwoMarkQuota = techTwoMarkQuota;

      // Group available tech questions by subject for Pass 1
      const techOneMarkBySubject: Record<string, Question[]> = {};
      const techTwoMarkBySubject: Record<string, Question[]> = {};
      
      availableTechOneMark.forEach(q => {
        if (!techOneMarkBySubject[q.subject]) techOneMarkBySubject[q.subject] = [];
        techOneMarkBySubject[q.subject].push(q);
      });
      availableTechTwoMark.forEach(q => {
        if (!techTwoMarkBySubject[q.subject]) techTwoMarkBySubject[q.subject] = [];
        techTwoMarkBySubject[q.subject].push(q);
      });

      // Pass 1: Proportional distribution
      for (const subject of techSubjects) {
        const weightage = SUBJECT_WEIGHTAGE[subject as keyof typeof SUBJECT_WEIGHTAGE] || 0;
        
        // Approximate proportion out of the remaining quotas
        // We know total technical weight is about 85 out of 100.
        // We want 25 1M and 30 2M total.
        const proportion = weightage / totalTechWeight;
        let target1M = Math.round(techOneMarkQuota * proportion);
        let target2M = Math.round(techTwoMarkQuota * proportion);

        // Cap slightly so we don't accidentally over-allocate due to rounding
        target1M = Math.min(target1M, remainingTechOneMarkQuota);
        target2M = Math.min(target2M, remainingTechTwoMarkQuota);

        const availableSubj1M = shuffleArray(techOneMarkBySubject[subject] || []);
        const availableSubj2M = shuffleArray(techTwoMarkBySubject[subject] || []);

        const takenSubj1M = availableSubj1M.slice(0, target1M);
        const takenSubj2M = availableSubj2M.slice(0, target2M);

        selectedTechOneMark.push(...takenSubj1M);
        selectedTechTwoMark.push(...takenSubj2M);

        remainingTechOneMarkQuota -= takenSubj1M.length;
        remainingTechTwoMarkQuota -= takenSubj2M.length;

        // Remove taken questions from our global pool fallback array
        availableTechOneMark = availableTechOneMark.filter(q => !takenSubj1M.find(t => t.id === q.id));
        availableTechTwoMark = availableTechTwoMark.filter(q => !takenSubj2M.find(t => t.id === q.id));
      }

      // Pass 2: Greedly fill any deficit from remaining pools regardless of subject
      if (remainingTechOneMarkQuota > 0) {
        const fallback = shuffleArray(availableTechOneMark).slice(0, remainingTechOneMarkQuota);
        selectedTechOneMark.push(...fallback);
      }
      if (remainingTechTwoMarkQuota > 0) {
        const fallback = shuffleArray(availableTechTwoMark).slice(0, remainingTechTwoMarkQuota);
        selectedTechTwoMark.push(...fallback);
      }

      // Final shuffle inside their respective buckets
      shuffleArray(selectedAptOneMark);
      shuffleArray(selectedAptTwoMark);
      shuffleArray(selectedTechOneMark);
      shuffleArray(selectedTechTwoMark);

      // Concatenate strictly in requested order
      let finalQuestions: Question[] = [
        ...selectedAptOneMark,
        ...selectedAptTwoMark,
        ...selectedTechOneMark,
        ...selectedTechTwoMark
      ];

      // Verify the total marks and question counts
      let totalMarks = 0;
      let oneMarkCount = 0;
      let twoMarkCount = 0;
      
      finalQuestions.forEach(q => {
        totalMarks += q.marks;
        if (q.marks === 1) oneMarkCount++;
        if (q.marks === 2) twoMarkCount++;
      });
      console.log(`Generated strict full length test with ${finalQuestions.length} questions (${oneMarkCount}x1M, ${twoMarkCount}x2M) for ${totalMarks} total marks`);

      return {
        questions: finalQuestions,
        duration: duration,
        testType: "Full Syllabus"
      };

    } else {
        // Fallback for non-65 question requests: Basic shuffling
        // Kept for backward compatibility if user changes default value
        const shuffledQuestions = shuffleArray(allQuestions);
        const finalQuestions = shuffledQuestions.slice(0, numQuestions);
        
        return {
          questions: finalQuestions,
          duration: duration,
          testType: "Full Syllabus"
        };
    }
  } catch (error) {
    console.error("Error generating full syllabus test:", error);
    return null;
  }
};

// Helper function to fetch questions for a subject with specific marks
async function fetchQuestionsForSubject(
  paperType: string,
  subject: string,
  marks: number,
  count: number
): Promise<Question[]> {
  try {
    const questionsRef = collection(db, "questions");
    const q = query(
      questionsRef,
      where("paperType", "==", paperType),
      where("subject", "==", subject),
      where("marks", "==", marks)
    );
    
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() } as Question);
    });
    
    // Shuffle and take only what we need
    return shuffleArray(questions).slice(0, count);
  } catch (error) {
    console.error(`Error fetching ${marks}-mark questions for ${subject}:`, error);
    return [];
  }
}

// Generate subject wise test
export const generateSubjectWiseTest = async (
  paperType: string,
  subject: string,
  numQuestions: number,
  duration: number
): Promise<TestParams | null> => {
  const questions = await fetchQuestions("Subject Wise", paperType, { 
    subject: subject 
  });
  return processQuestions(questions, numQuestions, duration, "Subject Wise");
};

// Generate multi-subject test
export const generateMultiSubjectTest = async (
  paperType: string,
  subjects: string[],
  numQuestions: number,
  duration: number
): Promise<TestParams | null> => {
  const questions = await fetchQuestions("Multi-Subject Test", paperType, {
    subjects: subjects
  });
  return processQuestions(questions, numQuestions, duration, "Multi-Subject Test");
};

// Generate special test
export const generateSpecialTest = async (
  testId: string
): Promise<TestParams | null> => {
  try {
    console.log("Generating special test with ID:", testId);
    const testDocRef = doc(db, "specialTests", testId);
    const testSnapshot = await getDoc(testDocRef);
    
    if (!testSnapshot.exists()) {
      console.error("Special test not found with ID:", testId);
      return null;
    }
    
    const testData = testSnapshot.data();
    console.log("Test data retrieved:", testData);
    
    // Check if the test has questions directly embedded
    if (testData.questions && Array.isArray(testData.questions) && testData.questions.length > 0) {
      console.log(`Using ${testData.questions.length} embedded questions for special test`);
      
      // Validate that each question has the required fields
      const validQuestions = testData.questions.filter((q: any) => 
        q && q.text && q.type && (q.type === 'MCQ' || q.type === 'MSQ' || q.type === 'NAT')
      );
      
      if (validQuestions.length === 0) {
        console.error("No valid questions found in special test data");
        return null;
      }
      
      const testParams: TestParams = {
        questions: validQuestions as Question[],
        duration: testData.duration || 60, // Default 60 minutes if not specified
        testType: "Special Test"
      };
      
      console.log("Successfully prepared special test with questions:", validQuestions.length);
      return testParams;
    }
    
    // If no embedded questions, try to fetch from subcollection
    console.log("No embedded questions found, checking questions subcollection");
    const questionsCollectionRef = collection(db, `specialTests/${testId}/questions`);
    const questionsSnapshot = await getDocs(questionsCollectionRef);
    
    if (questionsSnapshot.empty) {
      console.error("No questions found in special test with ID:", testId);
      return null;
    }
    
    const questions: Question[] = [];
    questionsSnapshot.forEach(doc => {
      const questionData = doc.data();
      questions.push({ 
        id: doc.id, 
        ...questionData 
      } as Question);
    });
    
    console.log(`Successfully loaded ${questions.length} questions for special test`);
    
    const testParams: TestParams = {
      questions: questions,
      duration: testData.duration || 60, // Default 60 minutes if not specified
      testType: "Special Test"
    };
    
    return testParams;
  } catch (error) {
    console.error("Error generating special test:", error);
    return null;
  }
};
