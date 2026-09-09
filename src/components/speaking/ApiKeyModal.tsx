import { useState } from 'react';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getGeminiApiKey, hasGeminiApiKey, setGeminiApiKey } from '@/services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeyUpdated }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState(() => getGeminiApiKey());
  const [isSaving, setIsSaving] = useState(false);
  const isConfigured = hasGeminiApiKey();

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    try {
      setGeminiApiKey(keyInput.trim());
      toast.success(keyInput.trim() ? 'Đã lưu Gemini API Key thành công!' : 'Đã xóa API Key (dùng chế độ mô phỏng)');
      onKeyUpdated?.();
      onClose();
    } catch (e) {
      toast.error('Có lỗi xảy ra khi lưu API key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <Card className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Icons.X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Icons.Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cấu hình Gemini AI Key</h3>
            <p className="text-xs text-slate-500">Google Gemini Flash API</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-slate-600">
            Để AI có thể phản hồi thời gian thực và phân tích bài nói chi tiết, bạn có thể dán <strong>Gemini API Key</strong> miễn phí lấy từ Google AI Studio.
          </p>

          <div className="rounded-lg bg-sky-50 p-3 text-xs text-sky-800 border border-sky-100 flex items-start gap-2">
            <Icons.Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
            <div>
              <span>Chưa có key? </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-sky-700 hover:text-sky-900 inline-flex items-center gap-0.5"
              >
                <span>Lấy miễn phí tại Google AI Studio</span>
                <Icons.ExternalLink className="h-3 w-3 inline" />
              </a>
              <span className="block mt-0.5 text-[11px] text-sky-600">
                (Miễn phí 1.500 lượt gọi/ngày, không cần thẻ tín dụng)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            {isConfigured && (
              <span className="mt-1 inline-block text-[11px] font-semibold text-emerald-600">
                ✓ Đang sử dụng API Key
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
