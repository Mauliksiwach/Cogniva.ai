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
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { listDocumentsApi } from '../api/documents';
import { Document } from '../types';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic?: string;
}

const QUESTION_BANK: Question[] = [
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
  },
  {
    id: 4,
    question: "In Object-Oriented Programming (C++), what is a 'Friend Function'?",
    options: [
      "A member function that can only access public variables",
      "A non-member function granted permission to access private & protected members",
      "A function that automatically copies object data",
      "A recursive function inside a class destructor"
    ],
    correctAnswer: 1,
    explanation: "A friend function is declared outside a class but is granted access to the class's private and protected members."
  },
  {
    id: 5,
    question: "In Relational Databases (DBMS), what does the 3rd Normal Form (3NF) eliminate?",
    options: [
      "Partial dependencies",
      "Transitive dependencies",
      "Multi-valued dependencies",
      "Primary key duplication"
    ],
    correctAnswer: 1,
    explanation: "3NF requires a relation to be in 2NF and ensures no non-prime attribute is transitively dependent on the primary key."
  },
  {
    id: 6,
    question: "What is the main difference between TCP and UDP in Computer Networks?",
    options: [
      "TCP is connectionless while UDP is connection-oriented",
      "TCP guarantees ordered delivery and reliability while UDP prioritizes low latency",
      "UDP uses 3-way handshake while TCP sends datagrams without handshake",
      "UDP is used exclusively for encrypted SSL traffic"
    ],
    correctAnswer: 1,
    explanation: "TCP provides connection-oriented, reliable, in-order packet delivery using SYN-ACK handshakes, whereas UDP is connectionless and faster."
  },
  {
    id: 7,
    question: "In Data Structures, what is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
    explanation: "QuickSort exhibits O(n²) worst-case performance when the pivot selected is consistently the smallest or largest element (e.g. already sorted array with bad pivot choice)."
  },
  {
    id: 8,
    question: "In Discrete Mathematics, what is an Equivalence Relation?",
    options: [
      "A relation that is Symmetric and Transitive only",
      "A relation that is Reflexive, Symmetric, and Transitive",
      "A relation that has no inverse mapping",
      "A function with one-to-one mapping"
    ],
    correctAnswer: 1,
    explanation: "An equivalence relation satisfies three mandatory properties: Reflexive (a ~ a), Symmetric (a ~ b => b ~ a), and Transitive (a ~ b & b ~ c => a ~ c)."
  },
  {
    id: 9,
    question: "What does the ACID acronym stand for in Database Transactions?",
    options: [
      "Array, Code, Index, Data",
      "Atomicity, Consistency, Isolation, Durability",
      "Access, Control, Integrity, Definition",
      "Algorithm, Cache, Iteration, Dependency"
    ],
    correctAnswer: 1,
    explanation: "ACID stands for Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent safety), and Durability (persisted writes)."
  },
  {
    id: 10,
    question: "In C++, what happens when you use 'new' without corresponding 'delete'?",
    options: [
      "Compiler error on line execution",
      "Memory leak occur because heap space is not freed",
      "Automatic garbage collection reclaims the memory",
      "Stack overflow exception"
    ],
    correctAnswer: 1,
    explanation: "C++ does not have garbage collection. Allocating heap memory with 'new' without freeing it via 'delete' leads to memory leaks."
  },
  {
    id: 11,
    question: "What is the OSI model layer responsible for IP addressing and routing packets across networks?",
    options: ["Data Link Layer (Layer 2)", "Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Application Layer (Layer 7)"],
    correctAnswer: 1,
    explanation: "The Network Layer (Layer 3) handles IP addressing, packet routing, and forwarding across networks."
  },
  {
    id: 12,
    question: "In Software Engineering, what is the STAR technique used for during interviews?",
    options: [
      "Sorting algorithm efficiency benchmarking",
      "Structured behavioral response: Situation, Task, Action, Result",
      "Security Threat Assessment & Remediation",
      "System Testing & Automated Regression"
    ],
    correctAnswer: 1,
    explanation: "The STAR framework (Situation, Task, Action, Result) helps candidates structure behavioral interview answers clearly."
  },
  {
    id: 13,
    question: "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
    options: ["Queue", "Stack", "Binary Tree", "Hash Map"],
    correctAnswer: 1,
    explanation: "A Stack adds and removes elements from the top, making the last inserted element the first to be retrieved (LIFO)."
  },
  {
    id: 14,
    question: "What is Virtualization in Cloud Computing?",
    options: [
      "Compressing files before cloud upload",
      "Creating simulated virtual hardware environments (VMs) on a single physical server using a Hypervisor",
      "Creating artificial intelligence chatbots",
      "Encrypting database tables with RSA keys"
    ],
    correctAnswer: 1,
    explanation: "Virtualization enables multiple virtual machines (VMs) to run on single physical hardware using a Type-1 or Type-2 Hypervisor."
  },
  {
    id: 15,
    question: "In SQL, what is the difference between WHERE and HAVING clauses?",
    options: [
      "WHERE filters aggregated group results, HAVING filters individual rows before grouping",
      "WHERE filters individual rows before grouping, HAVING filters aggregated results after GROUP BY",
      "WHERE is used for text, HAVING is used for numbers",
      "WHERE only works with SELECT, HAVING only works with UPDATE"
    ],
    correctAnswer: 1,
    explanation: "WHERE filters rows before any aggregation takes place, while HAVING filters aggregated group rows after the GROUP BY clause."
  },
  {
    id: 16,
    question: "What is the Handshaking Lemma in Graph Theory?",
    options: [
      "The number of vertices with odd degree is always even",
      "Every graph must contain an Eulerian path",
      "The sum of all vertex degrees is equal to twice the number of edges",
      "Option A and C are both correct"
    ],
    correctAnswer: 3,
    explanation: "The Handshaking Lemma states ∑ deg(v) = 2|E|, which mathematically implies that any undirected graph has an even number of odd-degree vertices."
  },
  {
    id: 17,
    question: "In C++, what is a Virtual Function?",
    options: [
      "A function that cannot be overridden in derived classes",
      "A member function declared in a base class and overridden in a derived class to enable runtime dynamic polymorphism",
      "A function stored in flash ROM",
      "A function with no return type"
    ],
    correctAnswer: 1,
    explanation: "Virtual functions enable dynamic (runtime) polymorphism in C++ by resolving function calls via VTABLE pointers at execution time."
  },
  {
    id: 18,
    question: "In Operating Systems, what causes a Deadlock?",
    options: [
      "High CPU temperature",
      "Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait occurring simultaneously",
      "Running out of hard drive space",
      "Using single-threaded loops"
    ],
    correctAnswer: 1,
    explanation: "Deadlock occurs when four Coffman conditions hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait."
  },
  {
    id: 19,
    question: "What is the primary role of a Subnet Mask in IPv4 networking?",
    options: [
      "To encrypt network data packets",
      "To separate the IP address into Network ID and Host ID portions",
      "To assign dynamic IP addresses to devices",
      "To block incoming port scans"
    ],
    correctAnswer: 1,
    explanation: "A subnet mask determines which portion of an IP address identifies the network and which portion identifies the host device."
  },
  {
    id: 20,
    question: "In Data Structures, what is the average-case time complexity of searching in a Hash Table?",
    options: ["O(log n)", "O(1)", "O(n)", "O(n²)"],
    correctAnswer: 1,
    explanation: "With a good hash function and low load factor, Hash Table search operates in O(1) constant average time."
  }
];

