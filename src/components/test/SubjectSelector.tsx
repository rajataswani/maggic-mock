
import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSubjectFormValues } from "./schemas/multiSubjectSchema";

interface SubjectSelectorProps {
  control: Control<MultiSubjectFormValues>;
  subjectList: string[];
  index: number;
}

const SubjectSelector = ({ control, subjectList, index }: SubjectSelectorProps) => {
  return (
    <FormField
      control={control}
      name={`subjects.${index}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-200">Subject {index + 1}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-white/5 border-white/10 text-slate-100 focus:ring-indigo-500">
                <SelectValue placeholder={`Select subject ${index + 1}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-100">
              {subjectList.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SubjectSelector;
