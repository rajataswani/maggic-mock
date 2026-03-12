import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePaper } from "@/context/PaperContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FileText, Save, ArrowLeft, Upload } from "lucide-react";
import QuestionForm from "@/components/admin/specialTests/QuestionForm";
import QuestionPreview from "@/components/admin/specialTests/QuestionPreview";
import PaperSwitcher from "@/components/PaperSwitcher";
import BulkUploadDialog from "../../components/admin/BulkUploadDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PyqQuestionCreate = () => {
  const navigate = useNavigate();
  const { paperType } = usePaper();
  const { currentUser } = useAuth();
  const [year, setYear] = useState<string>("2025");
  const [set, setSet] = useState<string>("set1");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [years] = useState<string[]>(["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"]);
  const SETS = [{ value: "set1", label: "Shift 1" }, { value: "set2", label: "Shift 2" }, { value: "set3", label: "Shift 3" }];

  // Function to fetch question count for the selected year and paper type
  const fetchQuestionCount = async () => {
    try {
      if (!year || !paperType) return;
      
      const collectionName = `pyqQuestions_${paperType?.replace(" ", "_")}_${year}_${set}`;
      const q = query(collection(db, collectionName));
      const snapshot = await getDocs(q);
      setQuestionCount(snapshot.size);
    } catch (error) {
      console.error("Error fetching question count:", error);
      setQuestionCount(null);
    }
  };

  useEffect(() => {
    fetchQuestionCount();
  }, [year, set, paperType]);

  const handlePreview = (data: any) => {
    setFormData(data);
    setPreviewOpen(true);
  };

  const calculateNegativeMarks = () => {
    if (!formData) return 0;
    
    if (formData.questionType === "MCQ") {
      return formData.marks === "1" ? -0.33 : -0.66;
    } else {
      return 0;
    }
  };

  const handleSubmit = async () => {
    if (!formData || !year || !paperType) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate form data based on question type
      if (formData.questionType === "MCQ" || formData.questionType === "MSQ") {
        const filledOptions = (formData.options || []).filter((opt: string) => opt.trim() !== "");
        if (filledOptions.length < 2) {
          toast({
            title: "Error",
            description: "At least two options are required",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (formData.questionType === "MCQ" && !formData.correctOption) {
          toast({
            title: "Error",
            description: "Please select a correct option",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (formData.questionType === "MSQ" && (!formData.correctOptions || formData.correctOptions.length === 0)) {
          toast({
            title: "Error",
            description: "Please select at least one correct option",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      if (formData.questionType === "NAT" && (!formData.rangeStart || !formData.rangeEnd)) {
        toast({
          title: "Error",
          description: "Please provide both range values for NAT question",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const negativeMark = calculateNegativeMarks();
      
      const questionObj: any = {
        text: formData.questionText,
        type: formData.questionType,
        marks: parseInt(formData.marks),
        negativeMark,
        subject: formData.subject,
        paperType,
        addedBy: currentUser?.email || "unknown",
        difficultyLevel: formData.difficultyLevel || 3,
      };
      
      if (formData.imageUrl) {
        questionObj.imageUrl = formData.imageUrl;
      }
      
      if (formData.questionType === "MCQ" || formData.questionType === "MSQ") {
        const validOptions = (formData.options || [])
          .filter((opt: string) => opt.trim() !== "")
          .map((text: string, i: number) => ({ id: String.fromCharCode(97 + i), text }));
          
        questionObj.options = validOptions;
        
        if (formData.questionType === "MCQ") {
          questionObj.correctOption = formData.correctOption;
        } else {
          questionObj.correctOptions = formData.correctOptions;
        }
      } else if (formData.questionType === "NAT") {
        questionObj.rangeStart = parseFloat(formData.rangeStart || "0");
        questionObj.rangeEnd = parseFloat(formData.rangeEnd || "0");
      }
      
      // Specific collection for PYQ questions (with shift/set)
      const collectionName = `pyqQuestions_${paperType?.replace(" ", "_")}_${year}_${set}`;
      
      await addDoc(collection(db, collectionName), questionObj);
      setFormData(null);
      setPreviewOpen(false);
      toast({
        title: "Success",
        description: `Question added to ${paperType} ${year} ${SETS.find(s => s.value === set)?.label || set}`,
      });
      fetchQuestionCount();
      
    } catch (error) {
      console.error("Error adding PYQ question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add PYQ Question</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => setBulkUploadOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload JSON
          </Button>
          <PaperSwitcher />
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New PYQ Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="set">Shift / Set</Label>
                    <Select value={set} onValueChange={setSet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {SETS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paperType">Paper Type</Label>
                    <div className="h-10 px-4 py-2 border rounded-md flex items-center">
                      {paperType || "Not selected"}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <QuestionForm 
                paperType={paperType || "GATE CS"}
                onPreview={handlePreview}
                onCancel={() => navigate("/admin")}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>PYQ Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year &amp; Shift:</span>
                </div>
                <span className="font-medium">{year} · {SETS.find(s => s.value === set)?.label || set}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Paper Type:</span>
                </div>
                <span className="font-medium">{paperType}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Question Count:</span>
                <span className="font-medium">{questionCount !== null ? questionCount : "Loading..."}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target Count:</span>
                <span className="font-medium">65</span>
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                <p>Add all 65 questions for the complete PYQ paper.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {formData && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
              <DialogDescription>
                Review the question before adding it to {paperType} {year} PYQ
              </DialogDescription>
            </DialogHeader>
            
            <QuestionPreview 
              questionType={formData.questionType}
              questionText={formData.questionText}
              imageUrl={formData.imageUrl || ""}
              options={formData.options}
              correctOption={formData.correctOption}
              correctOptions={formData.correctOptions}
              rangeStart={formData.rangeStart}
              rangeEnd={formData.rangeEnd}
              subject={formData.subject}
              marks={formData.marks}
              negativeMark={calculateNegativeMarks()}
              difficultyLevel={formData.difficultyLevel || 3}
              onSave={handleSubmit}
              onEdit={() => setPreviewOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      <BulkUploadDialog 
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        paperType={paperType || "GATE CS"}
        collectionName={`pyqQuestions_${paperType?.replace(" ", "_")}_${year}_${set}`}
        onSuccess={() => fetchQuestionCount()}
        maxLimit={65}
        currentCount={questionCount || 0}
      />
    </div>
  );
};

export default PyqQuestionCreate;
