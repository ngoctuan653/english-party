import { Timestamp } from 'firebase/firestore';
import rawQuestions from './generated/cefr-questions.json';
import rawVocabulary from './generated/cefr-vocabulary.json';
import rawToeicQuestions from './generated/toeic-reading-questions.json';
import type { Question, CefrSkill } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';
import type { CefrLevel } from '@/types/cefr';
import { cefrLevelFromDifficulty } from '@/types/cefr';

export interface QuestionBankFilters {
  exam?: string;
  skill?: CefrSkill;
  part?: number;
  topic?: string;
  difficulty?: number;
  type?: string;
  cefrLevel?: CefrLevel;
  tags?: string[];
}

const bundledCefrQuestions: Question[] = (rawQuestions as any[]).map((item) => ({
  ...item,
  exam: 'cefr',
  skill: item.skill as CefrSkill,
  cefrLevel: (item.cefrLevel ?? cefrLevelFromDifficulty(item.difficulty)) as CefrLevel,
  type: item.type as Question['type'],
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
}));

const bundledToeicQuestions: Question[] = (rawToeicQuestions as any[]).map((item) => ({
  ...item,
  exam: item.exam || 'toeic-2026',
  skill: (item.skill as CefrSkill) || 'reading',
  cefrLevel: (item.cefrLevel ?? cefrLevelFromDifficulty(item.difficulty)) as CefrLevel,
  type: (item.type as Question['type']) || 'mcq',
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
}));

const bundledQuestions: Question[] = [...bundledCefrQuestions, ...bundledToeicQuestions];

const bundledVocabulary: VocabWord[] = (rawVocabulary as any[]).map((item) => ({
  ...item,
  exam: 'cefr',
  cefrLevel: (item.cefrLevel ?? 'B2') as CefrLevel,
  createdAt: Timestamp.fromMillis(0),
}));

export function getBundledQuestions(filters: QuestionBankFilters = {}): Question[] {
  // If exam is specified:
  if (filters.exam) {
    if (filters.exam !== 'all') {
      const targetExam = filters.exam;
      return bundledQuestions.filter((item) => {
        if (item.exam !== targetExam) return false;
        if (filters.tags && filters.tags.length > 0) {
          if (!filters.tags.every((t) => item.tags?.includes(t))) return false;
        }
        if (filters.skill && item.skill !== filters.skill) return false;
        if (filters.part && item.part !== filters.part) return false;
        if (filters.topic && item.topic !== filters.topic) return false;
        if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
        if (filters.type && item.type !== filters.type) return false;
        if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
        return true;
      });
    }
  }

  // If tags are specified (e.g. toeic-2026) without exam:
  if (filters.tags && filters.tags.length > 0) {
    return bundledQuestions.filter((item) => {
      if (!filters.tags!.every((t) => item.tags?.includes(t))) return false;
      if (filters.skill && item.skill !== filters.skill) return false;
      if (filters.part && item.part !== filters.part) return false;
      if (filters.topic && item.topic !== filters.topic) return false;
      if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
      return true;
    });
  }

  // If no filters at all (e.g. SessionReviewModal lookup), return all questions
  if (Object.keys(filters).length === 0) {
    return bundledQuestions;
  }

  // Otherwise default to CEFR questions to preserve existing CEFR behavior perfectly
  return bundledCefrQuestions.filter((item) => {
    if (filters.skill && item.skill !== filters.skill) return false;
    if (filters.part && item.part !== filters.part) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
    return true;
  });
}

export function getBundledToeicQuestions(filters: {
  test?: number;
  part?: number;
  topic?: string;
  tags?: string[];
} = {}): Question[] {
  return bundledToeicQuestions.filter((item) => {
    if (filters.test) {
      const testTag = `test-${String(filters.test).padStart(2, '0')}`;
      if (!item.tags?.includes(testTag)) return false;
    }
    if (filters.part && item.part !== filters.part) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.every((t) => item.tags?.includes(t))) return false;
    }
    return true;
  });
}

export function getToeicTestStats(): Array<{ testNumber: number; total: number; p5: number; p6: number; p7: number }> {
  const result = [];
  for (let t = 1; t <= 10; t++) {
    const testTag = `test-${String(t).padStart(2, '0')}`;
    const testQuestions = bundledToeicQuestions.filter((q) => q.tags?.includes(testTag));
    result.push({
      testNumber: t,
      total: testQuestions.length,
      p5: testQuestions.filter((q) => q.part === 5).length,
      p6: testQuestions.filter((q) => q.part === 6).length,
      p7: testQuestions.filter((q) => q.part === 7).length,
    });
  }
  return result;
}

export function getToeicTopics(): Array<{ topic: string; count: number }> {
  const counts = new Map<string, number>();
  bundledToeicQuestions.forEach((item) => {
    if (item.topic) {
      counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
    }
  });
  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) =>
    a.topic.localeCompare(b.topic),
  );
}

export function getBundledLevelCount(level: CefrLevel, type?: string): number {
  return getBundledQuestions({ cefrLevel: level, type }).length;
}

export function getBundledQuestionCount(skillOrPart: CefrSkill | number, topic?: string, cefrLevel?: CefrLevel): number {
  if (typeof skillOrPart === 'string') {
    return getBundledQuestions({ skill: skillOrPart, topic, cefrLevel }).length;
  }
  return getBundledQuestions({ part: skillOrPart, topic, cefrLevel }).length;
}

export function getBundledTopics(skillOrPart: CefrSkill | number, cefrLevel?: CefrLevel): Array<{ topic: string; count: number }> {
  const counts = new Map<string, number>();
  const filter = typeof skillOrPart === 'string' ? { skill: skillOrPart, cefrLevel } : { part: skillOrPart, cefrLevel };

  getBundledQuestions(filter).forEach((item) => {
    counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
  });

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) =>
    a.topic.localeCompare(b.topic),
  );
}

export function getBundledVocabulary(filters: { topic?: string; cefrLevel?: CefrLevel; search?: string } = {}): VocabWord[] {
  return bundledVocabulary.filter((item) => {
    if (filters.topic && filters.topic !== 'all' && item.topic.toLowerCase() !== filters.topic.toLowerCase()) return false;
    if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchDef = (item.definitionNative || '').toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
      if (!matchWord && !matchDef) return false;
    }
    return true;
  });
}

export function getBundledVocabTopicCounts(cefrLevel?: CefrLevel): Record<string, number> {
  const counts: Record<string, number> = {};
  bundledVocabulary.forEach((item) => {
    if (!cefrLevel || item.cefrLevel === cefrLevel) {
      counts[item.topic] = (counts[item.topic] || 0) + 1;
    }
  });
  return counts;
}
