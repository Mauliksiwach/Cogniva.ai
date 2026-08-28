import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Sparkles } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Documents & Study Materials</h1>
            <Badge variant="brand" size="sm">Workspace</Badge>
          </div>
          <p className="text-slate-400 text-sm">Upload, inspect, and manage your course PDFs with automatic chunking and indexing.</p>
        </div>
        <Button size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Action
        </Button>
      </div>
      <Card className="p-12 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Documents & Study Materials</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Upload, inspect, and manage your course PDFs with automatic chunking and indexing.</p>
      </Card>
    </div>
  );
};
