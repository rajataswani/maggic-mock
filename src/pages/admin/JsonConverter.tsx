import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Copy, Check, Trash2, ClipboardPaste, Loader2, Image as ImageIcon, Braces } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBJECTS } from "@/constants/subjects";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

type QuestionType = "MCQ" | "MSQ" | "NAT";

interface Option {
  id: string;
  text: string;
}

interface QuestionEntry {
  text?: string;
  imageUrl?: string;
  type: QuestionType;
  marks: number;
  subject: string;
  difficultyLevel: number;
  options?: Option[];
  correctOption?: string;
  correctOptions?: string[];
  rangeStart?: number;
  rangeEnd?: number;
}

const DEFAULT_OPTIONS: Option[] = [
  { id: "a", text: "A" },
  { id: "b", text: "B" },
  { id: "c", text: "C" },
  { id: "d", text: "D" },
];

const MARKS_OPTIONS = [1, 2];
const OPTION_IDS = ["a", "b", "c", "d"];

export default function JsonConverter() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("MCQ");
  const [marks, setMarks] = useState(1);
  const [subject, setSubject] = useState("Aptitude");
  const [options, setOptions] = useState<Option[]>([...DEFAULT_OPTIONS]);
  const [correctOption, setCorrectOption] = useState("");
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // Cloudinary upload state
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // JSON output state
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Handle paste event for image upload
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!isListening) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          setIsUploading(true);
          setIsListening(false);

          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "form_uploads");

            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: "POST", body: formData }
            );

            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json();

            setImageUrl(data.secure_url);
            setImagePreview(data.secure_url);
            toast({ title: "Image uploaded!", description: "Preview shown below the image field." });
          } catch (err) {
            toast({ title: "Upload failed", description: "Could not upload image to Cloudinary.", variant: "destructive" });
          } finally {
            setIsUploading(false);
          }
          break;
        }
      }
    },
    [isListening, toast]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // Reset to smart defaults after adding
  const resetForm = () => {
    setQuestionText("");
    setImageUrl("");
    setImagePreview("");
    setOptions([...DEFAULT_OPTIONS]);
    setCorrectOption("");
    setCorrectOptions([]);
    setRangeStart("");
    setRangeEnd("");
    // Keep type, marks, subject as-is for speed
  };

  const toggleMSQOption = (id: string) => {
    setCorrectOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const buildQuestionObject = (): QuestionEntry | null => {
    // XOR validation: at least one of text or imageUrl
    if (!questionText.trim() && !imageUrl.trim()) {
      toast({
        title: "Question content required",
        description: "Please enter question text OR paste an image — at least one is required.",
        variant: "destructive",
      });
      return null;
    }

    // Type-specific validation
    if (questionType === "MCQ") {
      if (!correctOption) {
        toast({ title: "Correct option required", description: "Select the correct answer for MCQ.", variant: "destructive" });
        return null;
      }
      if (options.some((o) => !o.text.trim())) {
        toast({ title: "Fill all options", description: "All 4 option values are required for MCQ.", variant: "destructive" });
        return null;
      }
    }

    if (questionType === "MSQ") {
      if (correctOptions.length === 0) {
        toast({ title: "Correct options required", description: "Select at least one correct option for MSQ.", variant: "destructive" });
        return null;
      }
      if (options.some((o) => !o.text.trim())) {
        toast({ title: "Fill all options", description: "All 4 option values are required for MSQ.", variant: "destructive" });
        return null;
      }
    }

    if (questionType === "NAT") {
      if (rangeStart === "" || rangeEnd === "") {
        toast({ title: "Range required", description: "Both rangeStart and rangeEnd are required for NAT.", variant: "destructive" });
        return null;
      }
    }

    const entry: QuestionEntry = {
      type: questionType,
      marks,
      subject,
      difficultyLevel: 3,
    };

    if (questionText.trim()) entry.text = questionText.trim();
    if (imageUrl.trim()) entry.imageUrl = imageUrl.trim();

    if (questionType === "MCQ" || questionType === "MSQ") {
      entry.options = options.map((o) => ({ id: o.id, text: o.text }));
    }

    if (questionType === "MCQ") {
      entry.correctOption = correctOption;
    }

    if (questionType === "MSQ") {
      entry.correctOptions = correctOptions;
    }

    if (questionType === "NAT") {
      entry.rangeStart = parseFloat(rangeStart);
      entry.rangeEnd = parseFloat(rangeEnd);
    }

    return entry;
  };

  const handleAddQuestion = () => {
    const entry = buildQuestionObject();
    if (!entry) return;

    setQuestions((prev) => [...prev, entry]);
    toast({ title: `Question ${questions.length + 1} added!`, description: "JSON updated on the right." });
    resetForm();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "JSON copied to clipboard." });
  };

  const handleClear = () => {
    setQuestions([]);
    toast({ title: "Cleared", description: "JSON output has been reset." });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Braces className="h-7 w-7 text-indigo-400" />
              JSON Converter
            </h1>
            <p className="text-slate-400 text-sm mt-1">Build bulk-upload JSON question by question. Nothing is saved to the database.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ── Left Panel: Form ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-white/10 pb-3">Question Details</h2>

            {/* Question Text */}
            <div className="space-y-2">
              <Label className="text-slate-300">Question Text <span className="text-slate-500 text-xs">(XOR with image)</span></Label>
              <Textarea
                placeholder="Type the question here..."
                className="bg-slate-900 border-white/10 text-slate-100 placeholder:text-slate-600 min-h-[80px] resize-none focus-visible:ring-indigo-500"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            {/* Image URL with paste button */}
            <div className="space-y-2">
              <Label className="text-slate-300">
                Question Image <span className="text-slate-500 text-xs">(XOR with text)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={imageUrl}
                  placeholder="Image URL auto-filled after paste..."
                  className="bg-slate-900 border-white/10 text-slate-400 text-xs focus-visible:ring-indigo-500 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsListening((v) => !v); }}
                  disabled={isUploading}
                  className={`border-white/10 transition-all shrink-0 ${
                    isListening
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 animate-pulse"
                      : "text-slate-300 hover:bg-white/10 bg-transparent"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ClipboardPaste className="h-4 w-4 mr-1" />
                      {isListening ? "Listening…" : "Paste Image"}
                    </>
                  )}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 shrink-0"
                    onClick={() => { setImageUrl(""); setImagePreview(""); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isListening && !isUploading && (
                <p className="text-xs text-indigo-400 flex items-center gap-1">
                  <ClipboardPaste className="h-3 w-3" /> Press Ctrl+V to paste your screenshot/image now
                </p>
              )}
              {imagePreview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-slate-900 p-2">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Image preview</p>
                  <img src={imagePreview} alt="Uploaded question" className="max-h-48 object-contain rounded" />
                </div>
              )}
            </div>

            {/* Type / Marks / Subject — row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Type *</Label>
                <Select value={questionType} onValueChange={(v) => { setQuestionType(v as QuestionType); setCorrectOption(""); setCorrectOptions([]); }}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-slate-100 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                    <SelectItem value="MCQ">MCQ</SelectItem>
                    <SelectItem value="MSQ">MSQ</SelectItem>
                    <SelectItem value="NAT">NAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Marks *</Label>
                <Select value={String(marks)} onValueChange={(v) => setMarks(Number(v))}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-slate-100 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                    {MARKS_OPTIONS.map((m) => (
                      <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-slate-100 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options — MCQ / MSQ */}
            {(questionType === "MCQ" || questionType === "MSQ") && (
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm">Options (editable) *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 uppercase w-4 shrink-0">{opt.id}</span>
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[i] = { ...opt, text: e.target.value };
                          setOptions(updated);
                        }}
                        className="bg-slate-900 border-white/10 text-slate-100 text-sm focus-visible:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer — MCQ */}
                {questionType === "MCQ" && (
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-sm">Correct Option *</Label>
                    <Select value={correctOption} onValueChange={setCorrectOption}>
                      <SelectTrigger className="bg-slate-900 border-white/10 text-slate-100 focus:ring-indigo-500">
                        <SelectValue placeholder="Select correct answer…" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
                        {OPTION_IDS.map((id) => (
                          <SelectItem key={id} value={id}>{id.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Correct answers — MSQ */}
                {questionType === "MSQ" && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Correct Options * <span className="text-slate-500 text-xs">(select all that apply)</span></Label>
                    <div className="flex gap-4 flex-wrap">
                      {OPTION_IDS.map((id) => (
                        <div key={id} className="flex items-center gap-2">
                          <Checkbox
                            id={`msq-${id}`}
                            checked={correctOptions.includes(id)}
                            onCheckedChange={() => toggleMSQOption(id)}
                            className="border-indigo-500 data-[state=checked]:bg-indigo-500"
                          />
                          <label htmlFor={`msq-${id}`} className="text-slate-300 uppercase text-sm cursor-pointer">{id}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NAT Range */}
            {questionType === "NAT" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Range Start *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    placeholder="e.g. 5.5"
                    className="bg-slate-900 border-white/10 text-slate-100 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Range End *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    placeholder="e.g. 6.5"
                    className="bg-slate-900 border-white/10 text-slate-100 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleAddQuestion}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold mt-2"
            >
              + Add to JSON
            </Button>
          </div>

          {/* ── Right Panel: JSON Output ── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-200">JSON Output</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {questions.length === 0
                    ? "No questions yet — use the form to add"
                    : `${questions.length} question${questions.length > 1 ? "s" : ""} added`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={questions.length === 0}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  disabled={questions.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-1" /> Copy JSON</>
                  )}
                </Button>
              </div>
            </div>

            <pre className="flex-1 bg-slate-900/80 rounded-xl border border-white/5 p-4 text-xs text-slate-300 font-mono overflow-auto whitespace-pre-wrap min-h-[400px] max-h-[600px]">
              {questions.length === 0
                ? "// Your JSON will appear here as you add questions..."
                : JSON.stringify(questions, null, 2)}
            </pre>

            <p className="text-xs text-slate-600 text-center">
              Paste this JSON into the Bulk Upload dialog on any question page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
