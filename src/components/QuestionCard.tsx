import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  children: React.ReactNode;
  currentIndex: number;
  totalQuestions: number;
  onBack?: () => void;
  onNext?: (value: string | boolean) => void;
  currentValue?: string | boolean;
  showBackButton?: boolean;
  backText?: string;
  nextText?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  children,
  currentIndex,
  totalQuestions,
  onBack,
  onNext,
  currentValue,
  showBackButton = true,
  backText = 'Back',
  nextText = 'Next',
}) => {
  const canProgress = currentValue !== undefined && currentValue !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto w-full px-4 sm:px-0"
    >
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">{question}</h2>
          <div className="relative">
            {children}
          </div>
        </div>
        <div className="flex items-center justify-between text-gray-500 text-sm sm:text-base">
          <div className="flex items-center gap-2 sm:gap-4">
            {showBackButton && currentIndex > 0 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-100 
                         transition-colors text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4" />
                {backText}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span>{currentIndex + 1}/{totalQuestions}</span>
            {onNext && (
              <button
                onClick={() => canProgress && onNext(currentValue)}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors ${
                  canProgress
                    ? 'text-[#b4854b] hover:bg-[#b4854b]/10'
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
                disabled={!canProgress}
              >
                {nextText}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};