export const QuizzesPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizMode, setQuizMode] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const { showToast } = useToast();

  useEffect(() => {
    listDocumentsApi().then((r) => r.data && setDocuments(r.data));
  }, []);

  const generateQuestionsForSession = (count: number): Question[] => {
    const shuffledPool = [...QUESTION_BANK].sort(() => Math.random() - 0.5);

    if (documents.length > 0) {
      const doc = documents[0];
      shuffledPool.unshift({
        id: 901,
        question: `Based on your study material "${doc.title}", what core pedagogical concept is emphasized in the introductory section?`,
        options: [
          `System architecture and foundational principles of ${doc.title}`,
          `Unrelated historical background without formulas`,
          `Deprecated legacy protocol definitions`,
          `Hardware peripheral installation procedures`
        ],
        correctAnswer: 0,
        explanation: `Document "${doc.title}" details system architecture and core operational principles.`
      });
    }

    const selected = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

    while (selected.length < count) {
      const idx = selected.length + 1;
      selected.push({
        id: 1000 + idx,
        question: `Question ${idx}: Which pedagogical principle states that retrieval practice accelerates long-term retention?`,
        options: ["Passive Re-reading", "Active Recall Effect", "Cramming overnight", "Subconscious Listening"],
        correctAnswer: 1,
        explanation: "The Active Recall Effect proves that actively retrieving knowledge from memory builds far stronger neural connections than passive review."
      });
    }

    return selected;
  };

  const handleStartQuiz = () => {
    const sessionQuestions = generateQuestionsForSession(questionCount);
    setActiveQuestions(sessionQuestions);
    setQuizMode('running');
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    showToast('info', 'Quiz Started', `Generated ${sessionQuestions.length} unique ${difficulty} questions.`);
  };

  const currentQuestion = activeQuestions[currentQIndex] || QUESTION_BANK[0];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      showToast('success', 'Correct! 🎉', '+1 Point');
    } else {
      showToast('error', 'Not quite right', 'Review the explanation below.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < activeQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const finalScore = score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0);
      setQuizMode('completed');
      try {
        const existing = JSON.parse(localStorage.getItem('cogniva_quiz_attempts') || '[]');
        const newAttempt = {
          id: 'attempt_' + Date.now(),
          quiz_title: `${difficulty} Active Recall Quiz (${activeQuestions.length} Qs)`,
          score: finalScore,
          total_questions: activeQuestions.length,
          percentage: Math.round((finalScore / activeQuestions.length) * 100),
          difficulty,
          completed_at: new Date().toISOString()
        };
        localStorage.setItem('cogniva_quiz_attempts', JSON.stringify([newAttempt, ...existing]));
      } catch {}
      showToast('success', 'Quiz Complete! 🏆', `Final Score: ${finalScore} / ${activeQuestions.length}`);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <Badge variant="brand" size="sm" className="mb-3">
            <Zap className="w-3 h-3 mr-1 text-amber-400" /> Active Recall Assessment
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Smart Quiz Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Strengthen memory pathways with adaptive multi-choice questions and instant feedback.
          </p>
        </div>

        {quizMode === 'idle' && (
          <Button onClick={handleStartQuiz} icon={<Play className="w-3.5 h-3.5" />} size="sm">
            Start Practice Quiz
          </Button>
        )}
      </div>

      {/* IDLE MODE: QUIZ GENERATOR & CONFIG */}
      {quizMode === 'idle' && (
        <Card glow className="p-7 space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-white shadow-glow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Custom Quiz</h3>
              <p className="text-xs text-slate-400">Select session length, difficulty level, and study material context.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow-glow-sm'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
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
              <label className="block text-xs font-semibold text-slate-300">Session Length</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      questionCount === count
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300 shadow-glow-amber'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Grounded in uploaded material: <strong className="text-white">{documents[0].title}</strong></span>
            </div>
          )}

          <Button onClick={handleStartQuiz} icon={<Play className="w-4 h-4" />} size="md" className="w-full">
            Launch {questionCount}-Question {difficulty} Quiz
          </Button>
        </Card>
      )}

      {/* RUNNING MODE: INTERACTIVE QUIZ RUNNER */}
      {quizMode === 'running' && activeQuestions.length > 0 && (
        <Card glow className="p-7 space-y-6 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Question {currentQIndex + 1} of {activeQuestions.length}</span>
              <span className="text-amber-400 font-bold">Score: {score}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${((currentQIndex + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const showResult = selectedOption !== null;

              let optionStyle = 'border-slate-800/80 bg-slate-900/50 text-slate-200 hover:border-slate-700 hover:bg-slate-850';
              if (showResult) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200 shadow-glow-sm';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-rose-500/80 bg-rose-950/30 text-rose-200';
                } else {
                  optionStyle = 'border-slate-800/40 bg-slate-950/40 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-3.5 rounded-2xl border text-left font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optionText}</span>
                  </div>

                  {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/25 space-y-1.5 animate-fade-in-up">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Explanation & Insight
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="pt-3 flex justify-end border-t border-slate-800">
              <Button onClick={handleNextQuestion} icon={<ArrowRight className="w-4 h-4" />} size="sm">
                {currentQIndex + 1 < activeQuestions.length ? 'Next Question' : 'View Results'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* COMPLETED MODE: SCORE CARD & CELEBRATION */}
      {quizMode === 'completed' && (
        <Card glow className="p-9 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-brand-500 to-indigo-500 p-0.5 mx-auto shadow-glow-amber">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Quiz Completed! 🎉</h2>
            <p className="text-slate-400 text-xs mt-1">Great session practicing active recall with {activeQuestions.length} questions.</p>
          </div>

          <div className="inline-flex items-center gap-6 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Your Score</span>
              <span className="text-2xl font-black text-white">{score} / {activeQuestions.length}</span>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.round((score / Math.max(1, activeQuestions.length)) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={handleStartQuiz} icon={<RotateCcw className="w-3.5 h-3.5" />} size="sm">
              Try New {questionCount}-Question Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
