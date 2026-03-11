
import React from "react";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TestFormFieldProps {
  control: Control<any>; // Using any to make it compatible with all form types
  name: string;
  label: string;
  description?: string;
  type?: string;
  min?: string;
  max?: string;
}

const TestFormField = ({
  control,
  name,
  label,
  description,
  type = "text",
  min,
  max,
}: TestFormFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-200">{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} min={min} max={max} className="bg-white/5 border-white/10 text-slate-100 focus-visible:ring-indigo-500" />
          </FormControl>
          {description && <FormDescription className="text-slate-400">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TestFormField;
