import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { HelpCircle, Sparkles } from 'lucide-react';

export const QuizzesPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Cogniva Quiz</h1>
            <Badge variant="brand" size="sm">Active Recall</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Generate multiple-choice quizzes (5, 10, 20 questions) at Easy, Medium, or Hard difficulty.
          </p>
        </div>
        <Button size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Generate Quiz
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Cogniva Quiz Engine Ready</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Select any study material to generate adaptive practice assessments with detailed explanations.
        </p>
      </Card>
    </div>
  );
};
