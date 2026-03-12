import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload, Check, FileJson } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { QuestionType } from "@/lib/types";
import { gateCSSubjects, gateDASubjects } from "@/constants/subjects";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperType: string;
  collectionName: string;
  onSuccess: (count: number) => void;
  maxLimit?: number;
  currentCount?: number;
  specialTestId?: string;
}

const BulkUploadDialog = ({ 
  open, 
  onOpenChange, 
  paperType, 
  collectionName,
  onSuccess,
  maxLimit,
  currentCount = 0,
  specialTestId
}: BulkUploadDialogProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const validSubjects = paperType === "GATE CS" ? gateCSSubjects : gateDASubjects;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setJsonInput(content);
          handleParseJson(content);
        } catch (err) {
          setError("Failed to read file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const calculateNegativeMarks = (type: string, marks: number) => {
    if (type === "MCQ") {
      return marks === 1 ? -0.33 : -0.66;
    }
    return 0;
  };

  const handleParseJson = (inputToParse: string = jsonInput) => {
    setError(null);
    try {
      const parsed = JSON.parse(inputToParse);
      
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of question objects.");
      }

      if (parsed.length === 0) {
        throw new Error("JSON array is empty.");
      }

      if (maxLimit && currentCount + parsed.length > maxLimit) {
        throw new Error(`Cannot upload ${parsed.length} questions. You only have space for ${maxLimit - currentCount} more questions in this test.`);
      }

      // Validate each question against our strict schema rules
      const validatedQuestions = parsed.map((q: any, index: number) => {
        if (!q.text && !q.imageUrl) throw new Error(`Question ${index + 1}: Missing 'text' property (or provide an 'imageUrl' instead).`);
        if (!["MCQ", "MSQ", "NAT"].includes(q.type)) throw new Error(`Question ${index + 1}: Invalid 'type'. Must be MCQ, MSQ, or NAT.`);
        if (!q.marks || (q.marks !== 1 && q.marks !== 2)) throw new Error(`Question ${index + 1}: 'marks' must be 1 or 2.`);
        
        // Subject Matching Logic
        if (!q.subject) throw new Error(`Question ${index + 1}: Missing 'subject'.`);
        const matchedSubject = validSubjects.find(s => s.toLowerCase() === q.subject.toLowerCase());
        if (!matchedSubject) {
          throw new Error(`Question ${index + 1}: Invalid subject "${q.subject}". Expected one of: ${validSubjects.join(", ")}`);
        }

        // Type-specific validations
        if (q.type === "MCQ") {
          if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Question ${index + 1} (MCQ): Must provide an 'options' array with at least 2 items.`);
          if (!q.correctOption) throw new Error(`Question ${index + 1} (MCQ): Missing 'correctOption' (e.g. "a", "b").`);
        } else if (q.type === "MSQ") {
          if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Question ${index + 1} (MSQ): Must provide an 'options' array with at least 2 items.`);
          if (!Array.isArray(q.correctOptions) || q.correctOptions.length === 0) throw new Error(`Question ${index + 1} (MSQ): Missing 'correctOptions' array (e.g. ["a", "b"]).`);
        } else if (q.type === "NAT") {
          if (typeof q.rangeStart !== "number" || typeof q.rangeEnd !== "number") throw new Error(`Question ${index + 1} (NAT): Must provide numeric 'rangeStart' and 'rangeEnd'.`);
        }

        // Assemble the final sanitized object
        const sanitizedData: any = {
          text: q.text || "",
          type: q.type as QuestionType,
          marks: Number(q.marks),
          subject: matchedSubject,
          difficultyLevel: q.difficultyLevel || 3,
          negativeMark: calculateNegativeMarks(q.type, Number(q.marks)),
          imageUrl: q.imageUrl || null,
          addedBy: currentUser?.email || "unknown",
          paperType: paperType,
        };

        if (q.type === "MCQ") {
          // Support both plain string options ("A") and object options ({id, text})
          sanitizedData.options = q.options.map((opt: any, i: number) => ({
            id: String.fromCharCode(97 + i),
            text: typeof opt === "string" ? opt : opt.text,
          }));
          sanitizedData.correctOption = q.correctOption.toLowerCase();
        } else if (q.type === "MSQ") {
          sanitizedData.options = q.options.map((opt: any, i: number) => ({
            id: String.fromCharCode(97 + i),
            text: typeof opt === "string" ? opt : opt.text,
          }));
          sanitizedData.correctOptions = q.correctOptions.map((c: string) => c.toLowerCase());
        } else if (q.type === "NAT") {
          sanitizedData.rangeStart = Number(q.rangeStart);
          sanitizedData.rangeEnd = Number(q.rangeEnd);
        }

        return sanitizedData;
      });

      setParsedQuestions(validatedQuestions);
      setPreviewMode(true);
      
    } catch (err: any) {
      setError(err.message || "Invalid JSON format.");
      setParsedQuestions([]);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      for (const q of parsedQuestions) {
        const questionPayload = {
          ...q,
          timestamp: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, collectionName), questionPayload);
        
        // If this originates from a SpecialTest, actively bind the newly generated ID directly to the test's nested array.
        if (specialTestId) {
          await updateDoc(doc(db, "specialTests", specialTestId), {
            questions: arrayUnion({
              id: docRef.id,
              ...questionPayload
            })
          });
        }
      }
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${parsedQuestions.length} questions.`,
      });
      
      onSuccess(parsedQuestions.length);
      onOpenChange(false);
      
      // Reset
      setJsonInput("");
      setParsedQuestions([]);
      setPreviewMode(false);
    } catch (err: any) {
      console.error("Bulk upload error:", err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload questions to database.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setPreviewMode(false);
    setParsedQuestions([]);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open && !isUploading) { 
        resetDialog();
        setJsonInput("");
        onOpenChange(false);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Questions
          </DialogTitle>
          <DialogDescription>
            Validates and uploads an entire JSON array of questions explicitly matched against your current Paper Type schema.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!previewMode ? (
          <div className="flex-1 overflow-auto py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Paste JSON Array:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  id="json-upload" 
                  onChange={handleFileUpload} 
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('json-upload')?.click()}>
                  <FileJson className="h-4 w-4 mr-2" /> Select .json File
                </Button>
              </div>
            </div>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[ { "text": "Sample question?", "type": "MCQ", "marks": 1, "subject": "Aptitude", "options": ["Option A", "Option B"], "correctOption": "a" } ]'
              className="font-mono text-sm min-h-[300px]"
            />
          </div>
        ) : (
          <div className="flex-1 w-full overflow-y-auto border rounded-md p-4 bg-gray-50 min-h-0">
            <div className="space-y-6">
              <div className="font-medium text-lg sticky top-0 bg-gray-50 pb-2 border-b z-10 flex justify-between items-center">
                <span>Previewing {parsedQuestions.length} Validated Questions</span>
                <Badge variant="outline" className="bg-white">{collectionName}</Badge>
              </div>
              
              {parsedQuestions.map((q, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-semibold text-gray-900 leading-tight flex-1">
                      <span className="text-gray-400 mr-2">Q{idx + 1}.</span> 
                      {q.text}
                    </h4>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{q.type}</Badge>
                      <Badge variant="outline" className="bg-gray-50">{q.subject}</Badge>
                    </div>
                  </div>

                  {q.imageUrl && (
                    <img src={q.imageUrl} alt={`Q${idx + 1} Image`} className="max-h-32 object-contain border rounded p-1" />
                  )}

                  <div className="text-sm bg-gray-50 p-3 rounded border">
                    {(q.type === "MCQ" || q.type === "MSQ") && (
                      <div className="space-y-1">
                        <span className="font-medium text-gray-500 mb-2 block">Parsed Options:</span>
                        {q.options.map((opt: any) => {
                          const isCorrect = q.type === "MCQ" ? q.correctOption === opt.id : q.correctOptions.includes(opt.id);
                          return (
                            <div key={opt.id} className={`flex gap-2 p-1.5 rounded ${isCorrect ? 'bg-green-100 border border-green-200 font-medium' : ''}`}>
                              <span className="uppercase text-gray-500 w-5">{opt.id}.</span> 
                              <span>{opt.text}</span>
                              {isCorrect && <Check className="h-4 w-4 text-green-600 ml-auto" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {q.type === "NAT" && (
                      <div>
                        <span className="font-medium text-gray-500 mr-2">Accepted Range:</span>
                        <span className="font-mono font-medium text-indigo-700">{q.rangeStart}</span> to <span className="font-mono font-medium text-indigo-700">{q.rangeEnd}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 pt-2 border-t mt-2 border-gray-100">
                    <div className="flex gap-1 items-center"><span className="font-medium">Marks:</span> {q.marks}</div>
                    <div className="flex gap-1 items-center"><span className="font-medium">Negative:</span> {q.negativeMark}</div>
                    <div className="flex gap-1 items-center"><span className="font-medium">Difficulty:</span> {q.difficultyLevel}/5</div>
                    <div className="flex gap-1 items-center"><span className="font-medium">Paper:</span> {q.paperType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => !previewMode ? onOpenChange(false) : resetDialog()} disabled={isUploading}>
            {previewMode ? "Edit JSON" : "Cancel"}
          </Button>
          {!previewMode ? (
            <Button onClick={() => handleParseJson()} disabled={!jsonInput.trim()}>
              Verify & Preview
            </Button>
          ) : (
            <Button onClick={handleUpload} disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : `Commit ${parsedQuestions.length} Questions Database`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
