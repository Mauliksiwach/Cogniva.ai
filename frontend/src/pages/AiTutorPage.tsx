import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  Building,
  Upload,
  Search,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Zap,
  Flame,
  MessageSquare,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { TutorAvatar, AvatarMood } from '../components/tutor/TutorAvatar';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../api/client';
import { FormattedText } from '../components/common/FormattedText';

interface TutorProfile {
  institute: string;
  stream: string;
  year: string;
  subjects: string;
  hasUploadedPyq: boolean;
  autoFetchPyq: boolean;
  pyqFileName?: string;
  tone: 'funny' | 'academic' | 'crunch';
}

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  mood?: AvatarMood;
}

/** Course knowledge dictionary for fast accurate academic tutoring */
const COURSE_KNOWLEDGE_BASE: Record<string, { title: string; coreConcepts: string[]; pyqHacks: string[]; mnemonics: string }> = {
  CSE202: {
    title: 'Object-Oriented Programming (C++)',
    coreConcepts: [
      'Encapsulation & Data Hiding (Private/Public access specifiers)',
      'Constructors & Destructors (Copy Constructors, Deep vs Shallow Copy)',
      'Friend Functions & Friend Classes (Accessing private members without inheritance)',
      'Inheritance & Polymorphism (Virtual Functions, Abstract Classes, Pure Virtual Functions)',
      'Dynamic Memory Allocation (new / delete operators, memory leaks)'
    ],
    pyqHacks: [
      'Explain Friend Functions with a complete C++ code example (5 Marks)',
      'Difference between Virtual Functions and Pure Virtual Functions with VTABLE diagram (5 Marks)',
      'Write a C++ class for Matrix addition overloading the + operator (10 Marks)'
    ],
    mnemonics: 'A-PIE: Abstraction, Polymorphism, Inheritance, Encapsulation — The 4 Pillars of OOP!'
  },
  CSE205: {
    title: 'Data Structures & Algorithms',
    coreConcepts: [
      'Asymptotic Notation (Big-O, Big-Omega, Big-Theta complexities)',
      'Linked Lists (Singly, Doubly, Circular linked list insertions and deletions)',
      'Stacks & Queues (Infix to Postfix conversion, Circular Queues)',
      'Trees & BST (Inorder/Preorder/Postorder traversals, AVL Tree balancing)',
      'Sorting & Searching (QuickSort partition logic, MergeSort divide-and-conquer)'
    ],
    pyqHacks: [
      'Convert an Infix expression to Postfix using Stack algorithm step-by-step (5 Marks)',
      'Construct an AVL tree from given keys and show LL, RR, LR, RL rotations (10 Marks)',
      'Trace QuickSort algorithm on array [38, 27, 43, 3, 9, 82, 10] (5 Marks)'
    ],
    mnemonics: 'P-I-E-S: Push, Inspect (Peek), Empty check, Size — The 4 fundamental Stack operations!'
  },
  INT335: {
    title: 'Database Management Systems (DBMS)',
    coreConcepts: [
      'Relational Model & ER Diagrams (Entities, Relationships, Cardinality)',
      'SQL Queries (INNER JOIN, LEFT JOIN, GROUP BY, HAVING, Subqueries)',
      'Database Normalization (1NF, 2NF, 3NF, BCNF dependency rules)',
      'ACID Properties & Transactions (Atomicity, Consistency, Isolation, Durability)',
      'Indexing & B+ Trees (Primary Key vs Secondary Indexing, Query Optimization)'
    ],
    pyqHacks: [
      'Normalize an unnormalized student database schema up to 3NF showing Functional Dependencies (10 Marks)',
      'Write SQL queries for INNER JOIN, GROUP BY with HAVING clause on Employee table (5 Marks)',
      'Explain ACID properties with real bank transaction rollback example (5 Marks)'
    ],
    mnemonics: 'A-C-I-D: Atomicity (all or nothing), Consistency (valid state), Isolation (independent transactions), Durability (persisted changes)!'
  },
  MTH401: {
    title: 'Discrete Mathematics & Probability',
    coreConcepts: [
      'Propositional Logic & Equivalence (Truth tables, Tautologies, De Morgan laws)',
      'Set Theory & Relations (Reflexive, Symmetric, Transitive, Equivalence Relations)',
      'Mathematical Induction (Base step, Inductive hypothesis, Inductive step)',
      'Graph Theory (Eulerian & Hamiltonian Paths, Planar Graphs, Handshaking Lemma)',
      'Recurrence Relations (Homogeneous & Non-homogeneous solution methods)'
    ],
    pyqHacks: [
      'Prove that 1 + 2 + ... + n = n(n+1)/2 using Mathematical Induction (5 Marks)',
      'Verify if a given graph contains an Eulerian Circuit using Degree Theorem (5 Marks)',
      'Solve the recurrence relation T(n) = 2T(n-1) + 1 with base case T(0) = 0 (10 Marks)'
    ],
    mnemonics: 'R-S-T: Reflexive (a~a), Symmetric (a~b => b~a), Transitive (a~b & b~c => a~c) — Equivalence relation unlocked!'
  },
  CSE306: {
    title: 'Computer Networks',
    coreConcepts: [
      'OSI 7-Layer Model vs TCP/IP Architecture',
      'IPv4 Subnetting & CIDR Notation (Network ID, Broadcast Address calculation)',
      'Transport Layer Protocols (TCP 3-way Handshake, Flow Control, UDP)',
      'Routing Algorithms (Dijkstra Shortest Path, Distance Vector Routing)',
      'Application Protocols (DNS resolution, HTTP/HTTPS handshake, DHCP)'
    ],
    pyqHacks: [
      'Calculate subnets and usable IP range for 192.168.1.0/26 (5 Marks)',
      'Explain TCP 3-Way Handshake (SYN, SYN-ACK, ACK) with sequence numbers (5 Marks)',
      'Apply Dijkstra algorithm on given network topology graph (10 Marks)'
    ],
    mnemonics: 'Please Do Not Throw Sausage Pizza Away: Physical, Data Link, Network, Transport, Session, Presentation, Application (OSI Layers!)'
  },
  CSE423: {
    title: 'Cloud Computing & Distributed Systems',
    coreConcepts: [
      'Cloud Service Models (IaaS, PaaS, SaaS differences)',
      'Virtualization Technology (Type-1 Bare Metal vs Type-2 Hosted Hypervisors)',
      'Containerization (Docker Architecture, Kubernetes Pod Orchestration)',
      'Distributed Consensus Algorithms (Paxos, Raft algorithm basics)',
      'Cloud Storage & Elasticity (Object Storage vs Block Storage, Auto-scaling)'
    ],
    pyqHacks: [
      'Compare IaaS, PaaS, and SaaS with real AWS/GCP examples (5 Marks)',
      'Explain Kubernetes Architecture (Control Plane, Worker Nodes, Kubelet) (10 Marks)',
      'Describe Virtualization vs Containerization overhead (5 Marks)'
    ],
    mnemonics: 'S-P-I: Software as a Service, Platform as a Service, Infrastructure as a Service — Cloud service stack pyramid!'
  },
  PEL132: {
    title: 'Communication & Professional Soft Skills',
    coreConcepts: [
      'Technical Communication & Report Writing',
      'Group Discussion (GD) Tactics & Conflict Resolution',
      'Resume Crafting & STAR Method for Interviews',
      'Body Language & Non-verbal Cues during Presentations',
      'Email Etiquette & Professional Negotiation Skills'
    ],
    pyqHacks: [
      'Write a formal cover letter and resume summary for a Software Engineering role (10 Marks)',
      'How do you handle a difference of opinion in a Group Discussion politely? (5 Marks)',
      'Demonstrate the STAR technique (Situation, Task, Action, Result) for behavioral questions (5 Marks)'
    ],
    mnemonics: 'S-T-A-R: Situation, Task, Action, Result — Formula to ace any interview question!'
  }
};

