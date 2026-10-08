import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  PenTool,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { CORE_STROKE_DATA } from '@/data/chinese/stroke-data';
import type { HanziCharacterStrokeData } from '@/data/chinese/stroke-data';
import { speakChineseText } from '@/utils/chineseSpeech';

export default function HanziWritingPage() {
  const characters = Object.keys(CORE_STROKE_DATA);
  const [selectedChar, setSelectedChar] = useState<string>(characters[0]);
  const [showGuide, setShowGuide] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [animatedStrokeIdx, setAnimatedStrokeIdx] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const charData: HanziCharacterStrokeData =
    CORE_STROKE_DATA[selectedChar] || CORE_STROKE_DATA['一'];

  // Draw Tianzige / Mizige (米字格) Grid on Canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Canvas background — light theme
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Dashed Guidelines (Mizige 米)
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
    ctx.lineWidth = 1.5;

    // Horizontal & Vertical center
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);

    // Diagonals
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);

    ctx.stroke();
    ctx.setLineDash([]); // reset to solid
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
    setAnimatedStrokeIdx(0);
  }, [selectedChar]);

  // Stroke animation loop timer
  useEffect(() => {
    if (charData.strokes.length <= 1) return;
    const interval = setInterval(() => {
      setAnimatedStrokeIdx((prev) => (prev + 1) % (charData.strokes.length + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [charData]);

  // Canvas drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const handlePlayAudio = (text: string) => {
    speakChineseText(text, { rate: 0.8 });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
              Thư Pháp & Bút Thuận
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Lưới Mễ Tự (米字格)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tập Viết Chữ Hán Theo Thứ Tự Nét
          </h1>
        </div>

        {/* Clear & Guide controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              showGuide ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {showGuide ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Chữ mờ gợi ý: {showGuide ? 'BẬT' : 'TẮT'}</span>
          </button>

          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Xóa bảng vẽ</span>
          </button>
        </div>
      </div>

      {/* Character Selector Pill Bar */}
      <div className="flex flex-wrap gap-2 justify-center bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        {characters.map((ch) => (
          <button
            key={ch}
            onClick={() => setSelectedChar(ch)}
            className={`w-12 h-12 rounded-2xl text-xl font-black transition-all flex items-center justify-center cursor-pointer ${
              selectedChar === ch
                ? 'bg-gradient-to-br from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200/50 scale-105 ring-2 ring-rose-300'
                : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Canvas & Stroke Animation Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Interactive Writing Canvas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center shadow-sm space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <PenTool className="h-3.5 w-3.5 text-rose-500" />
            <span>Bảng vẽ tự do (Dùng chuột hoặc ngón tay cảm ứng):</span>
          </div>

          <div className="relative w-[320px] h-[320px] rounded-2xl overflow-hidden border-2 border-rose-200 shadow-inner bg-white">
            {/* Optional Ghost Guide Character beneath canvas */}
            {showGuide && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[220px] font-sans font-black text-rose-100 leading-none">
                {charData.character}
              </div>
            )}

            {/* HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="w-full h-full cursor-crosshair touch-none relative z-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCanvas}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              Xóa để viết lại
            </button>
            <button
              onClick={() => handlePlayAudio(charData.character)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Nghe phát âm</span>
            </button>
          </div>
        </div>

        {/* Character Stroke Order Animation & Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-3xl font-black text-slate-900">{charData.character}</span>
              <span className="ml-3 text-base font-bold font-mono text-rose-500">
                {charData.pinyin}
              </span>
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 font-mono">
              {charData.strokeCount} nét bút
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Ý nghĩa chữ Hán:
            </span>
            <div className="text-sm font-bold text-rose-600 mt-0.5">{charData.meaningVi}</div>
            <div className="text-xs text-slate-500 mt-1">
              Bộ thủ: <strong className="text-amber-600">{charData.radicals.join(', ')}</strong>
            </div>
          </div>

          {/* Stroke Order Demonstration Boxes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Thứ tự từng nét (Stroke Order):
            </span>

            <div className="flex flex-wrap gap-2 pt-1">
              {charData.strokes.map((stroke, sIdx) => {
                const isActive = sIdx <= animatedStrokeIdx;
                return (
                  <div
                    key={sIdx}
                    className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white border-rose-300 text-slate-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200/80 text-slate-300'
                    }`}
                  >
                    <svg viewBox="0 0 1024 1024" className="w-10 h-10 stroke-current fill-none">
                      {charData.strokes.slice(0, sIdx + 1).map((d, i) => (
                        <path
                          key={i}
                          d={d}
                          strokeWidth="80"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={i === sIdx ? 'stroke-rose-500' : 'stroke-slate-700'}
                        />
                      ))}
                    </svg>
                    <span className="text-[10px] font-mono font-bold mt-0.5">Nét {sIdx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-slate-600 leading-relaxed">
            💡 <strong className="text-amber-600">Quy tắc bút thuận vàng:</strong> Ngang trước sổ sau, trên trước dưới sau, trái trước phải sau, ngoài trước trong sau, vào trước đóng sau.
          </div>
        </div>
      </div>
    </div>
  );
}
