"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Loader2 } from "lucide-react";

interface AssessmentModalProps {
  assessment: string | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  testData?: {
    prompt: string;
    rawResponse: string;
  } | null;
}

export default function AssessmentModal({
  assessment,
  isOpen,
  onClose,
  isLoading,
  testData,
}: AssessmentModalProps) {
  const [activeTab, setActiveTab] = useState<'assessment' | 'prompt' | 'response'>('assessment');

  // Add console log for debugging
  React.useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with testData:", testData);
    }
  }, [isOpen, testData]);

  const handleCopy = () => {
    let contentToCopy = "";
    
    if (activeTab === 'assessment' && assessment) {
      contentToCopy = assessment;
    } else if (activeTab === 'prompt' && testData) {
      contentToCopy = testData.prompt;
    } else if (activeTab === 'response' && testData) {
      contentToCopy = testData.rawResponse;
    }
    
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
    }
  };

  const handleDownload = () => {
    let contentToDownload = "";
    let fileName = "";
    
    if (activeTab === 'assessment' && assessment) {
      contentToDownload = assessment;
      fileName = `assessment-${new Date().toISOString().slice(0, 10)}.txt`;
    } else if (activeTab === 'prompt' && testData) {
      contentToDownload = testData.prompt;
      fileName = `prompt-${new Date().toISOString().slice(0, 10)}.txt`;
    } else if (activeTab === 'response' && testData) {
      contentToDownload = testData.rawResponse;
      fileName = `response-${new Date().toISOString().slice(0, 10)}.json`;
    }
    
    if (contentToDownload) {
      const blob = new Blob([contentToDownload], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
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
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs - Make them always visible for debugging */}
            <div className="flex border-b dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'assessment'
                    ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => setActiveTab('assessment')}
              >
                Assessment
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'prompt'
                    ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => setActiveTab('prompt')}
              >
                Prompt {testData ? '✓' : ''}
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === 'response'
                    ? 'border-b-2 border-blue-500 text-blue-500 bg-white dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => setActiveTab('response')}
              >
                Raw Response {testData ? '✓' : ''}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">
                    Generating psychological assessment...
                  </p>
                </div>
              ) : activeTab === 'assessment' && assessment ? (
                <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[60vh]">
                  {assessment}
                </div>
              ) : activeTab === 'prompt' ? (
                <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[60vh]">
                  {testData ? testData.prompt : 'No prompt data available'}
                </div>
              ) : activeTab === 'response' ? (
                <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[60vh]">
                  {testData ? testData.rawResponse : 'No response data available'}
                </div>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 p-8">
                  No data available
                </div>
              )}
            </div>

            {/* Footer with debug info */}
            <div className="p-4 border-t dark:border-slate-700 flex flex-col">
              <div className="text-xs text-slate-500 mb-2">
                Debug: Tab: {activeTab} | TestData: {testData ? 'Available' : 'Not available'}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  disabled={(activeTab === 'assessment' && !assessment) || 
                           (activeTab === 'prompt' && !testData) || 
                           (activeTab === 'response' && !testData) ||
                           isLoading}
                  className="flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy {activeTab === 'assessment' ? 'Assessment' : activeTab === 'prompt' ? 'Prompt' : 'Response'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={(activeTab === 'assessment' && !assessment) || 
                           (activeTab === 'prompt' && !testData) || 
                           (activeTab === 'response' && !testData) ||
                           isLoading}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {activeTab === 'assessment' ? 'Assessment' : activeTab === 'prompt' ? 'Prompt' : 'Response'}
                </Button>
                <Button variant="default" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 