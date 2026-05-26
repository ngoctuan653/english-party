import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '@/services/firebase/config';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { seedDatabase } from '@/data/seedData';

type ImportType = 'questions' | 'vocabulary';

interface ImportError {
  row: number;
  message: string;
}

export default function AdminImportPage() {
  const [importType, setImportType] = useState<ImportType>('questions');
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: ImportError[];
  } | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const { questionsAdded, vocabAdded } = await seedDatabase();
      toast.success(`Seeded ${questionsAdded} questions and ${vocabAdded} vocab words!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to seed database.');
    } finally {
      setSeeding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
      setProgress(0);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setParsing(true);
    setResults(null);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        setParsing(false);
        const rows = parsed.data as any[];
        
        if (rows.length === 0) {
          toast.error('The CSV file is empty.');
          return;
        }

        setImporting(true);
        await processImport(rows);
      },
      error: (err) => {
        setParsing(false);
        toast.error(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const processImport = async (rows: any[]) => {
    const batchSize = 100;
    let success = 0;
    let failed = 0;
    const errors: ImportError[] = [];
    const total = rows.length;

    try {
      for (let i = 0; i < total; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = rows.slice(i, i + batchSize);

        chunk.forEach((row, idx) => {
          const rowNum = i + idx + 1;
          try {
            if (importType === 'questions') {
              validateAndAddQuestion(batch, row, rowNum);
            } else {
              validateAndAddVocab(batch, row, rowNum);
            }
            success++;
          } catch (err) {
            failed++;
            errors.push({
              row: rowNum,
              message: err instanceof Error ? err.message : 'Unknown validation error',
            });
          }
        });

        await batch.commit();
        setProgress(Math.round(((i + chunk.length) / total) * 100));
      }

      setResults({ total, success, failed, errors });
      if (failed === 0) {
        toast.success(`Successfully imported all ${success} items! 🎉`);
      } else {
        toast.error(`Import completed with ${failed} errors.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Import failed during transaction commit.');
    } finally {
      setImporting(false);
    }
  };

  const validateAndAddQuestion = (batch: any, row: any, rowNum: number) => {
    const question = row.question || row.Question;
    const choiceA = row.choiceA || row.choicea || row.A || row.a;
    const choiceB = row.choiceB || row.choiceb || row.B || row.b;
    const choiceC = row.choiceC || row.choicec || row.C || row.c;
    const choiceD = row.choiceD || row.choiced || row.D || row.d;
    let correctAnswer = row.correctAnswer || row.correctanswer || row.Answer || row.answer;
    const explanationEn = row.explanation || '';
    const explanationVi = row.explanationVi || row.explanationvi || row.explanation_vi || '';
    // Combine EN + VI with pipe delimiter for bilingual display
    const explanation = explanationVi
      ? `${explanationEn} | ${explanationVi}`
      : explanationEn;
    const part = Number(row.part || 5);
    const topic = row.topic || 'general';
    const difficulty = Number(row.difficulty || 700);

    if (!question) throw new Error('Missing question text.');
    if (!choiceA || !choiceB || !choiceC || !choiceD) {
      throw new Error('All 4 choices (A, B, C, D) are required.');
    }

    // Map answer (A/B/C/D or 0/1/2/3) to 0/1/2/3 index
    if (typeof correctAnswer === 'string') {
      correctAnswer = correctAnswer.trim().toUpperCase();
      if (correctAnswer === 'A') correctAnswer = 0;
      else if (correctAnswer === 'B') correctAnswer = 1;
      else if (correctAnswer === 'C') correctAnswer = 2;
      else if (correctAnswer === 'D') correctAnswer = 3;
      else correctAnswer = Number(correctAnswer);
    }

    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      throw new Error('Correct answer must be A, B, C, D or 0, 1, 2, 3.');
    }

    const id = `q_csv_${Date.now()}_${rowNum}`;
    const docRef = doc(db, 'questions', id);

    batch.set(docRef, {
      id,
      exam: 'toeic',
      part,
      type: 'mcq',
      topic,
      difficulty,
      question,
      choices: [choiceA, choiceB, choiceC, choiceD],
      correctAnswer,
      explanation,
      isActive: true,
      timesAnswered: 0,
      timesCorrect: 0,
      createdBy: 'csv_importer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const validateAndAddVocab = (batch: any, row: any, rowNum: number) => {
    const word = row.word || row.Word;
    const pronunciation = row.pronunciation || '';
    const partOfSpeech = row.partOfSpeech || row.partofspeech || 'noun';
    const definition = row.definition || row.Definition;
    const definitionNative = row.definitionNative || row.definitionnative || '';
    const example = row.example || '';
    const exampleTranslation = row.exampleTranslation || row.exampletranslation || '';
    const topic = row.topic || 'general';
    const difficulty = Number(row.difficulty || 700);
    const synonymsStr = row.synonyms || row.synonym || '';

    if (!word) throw new Error('Missing word field.');
    if (!definition) throw new Error('Missing definition field.');

    const synonyms = synonymsStr
      ? synonymsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const id = `w_csv_${Date.now()}_${rowNum}`;
    const docRef = doc(db, 'vocabulary', id);

    batch.set(docRef, {
      id,
      exam: 'toeic',
      word,
      pronunciation,
      partOfSpeech,
      definition,
      definitionNative,
      example,
      exampleTranslation,
      topic,
      difficulty,
      synonyms,
      tags: [topic],
      isActive: true,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="space-y-6 pb-8 text-slate-800 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">CSV Data Importer</h1>
        <p className="text-sm text-slate-505 mt-1">Bulk upload educational files to Firestore</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="space-y-6 md:col-span-1">
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Import Configuration</h2>

            {/* Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Import Category</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'questions', label: 'Questions', desc: 'TOEIC Part 5/6/7 items' },
                  { value: 'vocabulary', label: 'Vocabulary', desc: 'Flashcard words & translations' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setImportType(opt.value as ImportType);
                      setResults(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      importType === opt.value
                        ? 'bg-blue-50/50 border-[#0071E3] text-[#0071E3] shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Help */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px] text-slate-550 leading-relaxed">
              <p className="font-bold text-slate-705 flex items-center gap-1">
                <Icons.Info className="w-3.5 h-3.5 text-[#0071E3]" /> Expected Headers:
              </p>
              {importType === 'questions' ? (
                <code className="block bg-white p-2 rounded border border-slate-200 font-mono text-[9px] break-all text-slate-700">
                  question,choiceA,choiceB,choiceC,choiceD,correctAnswer,explanation,explanationVi,part,topic,difficulty
                </code>
              ) : (
                <code className="block bg-white p-2 rounded border border-slate-200 font-mono text-[9px] break-all text-slate-700">
                  word,pronunciation,partOfSpeech,definition,definitionNative,example,exampleTranslation,topic,difficulty,synonyms
                </code>
              )}
            </div>
          </Card>

          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Database Seeding</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don't have a CSV file? Seed the database with high-quality sample TOEIC Part 5 questions and vocabulary words.
            </p>
            <Button
              onClick={handleSeedData}
              isLoading={seeding}
              disabled={importing || parsing}
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Seed Sample Data
            </Button>
          </Card>
        </div>

        {/* Upload Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white border border-slate-200/60 shadow-sm space-y-6 flex flex-col items-center text-center">
            <Icons.UploadCloud className="w-12 h-12 text-[#0071E3] animate-pulse" />

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Select CSV File</h3>
              <p className="text-xs text-slate-500">Upload a comma-separated value file containing your dataset</p>
            </div>

            <div className="w-full max-w-sm">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="block w-full py-6 border-2 border-dashed border-slate-200 hover:border-[#0071E3]/50 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all font-semibold text-xs text-slate-600"
              >
                {file ? file.name : 'Click to Browse File'}
              </label>
            </div>

            <Button
              onClick={handleImport}
              isLoading={parsing || importing}
              disabled={!file}
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] font-semibold text-white shadow-sm"
            >
              Start Import Session
            </Button>
          </Card>

          {/* Import Progress / Results */}
          {(importing || results) && (
            <Card className="p-5 bg-white border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Progress Tracker</h3>
              
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading batch transactions...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} height="sm" />
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-slate-550 font-bold uppercase">Total Rows</p>
                      <p className="text-lg font-black text-slate-800 mt-1">{results.total}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Success</p>
                      <p className="text-lg font-black text-emerald-700 mt-1">{results.success}</p>
                    </div>
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                      <p className="text-[10px] text-rose-600 font-bold uppercase">Failed</p>
                      <p className="text-lg font-black text-rose-700 mt-1">{results.failed}</p>
                    </div>
                  </div>

                  {results.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-rose-600">Error Details:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 scrollbar-thin text-left">
                        {results.errors.map((err, idx) => (
                          <div key={idx} className="text-[10px] leading-relaxed text-slate-500">
                            <span className="text-rose-600 font-bold">Row {err.row}:</span> {err.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
