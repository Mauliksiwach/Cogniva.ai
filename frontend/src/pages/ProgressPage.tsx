import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TrendingUp, Sparkles } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Learning Insights</h1>
            <Badge variant="brand" size="sm">Performance Overview</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Track quiz scores over time, identify weak areas, and monitor retention.
          </p>
        </div>
        <Button size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Refresh Insights
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Learning Insights Dashboard Ready</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Track your progress, average scores, and weak topics as you complete assessments.
        </p>
      </Card>
    </div>
  );
};
