"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssessmentModalProps {
  assessment: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssessmentModal({
  assessment,
  isOpen,
  onClose,
}: AssessmentModalProps) {
  const [copied, setCopied] = useState(false);

  // If no assessment or modal is closed, don't render
  if (!assessment || !isOpen) return null;

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(assessment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download as text file
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([assessment], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `assessment_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Psychological Assessment
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Metadata */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Type</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    Psychological Assessment
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Format</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    AI-Generated Analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Assessment Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">
                {assessment}
              </pre>
            </div>

            {/* Footer with Actions */}
            <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 