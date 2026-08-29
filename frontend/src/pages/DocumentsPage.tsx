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
  X
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

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', 'Invalid File Type', 'Please select a PDF document (.pdf).');
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
      showToast('error', 'No File Selected', 'Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    const res = await uploadDocumentApi(selectedFile, customTitle);
    setUploading(false);

    if (res.success && res.data) {
      showToast('success', 'Document Uploaded!', `${res.data.title} is ready for study.`);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setCustomTitle('');
      fetchDocuments();
    } else {
      showToast('error', 'Upload Failed', res.message || 'Could not process PDF.');
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
      showToast('success', 'Document Deleted', 'The document and its index were removed.');
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Study Material</h1>
            <Badge variant="brand" size="sm">{documents.length} Documents</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Upload lecture notes, textbook chapters, and syllabus PDFs for grounded AI Q&A and quizzes.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Upload PDF Material
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search documents by title or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" count={3} />
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {searchQuery ? 'No matching documents found' : 'No study materials in Cogniva Library yet'}
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            {searchQuery
              ? 'Try adjusting your search keywords.'
              : 'Upload your first PDF lecture slides or reading material to unlock grounded AI study chat and customized quizzes.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsUploadOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Upload First Document
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hover className="flex flex-col justify-between p-6">
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge
                    variant={
                      doc.processing_status === 'ready'
                        ? 'success'
                        : doc.processing_status === 'processing'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {doc.processing_status === 'ready' && <CheckCircle2 className="w-3 h-3" />}
                    {doc.processing_status === 'processing' && <Clock className="w-3 h-3 animate-spin" />}
                    {doc.processing_status === 'failed' && <AlertCircle className="w-3 h-3" />}
                    {doc.processing_status.toUpperCase()}
                  </Badge>
                </div>

                {/* Title and Filename */}
                <h3 className="font-bold text-base text-white tracking-tight line-clamp-1 mb-1" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono line-clamp-1 mb-4" title={doc.file_name}>
                  {doc.file_name}
                </p>

                {/* Metadata Tags */}
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
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
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenPreview(doc)}
                    title="View Extracted Pages"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    title="Ask Cogniva AI about this document"
                    className="p-2 rounded-xl text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/quizzes')}
                    title="Generate Quiz from this document"
                    className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setDocToDelete(doc)}
                  title="Delete Document"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
        title="Upload Study Material (PDF)"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <File className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-slate-100">{selectedFile.name}</span>
                <span className="text-xs text-slate-400 mt-1">{formatBytes(selectedFile.size)} • PDF Document</span>
                <span className="text-xs text-brand-400 mt-2 font-medium">Click to choose a different file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-slate-200">
                  Drag and drop your PDF here, or <span className="text-brand-400 underline">browse</span>
                </span>
                <span className="text-xs text-slate-500 mt-1">Supports PDF textbooks, notes, and slides up to 20MB</span>
              </div>
            )}
          </div>

          <Input
            label="Document Title (Optional)"
            placeholder="e.g., CS 101 Lecture 3 - Memory Hierarchy"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            disabled={uploading}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsUploadOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              disabled={!selectedFile}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              {uploading ? 'Processing PDF...' : 'Upload & Process'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Detail / Extracted Pages Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
        maxWidth="xl"
      >
        {previewDoc && (
          <div className="space-y-5 max-h-[75vh] flex flex-col">
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0">
              <span><strong>File:</strong> {previewDoc.file_name}</span>
              <span>•</span>
              <span><strong>Size:</strong> {formatBytes(previewDoc.file_size)}</span>
              <span>•</span>
              <span><strong>Pages:</strong> {previewDoc.page_count}</span>
            </div>

            {loadingPages ? (
              <div className="py-8 text-center space-y-2">
                <Skeleton className="h-20 w-full" count={3} />
              </div>
            ) : previewPages.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No text extracted for this document.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {previewPages.map((page) => (
                  <div
                    key={page.page_number}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1.5">
                      <span>Page {page.page_number}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {page.char_count} chars • ~{page.token_count} tokens
                      </span>
                    </div>
                    <p className="text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {page.text || '<No selectable text on this page>'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              <span className="text-xs text-slate-500">Ready for semantic chunking & RAG retrieval</span>
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
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to delete <strong className="text-white">{docToDelete?.title}</strong>? This will permanently remove the PDF and its indexed text.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
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
