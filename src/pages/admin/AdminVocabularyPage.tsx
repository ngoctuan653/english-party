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
import type { VocabWord } from '@/types/vocabulary';

export default function AdminVocabularyPage() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabWord | null>(null);

  // Form states
  const [wordText, setWordText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [definition, setDefinition] = useState('');
  const [definitionNative, setDefinitionNative] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [topic, setTopic] = useState('business');
  const [difficulty, setDifficulty] = useState(700);
  const [synonymsText, setSynonymsText] = useState('');

  async function loadWords() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'vocabulary'));
      const list: VocabWord[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as VocabWord);
      });
      setWords(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vocabulary words');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWords();
  }, []);

  const openAddModal = () => {
    setEditingWord(null);
    setWordText('');
    setPronunciation('');
    setPartOfSpeech('noun');
    setDefinition('');
    setDefinitionNative('');
    setExample('');
    setExampleTranslation('');
    setTopic('business');
    setDifficulty(700);
    setSynonymsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: VocabWord) => {
    setEditingWord(w);
    setWordText(w.word);
    setPronunciation(w.pronunciation);
    setPartOfSpeech(w.partOfSpeech);
    setDefinition(w.definition);
    setDefinitionNative(w.definitionNative || '');
    setExample(w.example);
    setExampleTranslation(w.exampleTranslation || '');
    setTopic(w.topic);
    setDifficulty(w.difficulty);
    setSynonymsText(w.synonyms ? w.synonyms.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !definition.trim()) {
      toast.error('Word and definition fields are required.');
      return;
    }

    try {
      const syns = synonymsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const wordData = {
        word: wordText.trim(),
        pronunciation: pronunciation.trim(),
        partOfSpeech,
        definition: definition.trim(),
        definitionNative: definitionNative.trim(),
        example: example.trim(),
        exampleTranslation: exampleTranslation.trim(),
        topic,
        difficulty: Number(difficulty),
        synonyms: syns,
        exam: 'toeic',
        tags: [topic],
        isActive: editingWord ? editingWord.isActive : true,
        updatedAt: serverTimestamp(),
      };

      if (editingWord) {
        // Edit
        const docRef = doc(db, 'vocabulary', editingWord.id);
        await updateDoc(docRef, wordData);
        toast.success('Word updated successfully!');
      } else {
        // Add
        const newId = `w_${Date.now()}`;
        const docRef = doc(db, 'vocabulary', newId);
        await setDoc(docRef, {
          ...wordData,
          id: newId,
          createdAt: serverTimestamp(),
        });
        toast.success('Vocabulary word created successfully!');
      }

      setIsModalOpen(false);
      loadWords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save vocabulary word');
    }
  };

  const handleToggleActive = async (w: VocabWord) => {
    try {
      const docRef = doc(db, 'vocabulary', w.id);
      await updateDoc(docRef, { isActive: !w.isActive });
      toast.success(`Word is now ${!w.isActive ? 'active' : 'inactive'}`);
      loadWords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this word?')) return;
    try {
      await deleteDoc(doc(db, 'vocabulary', id));
      toast.success('Vocabulary word deleted successfully');
      loadWords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete word');
    }
  };

  const filteredWords = words.filter((w) => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) ||
                          w.definition.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || w.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  // Unique topics list
  const topics = ['all', ...Array.from(new Set(words.map((w) => w.topic)))];

  return (
    <div className="space-y-6 pb-8 text-slate-800 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">Manage TOEIC Vocabulary</h1>
          <p className="text-sm text-slate-505 mt-1">Add, edit, or delete TOEIC vocabulary words</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-[#0071E3] hover:bg-[#0077ED] font-semibold text-white shadow-sm"
        >
          <Icons.Plus className="w-4 h-4 mr-2" /> Add Word
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search words or definitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 5).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize cursor-pointer ${
                selectedTopic === t
                  ? 'bg-blue-50/50 border-[#0071E3] text-[#0071E3]'
                  : 'bg-white border-slate-200 text-slate-505 hover:bg-slate-50'
              }`}
            >
              {t === 'all' ? 'All Topics' : t}
            </button>
          ))}
        </div>
      </Card>

      {/* Words list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 h-24 bg-white border border-slate-200/60 shadow-sm animate-pulse">
                <div className="h-full w-full bg-slate-50 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No words found. Add one to start.</div>
        ) : (
          filteredWords.map((w) => (
            <Card key={w.id} className="p-5 bg-white border border-slate-200/60 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{w.word}</span>
                    <span className="text-xs text-slate-500 italic font-medium">/{w.pronunciation}/</span>
                    <Badge variant="purple" className="text-[10px] font-bold uppercase">
                      {w.partOfSpeech}
                    </Badge>
                    <Badge variant="info" className="text-[10px] font-bold capitalize">
                      {w.topic}
                    </Badge>
                    <Badge variant="default" className="text-[10px] font-bold">
                      {w.difficulty} Level
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{w.definition}</p>
                  {w.definitionNative && (
                    <p className="text-xs text-[#0071E3] font-semibold">{w.definitionNative}</p>
                  )}
                  {w.example && (
                    <div className="text-xs text-slate-550 border-l border-slate-200 pl-3 py-0.5 mt-2">
                      <p className="italic">"{w.example}"</p>
                      {w.exampleTranslation && <p className="text-slate-400 mt-0.5">{w.exampleTranslation}</p>}
                    </div>
                  )}
                  {w.synonyms && w.synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Synonyms:</span>
                      {w.synonyms.map((s) => (
                        <Badge key={s} variant="default" className="text-[9px] bg-slate-100 text-slate-650 border border-slate-200">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${w.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-550'}`}
                    onClick={() => handleToggleActive(w)}
                  >
                    {w.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#0071E3] hover:bg-blue-50"
                    onClick={() => openEditModal(w)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(w.id)}
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
        title={editingWord ? 'Edit Vocabulary Word' : 'Add New Vocabulary Word'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Word"
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
              placeholder="e.g. postpone"
              required
            />
            <Input
              label="Pronunciation (IPA)"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="e.g. poʊstˈpoʊn"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Part of Speech</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="noun" className="bg-white text-slate-800">Noun (n.)</option>
                <option value="verb" className="bg-white text-slate-800">Verb (v.)</option>
                <option value="adjective" className="bg-white text-slate-800">Adjective (adj.)</option>
                <option value="adverb" className="bg-white text-slate-800">Adverb (adv.)</option>
                <option value="preposition" className="bg-white text-slate-800">Preposition (prep.)</option>
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
              label="Definition (English)"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g. to delay an event until a later time"
              required
            />
            <Input
              label="Definition (Native / Vietnamese)"
              value={definitionNative}
              onChange={(e) => setDefinitionNative(e.target.value)}
              placeholder="e.g. trì hoãn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Example Sentence"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="The meeting was postponed due to scheduling conflicts."
              required
            />
            <Input
              label="Example Sentence Translation"
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              placeholder="Cuộc họp đã bị trì hoãn do xung đột lịch trình."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Difficulty Level"
              type="number"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              placeholder="700"
            />
            <Input
              label="Synonyms (comma separated)"
              value={synonymsText}
              onChange={(e) => setSynonymsText(e.target.value)}
              placeholder="delay, defer, put off"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#0077ED] text-white">
              Save Word
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
