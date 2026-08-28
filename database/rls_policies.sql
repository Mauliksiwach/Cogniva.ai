-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents Policies
CREATE POLICY "Users can view their own documents"
    ON public.documents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON public.documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Document Chunks Policies
CREATE POLICY "Users can view their own document chunks"
    ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document chunks"
    ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document chunks"
    ON public.document_chunks FOR DELETE USING (auth.uid() = user_id);

-- Topics Policies
CREATE POLICY "Users can view their own topics"
    ON public.topics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own topics"
    ON public.topics FOR ALL USING (auth.uid() = user_id);

-- Conversations Policies
CREATE POLICY "Users can manage their own conversations"
    ON public.conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage conversation_documents"
    ON public.conversation_documents FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_documents.conversation_id
            AND c.user_id = auth.uid()
        )
    );

-- Messages Policies
CREATE POLICY "Users can manage their own messages"
    ON public.messages FOR ALL USING (auth.uid() = user_id);

-- Quizzes & Quiz Questions Policies
CREATE POLICY "Users can manage their own quizzes"
    ON public.quizzes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access quiz questions for their quizzes"
    ON public.quiz_questions FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND q.user_id = auth.uid()
        )
    );

-- Quiz Attempts & Answers Policies
CREATE POLICY "Users can manage their own quiz attempts"
    ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access quiz answers for their attempts"
    ON public.quiz_answers FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_answers.attempt_id
            AND qa.user_id = auth.uid()
        )
    );

-- User Progress Policies
CREATE POLICY "Users can view and manage their progress"
    ON public.user_progress FOR ALL USING (auth.uid() = user_id);