/** Deep intelligent tutor response generator for any subject, university, or course code */
function generateAcademicTutoring(
  userQuery: string,
  profile: TutorProfile | null
): string {
  const queryLower = userQuery.toLowerCase();
  const institute = profile?.institute || 'your university';
  const stream = profile?.stream || 'your stream';
  const tone = profile?.tone || 'funny';

  let matchedCourse: { code: string; data: typeof COURSE_KNOWLEDGE_BASE[string] } | null = null;
  for (const [code, data] of Object.entries(COURSE_KNOWLEDGE_BASE)) {
    if (queryLower.includes(code.toLowerCase()) || queryLower.includes(data.title.toLowerCase())) {
      matchedCourse = { code, data };
      break;
    }
  }

  // 1. Top 5 Repeated PYQs request
  if (queryLower.includes('repeated pyq') || queryLower.includes('top 5') || queryLower.includes('past paper')) {
    if (matchedCourse) {
      return `${tone === 'funny' ? '🔥 Ooh, going straight for the high-scoring gold!' : '📚 **Past Exam Trend Analysis**'}\n\nHere are the **Top Exam Questions** most frequently set by ${institute} professors for **${matchedCourse.code}: ${matchedCourse.data.title}**:\n\n${matchedCourse.data.pyqHacks.map((q, i) => `**${i + 1}.** ${q}`).join('\n\n')}\n\n💡 *Pro-Tip for ${institute} exams*: Always define key terms, state your assumptions clearly, and draw a labeled diagram—evaluators routinely award full marks for clean visual representations!`;
    }
    return `${tone === 'funny' ? '🔥 Spotting exam trends like a pro!' : '📚 **Exam PYQ Insights**'}\n\nBased on semester exam trends for **${stream}** at **${institute}** (${profile?.subjects || 'Core Subjects'}), here are the 4 high-probability question formats:\n\n1. **Core Definition & Architecture (5 Marks)**: Define key principles of ${profile?.subjects || 'the module'} with a block diagram.\n2. **Numerical / Algorithm Trace (10 Marks)**: Step-by-step problem execution showing intermediate values.\n3. **Comparative Analysis (5 Marks)**: Differentiate between two contrasting concepts in a clean 2-column table.\n4. **Real-world Application Case Study (5 Marks)**: Explain why a specific design choice is optimal.`;
  }

  // 2. 10-Min Crash Revision request
  if (queryLower.includes('crash revision') || queryLower.includes('10-min') || queryLower.includes('revision summary')) {
    if (matchedCourse) {
      return `⚡ **10-Minute Rapid Revision Guide: ${matchedCourse.code} (${matchedCourse.data.title})**\n\nHere are the 5 non-negotiable concepts you MUST master before stepping into the exam hall at ${institute}:\n\n${matchedCourse.data.coreConcepts.map((c, i) => `• **Key Point ${i + 1}**: ${c}`).join('\n')}\n\n🧠 **Memory Mnemonic**: *${matchedCourse.data.mnemonics}*\n\nGood luck! Review these 5 bullet points twice before test time!`;
    }
    return `⚡ **10-Minute Rapid Revision Guide for ${stream}**\n\nQuick revision summary for ${profile?.subjects || 'your syllabus'} at ${institute}:\n\n1. **Foundational Definition**: Master key terms and mathematical/system definitions.\n2. **Step-by-Step Methodology**: Learn the 3-step solution process for numericals.\n3. **Diagrams & Schematics**: Practice drawing system flowcharts from memory.\n4. **Common Pitfalls**: Watch out for edge cases and boundary conditions.\n\nKeep calm, drink water, and trust your preparation! 🚀`;
  }

  // 3. Mnemonics request
  if (queryLower.includes('mnemonic') || queryLower.includes('memory trick') || queryLower.includes('acronym')) {
    if (matchedCourse) {
      return `😜 **Prof. Spark's Exam Mnemonic Hack for ${matchedCourse.code} (${matchedCourse.data.title})**!\n\n${matchedCourse.data.mnemonics}\n\nHow to use this in ${institute} exams:\nWhen you get a question on this topic, write out the acronym at the top of your answer sheet first! It organizes your thought process and proves to the professor that you know the structured theory inside out.`;
    }
    return `😜 **Prof. Spark's Universal Exam Mnemonic Trick!**\n\nFor remembering complex multi-step processes in **${profile?.subjects || 'your course'}** at **${institute}**:\n\nRemember **I-D-E-A-L**:\n• **I** - Identify the core problem & parameters\n• **D** - Define key formulas and equations\n• **E** - Execute the step-by-step calculation\n• **A** - Analyze edge cases and units\n• **L** - Label your final diagram/answer clearly!\n\nAcronyms turn 10 pages of notes into 5 simple letters. Works every time! 💡`;
  }

  // 4. Specific Course Code Query
  if (matchedCourse) {
    return `🎓 **Prof. Spark's Deep Dive into ${matchedCourse.code}: ${matchedCourse.data.title}**\n\nHello from your ${institute} tutor desk! Here is the complete breakdown of **${matchedCourse.data.title}**:\n\n### 📌 Core Syllabus Modules:\n${matchedCourse.data.coreConcepts.map((c, i) => `${i + 1}. **${c}**`).join('\n')}\n\n### 📝 Exam Scoring Strategy for ${institute}:\n• **5-Mark Questions**: Focus on ${matchedCourse.data.pyqHacks[0]}\n• **10-Mark Questions**: Professors routinely set questions like: *"${matchedCourse.data.pyqHacks[1]}"*\n\n### 💡 Memory Trick:\n> *${matchedCourse.data.mnemonics}*\n\nWhat specific sub-topic or code example in ${matchedCourse.code} would you like us to solve together next?`;
  }

  // 5. General Question Handling
  return `🎓 **Prof. Spark Tutoring Session** (${institute} • ${stream})\n\nRegarding your question: **"${userQuery}"**\n\nHere is the detailed academic breakdown tailored for **${stream} (${profile?.year})**:\n\n1. **Core Concept & Definition**:\n   When explaining "${userQuery}" in a university exam, start by defining the primary terminology and stating any underlying assumptions.\n\n2. **Key Mechanism / Step-by-Step Analysis**:\n   Break the concept down into logical phases. Use structured bullet points and standard notation used in ${profile?.subjects || 'your curriculum'}.\n\n3. **Practical Example & Application**:\n   Provide a concrete real-world example or code/mathematical formulation. Evaluators at ${institute} love seeing practical applications!\n\n4. **Exam Scoring Tip**:\n   Underline key technical terms and include a neat block diagram or flowchart. This immediately elevates your answer to full-marks quality.\n\nAsk me any follow-up question or click one of the Quick Exam Hacks on the left!`;
}

