import { useEffect, useState } from 'react';
import { db } from '@/services/firebase/config';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { Question } from '@/types/question';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPart, setSelectedPart] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [part, setPart] = useState(5);
  const [topic, setTopic] = useState('business');
  const [difficulty, setDifficulty] = useState(700);

  async function loadQuestions() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'questions'));
      const list: Question[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Question);
      });
      setQuestions(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setChoices(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    setPart(5);
    setTopic('business');
    setDifficulty(700);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setChoices(q.choices);
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation);
    setPart(q.part);
    setTopic(q.topic);
    setDifficulty(q.difficulty);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || choices.some((c) => !c.trim())) {
      toast.error('Please fill in the question and all choices.');
      return;
    }

    try {
      const qData = {
        question: questionText,
        choices,
        correctAnswer,
        explanation,
        part: Number(part),
        topic,
        difficulty: Number(difficulty),
        exam: 'toeic',
        type: 'mcq',
        isActive: editingQuestion ? editingQuestion.isActive : true,
        updatedAt: serverTimestamp(),
      };

      if (editingQuestion) {
        // Edit
        const docRef = doc(db, 'questions', editingQuestion.id);
        await updateDoc(docRef, qData);
        toast.success('Question updated successfully!');
      } else {
        // Add
        const newId = `q_${Date.now()}`;
        const docRef = doc(db, 'questions', newId);
        await setDoc(docRef, {
          ...qData,
          id: newId,
          timesAnswered: 0,
          timesCorrect: 0,
          createdBy: 'admin',
          createdAt: serverTimestamp(),
        });
        toast.success('Question created successfully!');
      }

      setIsModalOpen(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save question');
    }
  };

  const handleToggleActive = async (q: Question) => {
    try {
      const docRef = doc(db, 'questions', q.id);
      await updateDoc(docRef, { isActive: !q.isActive });
      toast.success(`Question is now ${!q.isActive ? 'active' : 'inactive'}`);
      loadQuestions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'questions', id));
      toast.success('Question deleted successfully');
      loadQuestions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchesPart = selectedPart === 'all' || q.part.toString() === selectedPart;
    return matchesSearch && matchesPart;
  });

  return (
    <div className="space-y-6 pb-8 text-slate-800 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">Manage TOEIC Questions</h1>
          <p className="text-sm text-slate-505 mt-1">Add, edit, or delete practice questions</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-[#0071E3] hover:bg-[#0077ED] font-semibold text-white shadow-sm"
        >
          <Icons.Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', '5', '6', '7'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPart(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedPart === p
                  ? 'bg-blue-50/50 border-[#0071E3] text-[#0071E3]'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {p === 'all' ? 'All Parts' : `Part ${p}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Questions list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 h-24 bg-white border border-slate-200/60 shadow-sm animate-pulse">
                <div className="h-full w-full bg-slate-50 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No questions found. Add one to start.</div>
        ) : (
          filteredQuestions.map((q) => (
            <Card key={q.id} className="p-5 bg-white border border-slate-200/60 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="text-[10px] font-bold">
                      Part {q.part}
                    </Badge>
                    <Badge variant="info" className="text-[10px] font-bold capitalize">
                      {q.topic}
                    </Badge>
                    <Badge variant="default" className="text-[10px] font-bold">
                      {q.difficulty} Level
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Success rate:{' '}
                      {q.timesAnswered > 0
                        ? `${Math.round((q.timesCorrect / q.timesAnswered) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2">
                    {q.choices.map((choice, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-1.5 px-2.5 rounded-lg border ${
                          cIdx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        {String.fromCharCode(65 + cIdx)}. {choice}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${q.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'}`}
                    onClick={() => handleToggleActive(q)}
                  >
                    {q.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#0071E3] hover:bg-blue-50"
                    onClick={() => openEditModal(q)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(q.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-slate-800">
          <Input
            label="Question Text (use _____ for blanks)"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="The meeting was _____ until next week."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Exam Part</label>
              <select
                value={part}
                onChange={(e) => setPart(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="5" className="bg-white text-slate-800">Part 5 (Incomplete Sentences)</option>
                <option value="6" className="bg-white text-slate-800">Part 6 (Text Completion)</option>
                <option value="7" className="bg-white text-slate-800">Part 7 (Reading Comprehension)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="business" className="bg-white text-slate-800">Business</option>
                <option value="office" className="bg-white text-slate-800">Office</option>
                <option value="finance" className="bg-white text-slate-800">Finance</option>
                <option value="marketing" className="bg-white text-slate-800">Marketing</option>
                <option value="meetings" className="bg-white text-slate-800">Meetings</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Difficulty Score"
              type="number"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              placeholder="700"
            />
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Correct Answer</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="0" className="bg-white text-slate-800">Option A</option>
                <option value="1" className="bg-white text-slate-800">Option B</option>
                <option value="2" className="bg-white text-slate-800">Option C</option>
                <option value="3" className="bg-white text-slate-800">Option D</option>
              </select>
            </div>
          </div>

          {/* Choices inputs */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500">Choices</label>
            <div className="grid grid-cols-2 gap-3">
              {choices.map((choice, index) => (
                <Input
                  key={index}
                  placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                  value={choice}
                  onChange={(e) => {
                    const newChoices = [...choices];
                    newChoices[index] = e.target.value;
                    setChoices(newChoices);
                  }}
                  required
                />
              ))}
            </div>
          </div>

          <Input
            label="Explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the option is correct."
            required
          />

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#0077ED] text-white">
              Save Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
