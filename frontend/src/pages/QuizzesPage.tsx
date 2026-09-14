import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Flame,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_QUIZ: Question[] = [
  {
    id: 1,
    question: "In computer science, what is the time complexity of searching in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "Because a balanced BST halves the search space at each step, search operations take logarithmic time O(log n)."
  },
  {
    id: 2,
    question: "Which HTTP status code signifies a successful 'Created' resource request?",
    options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
    correctAnswer: 1,
    explanation: "HTTP 201 Created indicates that the request succeeded and a new resource has been created."
  },
  {
    id: 3,
    question: "What is the primary advantage of active recall over passive reading?",
    options: [
      "It requires less mental effort",
      "It strengthens neural pathways and long-term retention",
      "It takes longer to complete",
      "It only works for mathematics"
    ],
    correctAnswer: 1,
    explanation: "Retrieval practice forces the brain to reconstruct memory traces, dramatically boosting long-term memory."
  }
];

export const QuizzesPage: React.FC = () => {
  const [quizMode, setQuizMode] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const { showToast } = useToast();

  const currentQuestion = SAMPLE_QUIZ[currentQIndex % SAMPLE_QUIZ.length];

  const handleStartQuiz = () => {
    setQuizMode('running');
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    showToast('info', 'Quiz Started!', 'Good luck! Select the best answer for each question.');
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing after selection
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      showToast('success', 'Correct Answer! 🎉', '+1 Point!');
    } else {
      showToast('error', 'Not quite right', 'Check the explanation below.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < SAMPLE_QUIZ.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizMode('completed');
      showToast('success', 'Quiz Completed! 🏆', `Final Score: ${score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)} / ${SAMPLE_QUIZ.length}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Cogniva Quiz <Sparkles className="w-6 h-6 text-amber-400 animate-bounce" />
            </h1>
            <Badge variant="brand" size="sm">Active Recall Vibe</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            AI-generated adaptive assessments with instant feedback, pedagogical explanations, and score tracking.
          </p>
        </div>

        {quizMode === 'idle' && (
          <Button onClick={handleStartQuiz} icon={<Play className="w-4 h-4" />}>
            Start Practice Quiz
          </Button>
        )}
      </div>

      {/* IDLE MODE: QUIZ GENERATOR & CONFIG */}
      {quizMode === 'idle' && (
        <div className="space-y-6">
          <Card glow className="p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Generate Custom Quiz</h3>
                <p className="text-xs text-slate-400">Configure question length, difficulty level, and study material source.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        difficulty === lvl
                          ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow-md shadow-brand-500/10'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {lvl === 'Easy' && '🌱 '}
                      {lvl === 'Medium' && '⚡ '}
                      {lvl === 'Hard' && '🔥 '}
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Number of Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        questionCount === count
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-400/10'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleStartQuiz} icon={<Play className="w-4 h-4" />} className="w-full py-3.5 text-sm font-bold">
              Launch {questionCount}-Question {difficulty} Quiz
            </Button>
          </Card>
        </div>
      )}

      {/* RUNNING MODE: INTERACTIVE QUIZ RUNNER */}
      {quizMode === 'running' && (
        <Card glow className="p-8 space-y-6 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Question {currentQIndex + 1} of {SAMPLE_QUIZ.length}</span>
              <span className="text-amber-400 font-bold">Score: {score}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-400 transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${((currentQIndex + 1) / SAMPLE_QUIZ.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const showResult = selectedOption !== null;

              let optionStyle = 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80';
              if (showResult) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 shadow-md shadow-emerald-500/10 scale-[1.01]';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                } else {
                  optionStyle = 'border-slate-800/50 bg-slate-950/40 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </div>

                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-brand-950/40 border border-brand-500/30 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" /> Explanation & Insight
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="pt-4 flex justify-end border-t border-slate-800">
              <Button onClick={handleNextQuestion} icon={<ArrowRight className="w-4 h-4" />}>
                {currentQIndex + 1 < SAMPLE_QUIZ.length ? 'Next Question' : 'View Results'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* COMPLETED MODE: SCORE CARD & CELEBRATION */}
      {quizMode === 'completed' && (
        <Card glow className="p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-brand-500 to-indigo-500 p-1 mx-auto shadow-xl shadow-amber-400/20 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Quiz Completed! 🎉</h2>
            <p className="text-slate-400 text-sm mt-1">Great job practicing active recall!</p>
          </div>

          <div className="inline-flex items-center gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <div>
              <span className="text-xs text-slate-500 font-mono block">YOUR SCORE</span>
              <span className="text-3xl font-extrabold text-white">{score} / {SAMPLE_QUIZ.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-xs text-slate-500 font-mono block">ACCURACY</span>
              <span className="text-3xl font-extrabold text-emerald-400">
                {Math.round((score / SAMPLE_QUIZ.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button onClick={handleStartQuiz} icon={<RotateCcw className="w-4 h-4" />}>
              Try Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
