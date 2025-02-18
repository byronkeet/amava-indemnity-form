import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PawPrint, ExternalLink } from 'lucide-react';
import { Question, FormState, countries } from './types';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { DatePicker } from './components/DatePicker';
import { SignaturePad } from './components/SignaturePad';
import { Select } from './components/Select';
import { languages, translations, type LanguageCode } from './translations';
import { supabase } from './lib/supabase';
import { EmailCard } from './components/EmailCard';
import naturalSelectionLogo from '/natural-selection-logo.png';
import tuludiLogo from '/tuludi-logo.jpg';
import { uploadSignature } from './utils/storage';

const createQuestions = (lang: LanguageCode): Question[] => [
  {
    id: 'welcome',
    type: 'text',
    question: translations[lang].welcome.title,
    placeholder: translations[lang].welcome.subtitle,
    isWelcome: true,
  },
  {
    id: 'fullName',
    type: 'text',
    question: translations[lang].questions.fullName,
    placeholder: translations[lang].placeholders.fullName,
  },
  {
    id: 'email',
    type: 'email',
    question: translations[lang].questions.email,
    placeholder: translations[lang].placeholders.email,
  },
  {
    id: 'nationality',
    type: 'select',
    question: translations[lang].questions.nationality,
    options: countries,
  },
  {
    id: 'birthday',
    type: 'date',
    question: translations[lang].questions.birthday,
  },
  {
    id: 'idNumber',
    type: 'text',
    question: translations[lang].questions.idNumber,
    placeholder: translations[lang].placeholders.idNumber,
  },
  {
    id: 'insurance',
    type: 'text',
    question: translations[lang].questions.insurance,
    placeholder: translations[lang].placeholders.insurance,
  },
  {
    id: 'hasChildren',
    type: 'checkbox',
    question: translations[lang].questions.hasChildren,
    options: [translations[lang].buttons.yes, translations[lang].buttons.no],
  },
  {
    id: 'childrenNames',
    type: 'text',
    question: translations[lang].questions.childrenNames,
    placeholder: translations[lang].placeholders.childrenNames,
    conditional: {
      dependsOn: 'hasChildren',
      showIf: true,
    },
  },
  {
    id: 'termsAccepted',
    type: 'checkbox',
    question: (
      <div className="space-y-4">
        <p>{translations[lang].questions.termsAccepted}</p>
        <a
          href="/terms-and-conditions.jpeg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#b4854b] hover:text-[#8b6539] inline-flex items-center gap-1 text-sm sm:text-base font-light"
        >
          {translations[lang].viewLink.click}{' '}{translations[lang].viewLink.here}{' '}{translations[lang].viewLink.toView} <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    ),
    options: [translations[lang].buttons.yes, translations[lang].buttons.no],
  },
  {
    id: 'signature',
    type: 'signature',
    question: translations[lang].questions.signature,
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formState, setFormState] = useState<FormState>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const questions = createQuestions(language);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      let prevQuestion = currentQuestion - 1;
      
      while (prevQuestion >= 0) {
        const prevQ = questions[prevQuestion];
        if (prevQ.conditional) {
          const dependsOnValue = formState[prevQ.conditional.dependsOn];
          if (dependsOnValue !== prevQ.conditional.showIf) {
            prevQuestion--;
            continue;
          }
        }
        break;
      }
      
      setCurrentQuestion(Math.max(0, prevQuestion));
    }
  }, [currentQuestion, formState, questions]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Generate a unique ID for this submission
      const submissionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get the signature from form state
      const signatureBase64 = formState.signature as string;
      
      // Upload signature and get public URL
      const signatureUrl = await uploadSignature(signatureBase64, submissionId);

      // Create submission object with correct column names
      const submission = {
        language: language,
        full_name: formState.fullName,
        email: formState.email,
        nationality: formState.nationality,
        birthday: formState.birthday,
        id_number: formState.idNumber,
        insurance: formState.insurance,
        has_children: formState.hasChildren,
        children_names: formState.childrenNames,
        terms_accepted: formState.termsAccepted,
        signature: signatureUrl,
      };

      // Log the submission object for debugging
      console.log('Submitting form with data:', submission);

      // Submit form with signature URL instead of base64
      const { error } = await supabase
        .from('indemnity')
        .insert([submission]);

      if (error) throw error;

      setIsCompleted(true);
    } catch (error) {
      console.error('Error:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = useCallback((value: string | boolean) => {
    const currentQ = questions[currentQuestion];
    setFormState(prev => ({
      ...prev,
      [currentQ.id]: value
    }));

    if (currentQuestion < questions.length - 1) {
      let nextQuestion = currentQuestion + 1;
      
      while (nextQuestion < questions.length) {
        const nextQ = questions[nextQuestion];
        if (nextQ.conditional) {
          const dependsOnValue = formState[nextQ.conditional.dependsOn];
          const conditionMet = currentQ.id === nextQ.conditional.dependsOn
            ? value === nextQ.conditional.showIf
            : dependsOnValue === nextQ.conditional.showIf;
            
          if (!conditionMet) {
            nextQuestion++;
            continue;
          }
        }
        break;
      }
      
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        handleSubmit();
      }
    } else {
      handleSubmit();
    }
  }, [currentQuestion, formState, questions]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' && value.trim()) {
      handleNext(value);
    }
  }, [handleNext]);

  const progress = (currentQuestion / questions.length) * 100;

  const Logo = () => (
    <>
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8">
        <img 
          src={naturalSelectionLogo} 
          alt="Natural Selection" 
          className="h-12 sm:h-16"
        />
      </div>
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8">
        <img 
          src={tuludiLogo} 
          alt="Tuludi" 
          className="h-12 sm:h-16"
        />
      </div>
    </>
  );

  if (isCompleted) {
    const t = translations[language];
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
        <Logo />
        <div className="text-center space-y-4 sm:space-y-6">
          <PawPrint className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[#b4854b] animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            {t.completion.title.replace('{name}', formState.fullName as string)}
          </h1>
          <p className="text-base sm:text-xl text-gray-600">{t.completion.subtitle}</p>
          <a
            href="https://tuludi-assistant.amava.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-[#b4854b] text-white rounded-lg hover:bg-[#8b6539] transition-colors duration-200 text-sm sm:text-base"
          >
            {t.completion.welcomePackButton}
          </a>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const t = translations[language];

  if (currentQ.isWelcome) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
        <Logo />
        <div className="text-center space-y-4 sm:space-y-6 max-w-xl px-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">{currentQ.question}</h1>
          <p className="text-base sm:text-xl text-gray-600">{currentQ.placeholder}</p>
          <div className="w-full max-w-sm mx-auto">
            <Select
              options={languages.map(l => l.name)}
              value={languages.find(l => l.code === language)?.name || ''}
              onChange={(value) => {
                const selectedLanguage = languages.find(l => l.name === value)?.code as LanguageCode;
                if (selectedLanguage) {
                  setLanguage(selectedLanguage);
                }
              }}
              placeholder="Select your language"
            />
          </div>
          <button
            onClick={() => handleNext('started')}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-[#b4854b] text-white rounded-lg hover:bg-[#8b6539] transition-colors duration-200 text-sm sm:text-base"
          >
            {t.welcome.start}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <Logo />
      <ProgressBar progress={progress} />
      
      <AnimatePresence mode="wait">
        {currentQ.type === 'email' ? (
          <EmailCard
            question={currentQ.question}
            currentIndex={currentQuestion}
            totalQuestions={questions.length}
            onBack={handleBack}
            onNext={handleNext}
            currentValue={formState[currentQ.id] as string}
            showBackButton={!currentQ.isWelcome}
            backText={t.buttons.back}
            nextText={isSubmitting ? '...' : t.buttons.next}
            placeholder={currentQ.placeholder}
          />
        ) : (
          <QuestionCard
            key={currentQ.id}
            question={currentQ.question}
            currentIndex={currentQuestion}
            totalQuestions={questions.length}
            onBack={handleBack}
            onNext={handleNext}
            currentValue={formState[currentQ.id]}
            showBackButton={!currentQ.isWelcome}
            backText={t.buttons.back}
            nextText={isSubmitting ? '...' : t.buttons.next}
          >
            {currentQ.type === 'select' ? (
              <Select
                options={currentQ.options || []}
                value={formState[currentQ.id] as string || ''}
                onChange={(value) => setFormState(prev => ({ ...prev, [currentQ.id]: value }))}
                placeholder={t.placeholders.nationality}
              />
            ) : currentQ.type === 'checkbox' ? (
              <div className="grid gap-2 sm:gap-3">
                {currentQ.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormState(prev => ({ ...prev, [currentQ.id]: option === t.buttons.yes }))}
                    className={`w-full text-left px-4 py-3 sm:px-6 sm:py-4 rounded-lg transition-colors duration-200 text-sm sm:text-base
                      ${formState[currentQ.id] === (option === t.buttons.yes)
                        ? 'bg-[#b4854b] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : currentQ.type === 'date' ? (
              <DatePicker
                value={formState[currentQ.id] as string || ''}
                onChange={(value) => setFormState(prev => ({ ...prev, [currentQ.id]: value }))}
                placeholder={t.placeholders.birthday}
              />
            ) : currentQ.type === 'signature' ? (
              <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
                <SignaturePad 
                  onSign={(value) => setFormState(prev => ({ ...prev, [currentQ.id]: value }))} 
                  clearText={t.buttons.clear}
                />
              </div>
            ) : (
              <input
                type={currentQ.type}
                placeholder={currentQ.placeholder}
                value={formState[currentQ.id] as string || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                onKeyPress={(e) => handleKeyPress(e, formState[currentQ.id] as string || '')}
                className="w-full bg-transparent border-b-2 border-gray-200 px-3 py-3 sm:px-4 sm:py-4 
                         text-lg sm:text-2xl text-gray-900 placeholder-gray-400 focus:border-[#b4854b] 
                         focus:outline-none transition-colors duration-200"
              />
            )}
          </QuestionCard>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;