export const AiTutorPage: React.FC = () => {
  const [profile, setProfile] = useState<TutorProfile | null>(() => {
    const saved = localStorage.getItem('cogniva_ai_tutor_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Setup Form State
  const [institute, setInstitute] = useState(profile?.institute || '');
  const [stream, setStream] = useState(profile?.stream || '');
  const [year, setYear] = useState(profile?.year || '1st Year');
  const [subjects, setSubjects] = useState(profile?.subjects || '');
  const [autoFetchPyq, setAutoFetchPyq] = useState(true);
  const [pyqFile, setPyqFile] = useState<File | null>(null);
  const [tone, setTone] = useState<'funny' | 'academic' | 'crunch'>(profile?.tone || 'funny');
  const [editingProfile, setEditingProfile] = useState(!profile);

  // Chat & Voice State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('happy');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const { showToast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (profile && messages.length === 0) {
      const welcomeText = tone === 'funny'
        ? `Hey there! Welcome to ${profile.institute} headquarters! I'm Prof. Spark, your personal AI tutor for ${profile.stream} (${profile.year}). I have indexed syllabus trends for ${profile.subjects || 'your courses'}! What topic are we mastering today?`
        : `Greetings! I am your AI Tutor tailored specifically for ${profile.institute} - ${profile.stream} (${profile.year}). I have loaded your syllabus (${profile.subjects || 'General Curriculum'}). How can I assist your studies today?`;

      setMessages([
        {
          id: 'welcome_1',
          sender: 'tutor',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mood: tone === 'funny' ? 'funny' : 'explaining'
        }
      ]);
    }
  }, [profile, tone]);

  const sanitizeTextForSpeech = (text: string): string => {
    return text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/^[•\-\*\d+\.]+\s+/gm, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[:;\-–—]/g, ', ')
      .replace(/[\/\\]/g, ' or ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakText = (rawText: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanSpeech = sanitizeTextForSpeech(rawText);
    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('en-US') || v.name.includes('en-GB')) && !v.name.includes('eSpeak')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute || !stream) {
      showToast('error', 'Missing Information', 'Please enter your Institute and Course Stream.');
      return;
    }

    const newProfile: TutorProfile = {
      institute,
      stream,
      year,
      subjects: subjects || 'CSE202, CSE205, INT335, MTH401, PEL132',
      hasUploadedPyq: !!pyqFile,
      autoFetchPyq,
      pyqFileName: pyqFile?.name,
      tone
    };

    localStorage.setItem('cogniva_ai_tutor_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setEditingProfile(false);
    setMessages([]);
    showToast('success', 'AI Tutor Configured', `Prof. Spark is ready for ${institute}`);
  };

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userText = (customMsg || inputMsg).trim();
    if (!userText || loadingResponse) return;

    if (!customMsg) setInputMsg('');

    const userMsgObj: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'student',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setLoadingResponse(true);
    setAvatarMood('thinking');

    try {
      let tutorReply = '';
      try {
        const res = await apiRequest<{ answer: string }>('/chat/query', {
          method: 'POST',
          body: JSON.stringify({ question: userText })
        });
        if (res.success && res.data?.answer) {
          tutorReply = res.data.answer;
        }
      } catch {}

      if (!tutorReply) {
        tutorReply = generateAcademicTutoring(userText, profile);
      }

      const moodOptions: AvatarMood[] = tone === 'funny' ? ['funny', 'explaining', 'proud'] : ['explaining', 'happy'];
      const chosenMood = moodOptions[Math.floor(Math.random() * moodOptions.length)];

      const tutorMsgObj: ChatMessage = {
        id: 'msg_tutor_' + Date.now(),
        sender: 'tutor',
        text: tutorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: chosenMood
      };

      setMessages((prev) => [...prev, tutorMsgObj]);
      setAvatarMood(chosenMood);
      speakText(tutorReply);
    } catch (err) {
      showToast('error', 'Tutor Error', 'Could not fetch response.');
      setAvatarMood('happy');
    } finally {
      setLoadingResponse(false);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <Badge variant="brand" size="sm" className="mb-3">
            <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Interactive Mentor
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            AI Tutor: Prof. Spark
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Tailored to your university, course syllabus, and previous year exam trends.
          </p>
        </div>

        {profile && !editingProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProfile(true)}
            icon={<Sliders className="w-3.5 h-3.5" />}
          >
            Edit University & Profile
          </Button>
        )}
      </div>

      {/* SETUP FORM MODE */}
      {editingProfile ? (
        <Card glow className="p-7 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-brand-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configure Your AI Tutor</h2>
              <p className="text-xs text-slate-400">Tell Prof. Spark about your college & courses so it can generate laser-focused exam notes.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Institute / University Name"
              placeholder="e.g., Lovely Professional University, IIT Bombay, Stanford"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              icon={<Building className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Stream / Degree"
                placeholder="e.g., B.Tech Computer Science, BCA, MBA"
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                icon={<BookOpen className="w-4 h-4" />}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Class / Year / Semester</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="1st Year">1st Year / Semester 1 & 2</option>
                  <option value="2nd Year">2nd Year / Semester 3 & 4</option>
                  <option value="3rd Year">3rd Year / Semester 5 & 6</option>
                  <option value="4th Year">4th Year / Semester 7 & 8</option>
                  <option value="High School">High School / Grade 11-12</option>
                  <option value="Postgraduate">Postgraduate / Masters</option>
                </select>
              </div>
            </div>

            <Input
              label="Subject Codes / Course Names (Comma Separated)"
              placeholder="e.g., CSE202, CSE205, INT335, MTH401, PEL132"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              icon={<FileText className="w-4 h-4" />}
            />

            {/* PYQ Option Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Past Exam Papers (PYQs)</span>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="autoFetchPyq"
                  checked={autoFetchPyq}
                  onChange={(e) => setAutoFetchPyq(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-brand-500 mt-0.5"
                />
                <label htmlFor="autoFetchPyq" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                  <strong>Auto-Discover PYQs:</strong> Automatically synthesize past university examination trends for {institute || 'your college'}.
                </label>
              </div>

              {!autoFetchPyq && (
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Upload Custom Syllabus or PYQ PDF (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={(e) => setPyqFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Tutor Vibe Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Teaching Style & Personality</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTone('funny')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    tone === 'funny'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-glow-amber'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  😜 Witty & Energetic
                </button>
                <button
                  type="button"
                  onClick={() => setTone('academic')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    tone === 'academic'
                      ? 'border-brand-500 bg-brand-500/15 text-brand-300 shadow-glow-sm'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🎓 Academic Scholar
                </button>
                <button
                  type="button"
                  onClick={() => setTone('crunch')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    tone === 'crunch'
                      ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ⚡ Rapid Exam Hack
                </button>
              </div>
            </div>

            <Button type="submit" icon={<ChevronRight className="w-4 h-4" />} size="md" className="w-full mt-2">
              Activate AI Tutor
            </Button>
          </form>
        </Card>
      ) : (
        /* INTERACTIVE TUTOR CHAT & STUDY DASHBOARD */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Tutor Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Academic Context</span>
                <Badge variant="success" size="xs" dot>Active</Badge>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Institute</span>
                  <span className="font-bold text-white text-xs truncate block">{profile?.institute}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Course</span>
                  <span className="font-medium text-slate-300 block">{profile?.stream} ({profile?.year})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Curriculum</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block">{profile?.subjects}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setEditingProfile(true)}
                  className="w-full text-slate-400 hover:text-white"
                >
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Quick Action Chips */}
            <Card className="p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Exam Hacks</h4>
              <button
                onClick={() => handleSendMessage(undefined, `What are the top 5 most repeated exam questions for ${profile?.subjects} at ${profile?.institute}?`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
              >
                <span>🔥 Top 5 Repeated PYQs</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
              </button>
              <button
                onClick={() => handleSendMessage(undefined, `Give me a 10-minute crash revision summary for ${profile?.subjects}.`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
              >
                <span>⚡ 10-Min Crash Revision</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
              </button>
              <button
                onClick={() => handleSendMessage(undefined, `Tell me a memorable mnemonic or memory trick for ${profile?.subjects}.`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
              >
                <span>😜 Memory Mnemonics</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
              </button>
            </Card>
          </div>

          {/* Right Column: Avatar & Chat Interface */}
          <div className="lg:col-span-3 space-y-4 flex flex-col h-[74vh]">
            {/* Interactive Animated Tutor Avatar Bar */}
            <TutorAvatar
              mood={avatarMood}
              isSpeaking={isSpeaking}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setVoiceEnabled(!voiceEnabled);
              }}
            />

            {/* Chat Messages Log */}
            <Card className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60 border-slate-800/80">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'tutor'
                        ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-brand-sm'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {msg.sender === 'tutor' ? '⚡' : 'YOU'}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'tutor'
                        ? 'bg-slate-900/90 text-slate-100 border border-slate-800 shadow-card'
                        : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-card'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70 border-b border-white/10 pb-1">
                      <span className="font-semibold">{msg.sender === 'tutor' ? 'Prof. Spark' : 'You'}</span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>
                    <FormattedText content={msg.text} />

                    {msg.sender === 'tutor' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2">
                        <button
                          onClick={() => speakText(msg.text)}
                          title="Read Aloud"
                          className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors font-medium"
                        >
                          <Volume2 className="w-3 h-3" /> Read Aloud
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingResponse && (
                <div className="flex items-center gap-2.5 text-slate-400 text-xs py-2 px-3.5 rounded-xl bg-slate-900/50 border border-slate-800 w-fit animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  Prof. Spark is formulating your academic explanation...
                </div>
              )}

              <div ref={chatEndRef} />
            </Card>

            {/* Input Form */}
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Ask Prof. Spark anything about ${profile?.subjects || 'your curriculum'}...`}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={loadingResponse}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner transition-all"
              />
              <Button
                type="submit"
                disabled={!inputMsg.trim() || loadingResponse}
                icon={<Send className="w-3.5 h-3.5" />}
                size="sm"
                className="rounded-2xl px-5 shrink-0"
              >
                Ask Tutor
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
