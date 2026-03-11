import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GlassCardProps {
  title: string;
  description?: string;
  meta: string[];
  buttonText: string;
  onClick: () => void;
  index: number;
  highlight?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  title, 
  description, 
  meta, 
  buttonText, 
  onClick, 
  index,
  highlight = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all shadow-xl hover:shadow-2xl overflow-hidden group ${highlight ? 'relative' : ''}`}>
        
        {highlight && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-slate-400 line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pb-6 flex-grow">
          <CardDescription className="space-y-1.5 text-slate-400">
            {meta.map((item, i) => (
              <p key={i} className="flex items-center text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 mr-2"></span>
                {item}
              </p>
            ))}
          </CardDescription>
        </CardContent>

        <CardFooter className="pt-0 border-t border-white/5 mt-auto">
          <Button 
            variant="outline" 
            className="w-full mt-4 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm shadow-sm" 
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GlassCard;
