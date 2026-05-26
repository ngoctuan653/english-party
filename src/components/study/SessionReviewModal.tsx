import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { StudySession } from '@/types/study';
import type { Question } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';
import { formatDuration, formatTimestamp, getAccuracyColor } from '@/utils/helpers';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: StudySession | null;
  onPracticeQuizAgain?: (questions: Question[]) => void;
}

const LISTENING_QUESTIONS_MOCK: Record<string, any> = {
  'listening_set_1_q1': {
    id: 'listening_set_1_q1',
    question: 'What does the man suggest?',
    choices: [
      'Rescheduling the meeting',
      'Hiring more staff',
      'Ordering new equipment',
      'Extending the deadline'
    ],
    correctAnswer: 0,
    explanation: 'The man says "I think we should reschedule the team meeting to Wednesday afternoon." | Dịch nghĩa: Tôi nghĩ chúng ta nên dời cuộc họp nhóm sang chiều thứ Tư. | Giải thích: Người đàn ông đề xuất dời lịch cuộc họp đội nhóm.',
    topic: 'Office Conversation',
    part: 3,
  }
};

export default function SessionReviewModal({
  isOpen,
  onClose,
  session,
  onPracticeQuizAgain,
}: SessionReviewModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]); // holds Questions or VocabWords
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    if (!isOpen || !session) return;
    
    async function fetchDetails() {
      setLoading(true);
      setItems([]);
      try {
        const ids = session!.answers.map((a) => a.questionId).filter(Boolean);
        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        if (session!.type === 'listening') {
          // Use listening mocks
          const mockData = ids.map(id => LISTENING_QUESTIONS_MOCK[id] || {
            id,
            question: 'Listening Question',
            choices: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Listening practice session item.'
          });
          setItems(mockData);
        } else {
          const collectionName = session!.type === 'vocabulary' ? 'vocabulary' : 'questions';
          const fetchedItems = await Promise.all(
            ids.map(async (id) => {
              const snap = await getDoc(doc(db, collectionName, id));
              if (snap.exists()) {
                return { id: snap.id, ...snap.data() };
              }
              return null;
            })
          );
          setItems(fetchedItems.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load session details:', err);
        toast.error('Failed to load study items details.');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
    setFilter('all');
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const totalAnswers = session.answers.length;
  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const wrongCount = totalAnswers - correctCount;

  // Filtered items mapped with answers
  const itemWithAnswers = items.map((item) => {
    const ans = session.answers.find((a) => a.questionId === item.id);
    return {
      item,
      userAnswer: ans ? ans.selectedAnswer : null,
      isCorrect: ans ? ans.isCorrect : false,
      timeSpent: ans ? ans.timeSpent : 0,
    };
  });

  const displayedItems = itemWithAnswers.filter((entry) => {
    if (filter === 'correct') return entry.isCorrect;
    if (filter === 'wrong') return !entry.isCorrect;
    return true;
  });

  const handlePracticeAgain = (wrongOnly: boolean = false) => {
    // Get target items
    const targetEntries = itemWithAnswers.filter((entry) => !wrongOnly || !entry.isCorrect);
    const targetItems = targetEntries.map((e) => e.item);

    if (targetItems.length === 0) {
      toast.error('No items available to practice.');
      return;
    }

    onClose();

    if (session.type === 'vocabulary') {
      const practiceIds = targetItems.map((w) => w.id);
      navigate('/study/vocabulary', { state: { practiceIds } });
      toast.success(wrongOnly ? 'Retrying wrong words only! 📚' : 'Restarting vocabulary study session! 📚');
    } else {
      // Quiz / Listening
      if (onPracticeQuizAgain) {
        onPracticeQuizAgain(targetItems);
        toast.success(wrongOnly ? 'Retrying wrong questions only! 📝' : 'Restarting quiz session! 📝');
      } else {
        // Navigate to /study with state
        navigate('/study', { state: { practiceQuestions: targetItems } });
        toast.success(wrongOnly ? 'Retrying wrong questions only! 📝' : 'Restarting quiz session! 📝');
      }
    }
  };

  const parseExplanation = (explanation: string) => {
    if (!explanation) return { sentenceTranslation: '', viExpl: '' };

    const parts = explanation.split('|').map((s) => s.trim());
    let sentenceTranslation = '';
    let viExpl = '';

    // Search for translation and grammar terms
    const translationPart = parts.find((p) => p.toLowerCase().startsWith('dịch nghĩa:'));
    const explanationPart = parts.find((p) => p.toLowerCase().startsWith('giải thích:'));

    if (translationPart) {
      sentenceTranslation = translationPart.replace(/dịch nghĩa:\s*/i, '');
    }
    if (explanationPart) {
      viExpl = explanationPart.replace(/giải thích:\s*/i, '');
    }

    if (!sentenceTranslation && !viExpl) {
      if (parts.length > 1) {
        viExpl = parts.slice(1).join(' | ');
      } else {
        viExpl = parts[0];
      }
    }

    return { sentenceTranslation, viExpl };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-800 capitalize flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-sm">
                  {session.type === 'listening' ? '🎧' : session.type === 'vocabulary' ? '📚' : '📝'}
                </span>
                {session.type} Review Details
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {formatTimestamp(session.createdAt as any)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-5 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Accuracy</p>
              <p className={`text-base font-black mt-0.5 ${getAccuracyColor(session.accuracy)}`}>
                {session.accuracy}%
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Time Spent</p>
              <p className="text-base font-black text-slate-800 mt-0.5">
                {formatDuration(session.totalSeconds)}
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Questions</p>
              <p className="text-base font-black text-slate-800 mt-0.5">
                {correctCount} / {totalAnswers}
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/60">
              <p className="text-[9px] text-slate-400 font-bold uppercase">XP Earned</p>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                +{session.xpEarned} XP
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Icons.Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Loading items details...</p>
              </div>
            ) : (
              <>
                {/* Filter Tabs */}
                {session.type !== 'vocabulary' && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold shrink-0">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        filter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({totalAnswers})
                    </button>
                    {wrongCount > 0 && (
                      <button
                        onClick={() => setFilter('wrong')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          filter === 'wrong' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-550 hover:bg-rose-50/50'
                        }`}
                      >
                        ❌ Incorrect ({wrongCount})
                      </button>
                    )}
                    <button
                      onClick={() => setFilter('correct')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        filter === 'correct' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-600 hover:bg-emerald-50/50'
                      }`}
                    >
                      ✅ Correct ({correctCount})
                    </button>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-4">
                  {displayedItems.length === 0 ? (
                    <p className="text-center py-10 text-slate-400 text-xs font-semibold">No questions match this filter.</p>
                  ) : (
                    displayedItems.map(({ item, userAnswer, isCorrect, timeSpent }, idx) => {
                      if (session.type === 'vocabulary') {
                        const vocab = item as VocabWord;
                        return (
                          <Card key={vocab.id} className="p-4 border-slate-150 bg-white hover:border-slate-250 transition-colors space-y-3 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                  {vocab.word}
                                  <span className="text-xs font-normal text-slate-400">/{vocab.pronunciation}/</span>
                                </h3>
                                <Badge variant="purple" className="mt-1 font-bold text-[9px] capitalize">{vocab.partOfSpeech}</Badge>
                              </div>
                              <Badge variant="default" className="capitalize text-[9px]">{vocab.topic}</Badge>
                            </div>

                            <div className="text-xs space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-150">
                              <p className="leading-relaxed">
                                <span className="font-bold text-slate-500 uppercase text-[9px] block">Definition</span>
                                {vocab.definition}
                              </p>
                              {vocab.definitionNative && (
                                <p className="font-medium text-slate-800 pt-1.5 border-t border-slate-200/40">
                                  {vocab.definitionNative}
                                </p>
                              )}
                            </div>

                            {vocab.example && (
                              <div className="text-xs leading-relaxed pl-3.5 border-l-2 border-[#0071E3]/35 text-slate-655 space-y-1">
                                <p className="italic">"{vocab.example}"</p>
                                {vocab.exampleTranslation && (
                                  <p className="text-slate-500 font-medium">{vocab.exampleTranslation}</p>
                                )}
                              </div>
                            )}

                            {vocab.synonyms && vocab.synonyms.length > 0 && (
                              <p className="text-[10px] text-slate-400 font-semibold">
                                Synonyms: <span className="text-slate-600">{vocab.synonyms.join(', ')}</span>
                              </p>
                            )}
                          </Card>
                        );
                      } else {
                        const q = item as Question;
                        const { sentenceTranslation, viExpl } = parseExplanation(q.explanation);

                        return (
                          <Card key={q.id} className={`p-4.5 border-l-4 bg-white space-y-3.5 shadow-sm ${
                            isCorrect ? 'border-l-emerald-500 border-slate-200' : 'border-l-rose-500 border-slate-200'
                          }`}>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                              <span className="flex items-center gap-1.5">
                                {isCorrect ? (
                                  <span className="text-emerald-600 flex items-center gap-1">
                                    <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                  </span>
                                ) : (
                                  <span className="text-rose-600 flex items-center gap-1">
                                    <Icons.XCircle className="w-3.5 h-3.5" /> Incorrect
                                  </span>
                                )}
                                <span className="text-slate-200">|</span>
                                <span>⏱ {Math.round(timeSpent)}s</span>
                              </span>

                              <div className="flex items-center gap-2">
                                <Badge variant="purple" className="text-[9px] font-bold">Part {q.part || 5}</Badge>
                                <Badge variant="info" className="text-[9px] font-bold capitalize">{q.topic}</Badge>
                              </div>
                            </div>

                            {/* Question text */}
                            <h4 className="text-sm font-bold leading-relaxed text-slate-800">
                              {q.question}
                            </h4>

                            {/* Choices list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                              {q.choices.map((choice, cIdx) => {
                                const letter = String.fromCharCode(65 + cIdx);
                                const isCorrectChoice = cIdx === q.correctAnswer;
                                const isUserChoice = cIdx === userAnswer;

                                let choiceClass = 'border-slate-100 bg-slate-50/50 text-slate-600';
                                if (isCorrectChoice) {
                                  choiceClass = 'border-emerald-200 bg-emerald-50/80 text-emerald-800 font-bold';
                                } else if (isUserChoice && !isCorrect) {
                                  choiceClass = 'border-rose-200 bg-rose-50 text-rose-800';
                                }

                                return (
                                  <div key={cIdx} className={`border rounded-xl px-3.5 py-2.5 flex items-center gap-3 ${choiceClass}`}>
                                    <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                      isCorrectChoice ? 'bg-emerald-500 text-white' : isUserChoice ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                      {letter}
                                    </span>
                                    <span>{choice}</span>
                                    {isCorrectChoice && <Icons.Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                                    {isUserChoice && !isCorrect && <Icons.X className="w-3.5 h-3.5 ml-auto text-rose-600" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/50 space-y-2 text-xs leading-relaxed text-slate-700">
                              <p className="font-bold text-[#0071E3] uppercase text-[9px] tracking-wide flex items-center gap-1">
                                <Icons.Info className="w-3.5 h-3.5" /> Giải thích chi tiết
                              </p>
                              {sentenceTranslation && (
                                <p className="font-bold text-slate-800 pb-2 border-b border-slate-200/60">
                                  🇻🇳 Dịch câu: <span className="font-medium text-slate-700">{sentenceTranslation}</span>
                                </p>
                              )}
                              {viExpl && (
                                <div className="space-y-1.5">
                                  <p><span className="font-bold text-slate-805">🇻🇳 Giải thích:</span> {viExpl}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      }
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 p-5 shrink-0 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto font-semibold py-2">
              Close Review
            </Button>
            
            <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
              {wrongCount > 0 && (
                <Button
                  onClick={() => handlePracticeAgain(true)}
                  className="flex-1 sm:flex-initial bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Icons.RotateCcw className="w-3.5 h-3.5" />
                  Retry Mistakes Only
                </Button>
              )}
              <Button
                onClick={() => handlePracticeAgain(false)}
                className={`flex-1 sm:flex-initial font-bold text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm ${
                  session.type === 'vocabulary'
                    ? 'bg-violet-600 hover:bg-violet-700 text-white font-bold'
                    : session.type === 'listening'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white font-bold'
                      : 'bg-[#0071E3] hover:bg-[#0077ED]'
                }`}
              >
                <Icons.RotateCcw className="w-3.5 h-3.5" />
                Practice All Again
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
