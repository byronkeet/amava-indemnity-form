import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Question, FormState, countries } from './types';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { DatePicker } from './components/DatePicker';
import { SignaturePad } from './components/SignaturePad';
import { Select } from './components/Select';
import { languages, translations, type LanguageCode } from './translations';
import { supabase } from './lib/supabase';

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
          href="https://drive.google.com/file/d/1BuIeg1b40y228iNNUp9qaAAOgWMWae7T/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#b4854b] hover:text-[#8b6539] inline-flex items-center gap-1 text-sm sm:text-base"
        >
          {translations[lang].viewLink.click}{' '}
          <span className="underline">{translations[lang].viewLink.here}</span>{' '}
          {translations[lang].viewLink.toView} <ExternalLink className="w-4 h-4" />
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
      const { error } = await supabase.from('indemnity').insert([
        {
          language,
          full_name: formState.fullName as string,
          email: formState.email as string,
          nationality: formState.nationality as string,
          birthday: formState.birthday as string,
          id_number: formState.idNumber as string,
          insurance: formState.insurance as string,
          has_children: formState.hasChildren === true,
          children_names: formState.hasChildren === true ? formState.childrenNames as string : null,
          terms_accepted: formState.termsAccepted === true,
          signature: formState.signature as string,
        },
      ]);

      if (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
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
    <div className="fixed top-4 left-4 sm:top-8 sm:left-8">
      <img 
        src="https://naturalselection.travel/wp-content/uploads/2024/05/Natural-Selection_RGB_Primary-Logo_Dark-Gold-2.png" 
        alt="Natural Selection" 
        className="h-12 sm:h-16"
      />
    </div>
  );

  if (isCompleted) {
    const t = translations[language];
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
        <Logo />
        <div className="text-center space-y-4 sm:space-y-6">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-[#b4854b] animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            {t.completion.title.replace('{name}', formState.fullName as string)}
          </h1>
          <p className="text-base sm:text-xl text-gray-600">{t.completion.subtitle}</p>
          <a
            href="https://tripmate.co.za"
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
            <div className="space-y-3 sm:space-y-4 w-full">
              <SignaturePad onSign={(signature) => setFormState(prev => ({ ...prev, [currentQ.id]: signature }))} />
              <button
                onClick={() => handleNext(formState[currentQ.id])}
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-[#b4854b] text-white rounded-lg 
                         hover:bg-[#8b6539] transition-colors duration-200 text-sm sm:text-base"
                disabled={!formState[currentQ.id] || isSubmitting}
              >
                {isSubmitting ? '...' : t.buttons.submit}
              </button>
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
      </AnimatePresence>
    </div>
  );
}

export default App;