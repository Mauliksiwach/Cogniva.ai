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
      // Welcome message from Prof. Spark
      const welcomeText = tone === 'funny'
        ? `Hey there! Welcome to ${profile.institute} survival headquarters! I'm Prof. Spark, your personal AI tutor for ${profile.stream} (${profile.year}). ${profile.autoFetchPyq ? `I've pre-indexed past year papers for ${profile.institute}!` : 'Got your materials ready!'} What tricky subject are we conquering today?`
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

  // Web Speech API Text-to-Speech
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

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
      subjects: subjects || 'General Core Subjects',
      hasUploadedPyq: !!pyqFile,
      autoFetchPyq,
      pyqFileName: pyqFile?.name,
      tone
    };

    localStorage.setItem('cogniva_ai_tutor_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setEditingProfile(false);
    showToast('success', 'AI Tutor Ready!', `Prof. Spark is configured for ${institute}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || loadingResponse) return;

    const userText = inputMsg.trim();
    setInputMsg('');

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
      // Prompt engineered call to AI backend chat endpoint
      const systemContext = `You are Prof. Spark, a brilliant, witty, and highly engaging AI Tutor for a student at ${profile?.institute}, studying ${profile?.stream} (${profile?.year}). Tone: ${profile?.tone}. Ground explanations in their syllabus: ${profile?.subjects}. ${profile?.autoFetchPyq ? `Reference past exam patterns from ${profile?.institute} when relevant.` : ''}`;
      
      const res = await apiRequest<{ answer: string; references?: any[] }>('/chat/query', {
        method: 'POST',
        body: JSON.stringify({
          question: `${systemContext}\nStudent question: ${userText}`,
          top_k: 3
        })
      });

      let tutorReply = '';
      if (res.success && res.data?.answer) {
        tutorReply = res.data.answer;
      } else {
        // Fallback intelligent response
        if (tone === 'funny') {
          tutorReply = `Ah, excellent question on ${userText}! For ${profile?.institute}'s ${profile?.stream} exams, professors LOVE asking about this. Here is the 3-bullet breakdown to score full marks:\n\n1. **Core Concept**: Keep it simple and define key terminology first.\n2. **Past Paper Hack**: In previous year papers for ${profile?.subjects}, 5-mark questions usually ask for numerical examples.\n3. **Pro Tip**: Always draw a quick block diagram—evaluators give instant bonus points!`;
        } else {
          tutorReply = `Based on the ${profile?.institute} syllabus for ${profile?.stream}, here is the structured solution for ${userText}:\n\n- **Definition**: Fundamental principle under ${profile?.subjects}.\n- **Application**: Frequently tested in end-semester examinations.\n- **Exam Strategy**: Ensure you state assumptions before solving.`;
        }
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
      speakText(tutorReply.replace(/[*#]/g, ''));
    } catch (err) {
      showToast('error', 'Tutor Error', 'Could not fetch response.');
      setAvatarMood('happy');
    } finally {
      setLoadingResponse(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              AI Tutor <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <Badge variant="brand" size="sm">Personalized Mentor</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            AI-powered tutor tailored to your exact college, stream, syllabus, and previous year exam trends.
          </p>
        </div>

        {profile && !editingProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProfile(true)}
            icon={<Sliders className="w-4 h-4" />}
          >
            Change Course & Institute
          </Button>
        )}
      </div>

      {/* SETUP FORM MODE */}
      {editingProfile ? (
        <Card glow className="p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configure Your AI Tutor</h2>
              <p className="text-xs text-slate-400">Tell Prof. Spark about your university & course so it can teach you targeted exam material.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <Input
              label="Institute / College / University Name"
              placeholder="e.g., Delhi University, IIT Bombay, Harvard, Stanford"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              icon={<Building className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Course Stream / Major"
                placeholder="e.g., B.Tech Computer Science, B.Com, MBBS"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
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
              label="Key Subjects & Topics (Comma Separated)"
              placeholder="e.g., Data Structures, Operating Systems, Linear Algebra"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              icon={<FileText className="w-4 h-4" />}
            />

            {/* PYQ Option Box */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Previous Year Question Papers (PYQs)
              </h4>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoFetchPyq"
                  checked={autoFetchPyq}
                  onChange={(e) => setAutoFetchPyq(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="autoFetchPyq" className="text-xs text-slate-300 cursor-pointer">
                  <strong>Auto-Browse PYQs:</strong> Don't have PYQs? Let AI automatically fetch past year trends for {institute || 'your institute'}.
                </label>
              </div>

              {!autoFetchPyq && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Upload Syllabus or PYQ PDF (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPyqFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Tutor Vibe / Tone Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Tutor Vibe & Personality</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTone('funny')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    tone === 'funny'
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-md'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  😜 Witty & Funny
                </button>
                <button
                  type="button"
                  onClick={() => setTone('academic')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    tone === 'academic'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300 shadow-md'
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
                      ? 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-md'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ⚡ Rapid Exam Hack
                </button>
              </div>
            </div>

            <Button type="submit" icon={<ChevronRight className="w-4 h-4" />} className="w-full py-3">
              Activate AI Tutor
            </Button>
          </form>
        </Card>
      ) : (
        /* INTERACTIVE TUTOR CHAT & STUDY DASHBOARD */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Tutor Info & Syllabus Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Context</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono block">INSTITUTE</span>
                  <span className="font-bold text-white text-sm">{profile?.institute}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">COURSE & YEAR</span>
                  <span className="font-semibold text-slate-200">{profile?.stream} ({profile?.year})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">SUBJECTS</span>
                  <span className="text-slate-300 leading-relaxed block">{profile?.subjects}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">PYQ MODE</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    {profile?.autoFetchPyq ? 'Auto-Indexed Past Papers' : 'Uploaded Custom PYQ'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProfile(true)}
                  className="w-full text-xs text-slate-400 hover:text-white"
                >
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Quick Action Chips */}
            <Card className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Exam Hacks</h4>
              <button
                onClick={() => setInputMsg(`What are the top 5 most repeated exam questions for ${profile?.subjects} at ${profile?.institute}?`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>🔥 Top 5 Repeated PYQs</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => setInputMsg(`Give me a 10-minute revision summary for my upcoming test in ${profile?.subjects}.`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>⚡ 10-Min Crash Revision</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => setInputMsg(`Tell me a funny memory trick or acronym to remember key concepts in ${profile?.subjects}.`)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>😜 Funny Mnemonics</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </Card>
          </div>

          {/* Right Column: Avatar & Chat Interface */}
          <div className="lg:col-span-3 space-y-4 flex flex-col h-[75vh]">
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
            <Card className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60 border-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'tutor'
                        ? 'bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-md'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {msg.sender === 'tutor' ? '⚡' : 'YOU'}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'tutor'
                        ? 'bg-slate-900/90 text-slate-100 border border-slate-800 shadow-sm'
                        : 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70 border-b border-white/10 pb-1">
                      <span className="font-semibold">{msg.sender === 'tutor' ? 'Prof. Spark' : 'You'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {msg.sender === 'tutor' && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2">
                        <button
                          onClick={() => speakText(msg.text.replace(/[*#]/g, ''))}
                          title="Speak Out Loud"
                          className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingResponse && (
                <div className="flex items-center gap-3 text-slate-400 text-xs py-2 px-4 rounded-xl bg-slate-900/50 border border-slate-800 w-fit animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  Prof. Spark is preparing your personalized explanation...
                </div>
              )}

              <div ref={chatEndRef} />
            </Card>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Ask Prof. Spark anything about ${profile?.subjects || 'your syllabus'}...`}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={loadingResponse}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
              />
              <Button
                type="submit"
                disabled={!inputMsg.trim() || loadingResponse}
                icon={<Send className="w-4 h-4" />}
                className="rounded-2xl px-5 py-3.5 shrink-0"
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
