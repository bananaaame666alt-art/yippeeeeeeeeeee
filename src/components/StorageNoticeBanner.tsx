import React, { useRef, useState } from 'react';
import { Database, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';

export const StorageNoticeBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afterhello-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedback('Backup exported successfully');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importBackupJson(content);
      if (res.success) {
        setFeedback(res.message);
      } else {
        alert(res.message);
      }
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSample = () => {
    if (window.confirm('Reset all people and events to realistic fictional sample data? Any new entries you created will be replaced.')) {
      StorageService.resetToSampleData();
      setFeedback('Reset to fictional sample data');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="bg-[#F5F1EA] border-b border-[#E8E2D8] text-xs text-[#5B635D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#264E36] shrink-0" />
          <span>
            <strong className="text-[#1F2B23] font-medium">Local Browser Storage</strong>
            <span className="hidden sm:inline"> · Stored securely in your browser. Real .ics calendar import/export included. Fictional sample data enabled.</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <span className="flex items-center gap-1 text-[#264E36] font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{feedback}</span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              title="Download your people and events as JSON"
              className="hover:text-[#1F2B23] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Backup JSON
            </button>
            <span aria-hidden="true" className="text-[#C4BCB0]">·</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore from JSON backup file"
              className="hover:text-[#1F2B23] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Restore JSON
            </button>
            <span aria-hidden="true" className="text-[#C4BCB0]">·</span>
            <button
              onClick={handleResetSample}
              title="Reset sample contacts and events"
              className="hover:text-[#1F2B23] text-[#7A6B56] transition-colors cursor-pointer"
            >
              Reset Sample
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
