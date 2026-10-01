import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Layers,
  File,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { formatBytes, formatDate, formatTimeAgo } from '../utils/formatters';
import {
  listDocumentsApi,
  uploadDocumentApi,
  deleteDocumentApi,
  getDocumentPagesApi
} from '../api/documents';
import { Document } from '../types';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Detail / Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewPages, setPreviewPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Delete Confirmation Modal State
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await listDocumentsApi();
    if (res.success && res.data) {
      setDocuments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md'];

  const handleFileSelect = (file: File) => {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    if (!ALLOWED_EXTS.includes(ext)) {
      showToast('error', 'Invalid File Type', 'Supported formats: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Text (.txt), and Markdown (.md).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum allowed file size is 20MB.');
      return;
    }
    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('error', 'No File Selected', 'Please select a file to upload.');
      return;
    }

    setUploading(true);
    const res = await uploadDocumentApi(selectedFile, customTitle);
    setUploading(false);

    if (res.success && res.data) {
      showToast('success', 'Document Uploaded!', `${res.data.title} is now indexed for study.`);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setCustomTitle('');
      fetchDocuments();
    } else {
      showToast('error', 'Upload Failed', res.message || 'Could not process document.');
    }
  };

  const handleOpenPreview = async (doc: Document) => {
    setPreviewDoc(doc);
    setLoadingPages(true);
    const res = await getDocumentPagesApi(doc.id);
    if (res.success && res.data) {
      setPreviewPages(res.data);
    } else {
      setPreviewPages([]);
    }
    setLoadingPages(false);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    const res = await deleteDocumentApi(docToDelete.id);
    setDeleting(false);

    if (res.success) {
      showToast('success', 'Document Deleted', 'The document and its semantic index were removed.');
      setDocToDelete(null);
      setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
    } else {
      showToast('error', 'Deletion Failed', res.message || 'Could not delete document.');
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-7 animate-fade-in-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <Badge variant="brand" size="sm" className="mb-3">
            <BookOpen className="w-3 h-3 mr-1" /> Knowledge Vault
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Study Material
            <span className="text-slate-500 text-lg font-normal">({documents.length})</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Upload lecture notes, textbooks, and syllabus PDFs for grounded AI Q&A and active recall quizzes.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          size="sm"
          className="shrink-0"
        >
          Upload Material
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search documents by title or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        {documents.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{documents.filter(d => d.processing_status === 'ready').length} Ready</span>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-800/80 bg-slate-950/30">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">
            {searchQuery ? 'No matching documents found' : 'Your vault is currently empty'}
          </h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-5 leading-relaxed">
            {searchQuery
              ? 'Try searching with different keywords or check spelling.'
              : 'Upload lecture slides, reading PDFs, or syllabus documents to unlock grounded AI chat and smart quizzes.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsUploadOpen(true)} icon={<Plus className="w-3.5 h-3.5" />} size="sm">
              Upload First Document
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hover className="group flex flex-col justify-between p-5 border-slate-800/70 hover:border-brand-500/30">
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <Badge
                    variant={
                      doc.processing_status === 'ready'
                        ? 'success'
                        : doc.processing_status === 'processing'
                        ? 'warning'
                        : 'danger'
                    }
                    size="xs"
                    dot
                  >
                    {doc.processing_status === 'ready' ? 'Indexed' : doc.processing_status}
                  </Badge>
                </div>

                {/* Title and Filename */}
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors truncate mb-1" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono truncate mb-3" title={doc.file_name}>
                  {doc.file_name}
                </p>

                {/* Metadata Tags */}
                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mb-3.5 pb-3 border-b border-slate-800/60 font-mono">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" />
                    {doc.page_count} Pages
                  </span>
                  <span>•</span>
                  <span>{formatBytes(doc.file_size)}</span>
                  <span>•</span>
                  <span title={formatDate(doc.created_at)}>{formatTimeAgo(doc.created_at)}</span>
                </div>

                {/* Summary snippet if ready */}
                {doc.summary && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {doc.summary}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenPreview(doc)}
                    title="View Extracted Pages"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    title="Ask Cogniva AI"
                    className="p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/quizzes')}
                    title="Generate Quiz"
                    className="p-1.5 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setDocToDelete(doc)}
                  title="Delete Document"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => !uploading && setIsUploadOpen(false)}
        title="Upload Study Material"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                  <File className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-100">{selectedFile.name}</span>
                <span className="text-xs text-slate-400 mt-0.5">{formatBytes(selectedFile.size)} • Ready to upload</span>
                <span className="text-[11px] text-brand-400 mt-2 font-medium">Click to choose a different file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-2.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-slate-200">
                  Drag & drop your file here, or <span className="text-brand-400 underline">browse</span>
                </span>
                <span className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supports PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Text (.txt), and Markdown (.md) up to 20MB
                </span>
              </div>
            )}
          </div>

          <Input
            label="Document Title (Optional)"
            placeholder="e.g., CS202 - Object Oriented Programming"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            disabled={uploading}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={uploading}
              disabled={!selectedFile}
              icon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              {uploading ? 'Processing File...' : 'Upload & Index'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Extracted Pages Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
        maxWidth="xl"
      >
        {previewDoc && (
          <div className="space-y-4 max-h-[75vh] flex flex-col">
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0 font-mono">
              <span><strong>File:</strong> {previewDoc.file_name}</span>
              <span>•</span>
              <span><strong>Size:</strong> {formatBytes(previewDoc.file_size)}</span>
              <span>•</span>
              <span><strong>Pages:</strong> {previewDoc.page_count}</span>
            </div>

            {loadingPages ? (
              <div className="py-8 text-center space-y-2">
                <Skeleton className="h-16 w-full" count={3} />
              </div>
            ) : previewPages.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No text extracted for this document.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {previewPages.map((page) => (
                  <div
                    key={page.page_number}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800/80 pb-1">
                      <span>Page {page.page_number}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {page.char_count} chars • ~{page.token_count} tokens
                      </span>
                    </div>
                    <p className="text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                      {page.text || '<No selectable text on this page>'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">Vector index synced</span>
              <Button size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!docToDelete}
        onClose={() => !deleting && setDocToDelete(null)}
        title="Delete Document?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white">{docToDelete?.title}</strong>? This will permanently remove the file and its vector search indexes.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDocToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDeleteConfirm}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
