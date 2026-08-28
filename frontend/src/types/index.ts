export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_size: number;
  file_type: string;
  page_count: number;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  error_message?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CitationSource {
  document_id: string;
  document_title: string;
  page_number: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: CitationSource[];
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index?: number;
  explanation?: string;
  topic_tag?: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  completed_at: string;
}

export interface ProgressSummary {
  total_documents: number;
  total_questions_asked: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
  weak_topics: { topic: string; score: number; count: number }[];
  score_history: { date: string; score: number; quiz_title: string }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
