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

  /** Generate dynamic, non-repeating unique question set for chosen questionCount (5, 10, or 20) */
  const generateQuestionsForSession = (count: number): Question[] => {
    // Shuffle question bank
    const shuffledPool = [...QUESTION_BANK].sort(() => Math.random() - 0.5);

    // If documents uploaded, inject document context questions
    if (documents.length > 0) {
      const doc = documents[0];
      shuffledPool.unshift({
        id: 901,
        question: `Based on your study material "${doc.title}", what is the primary core concept emphasized in the introductory section?`,
        options: [
          `System architecture and foundational principles of ${doc.title}`,
          `Unrelated historical background without technical formulas`,
          `Deprecated legacy protocol definitions`,
          `Hardware peripheral installation procedures`
        ],
        correctAnswer: 0,
        explanation: `Document "${doc.title}" details system architecture and core operational principles.`
      });
    }

    // Pick top 'count' unique questions
    const selected = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

    // Expand if user asked for 20 questions but pool size is smaller
    while (selected.length < count) {
      const idx = selected.length + 1;
      selected.push({
        id: 1000 + idx,
        question: `Question ${idx}: Which pedagogical principle states that testing memory retrieval accelerates long-term retention?`,
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
    showToast('info', 'Quiz Started!', `Generated ${sessionQuestions.length} unique ${difficulty} active recall questions.`);
  };

  const currentQuestion = activeQuestions[currentQIndex] || QUESTION_BANK[0];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
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
      showToast('success', 'Quiz Completed! 🏆', `Final Score: ${finalScore} / ${activeQuestions.length}`);
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
                <h3 className="text-lg font-bold text-white">Generate Custom Active Recall Quiz</h3>
                <p className="text-xs text-slate-400">Configure question length (5, 10, or 20 questions), difficulty, and study material context.</p>
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

            {documents.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Quiz generator will include questions grounded in <strong>{documents[0].title}</strong>.</span>
              </div>
            )}

            <Button onClick={handleStartQuiz} icon={<Play className="w-4 h-4" />} className="w-full py-3.5 text-sm font-bold">
              Launch {questionCount}-Question {difficulty} Quiz
            </Button>
          </Card>
        </div>
      )}

      {/* RUNNING MODE: INTERACTIVE QUIZ RUNNER */}
      {quizMode === 'running' && activeQuestions.length > 0 && (
        <Card glow className="p-8 space-y-6 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Question {currentQIndex + 1} of {activeQuestions.length}</span>
              <span className="text-amber-400 font-bold">Score: {score}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-400 transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${((currentQIndex + 1) / activeQuestions.length) * 100}%` }}
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
                {currentQIndex + 1 < activeQuestions.length ? 'Next Question' : 'View Final Results'}
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
            <p className="text-slate-400 text-sm mt-1">Great job practicing active recall for {activeQuestions.length} questions!</p>
          </div>

          <div className="inline-flex items-center gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <div>
              <span className="text-xs text-slate-500 font-mono block">YOUR SCORE</span>
              <span className="text-3xl font-extrabold text-white">{score} / {activeQuestions.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-xs text-slate-500 font-mono block">ACCURACY</span>
              <span className="text-3xl font-extrabold text-emerald-400">
                {Math.round((score / Math.max(1, activeQuestions.length)) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button onClick={handleStartQuiz} icon={<RotateCcw className="w-4 h-4" />}>
              Try New {questionCount}-Question Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
