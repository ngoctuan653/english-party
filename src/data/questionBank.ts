import { Timestamp } from 'firebase/firestore';
import rawQuestions from './generated/cefr-questions.json';
import type { Question } from '@/types/question';
import type { CefrLevel } from '@/types/cefr';
import { cefrLevelFromDifficulty } from '@/types/cefr';

interface QuestionBankFilters {
  exam?: string;
  part?: number;
  topic?: string;
  difficulty?: number;
  type?: string;
  cefrLevel?: CefrLevel;
}

const bundledQuestions: Question[] = rawQuestions.map((item) => ({
  ...item,
  exam: 'cefr',
  cefrLevel: (item.cefrLevel ?? cefrLevelFromDifficulty(item.difficulty)) as CefrLevel,
  type: item.type as Question['type'],
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
}));

export function getBundledQuestions(filters: QuestionBankFilters = {}): Question[] {
  if (filters.exam && filters.exam !== 'cefr') return [];

  return bundledQuestions.filter((item) => {
    if (filters.part && item.part !== filters.part) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
    return true;
  });
}

export function getBundledLevelCount(level: CefrLevel, type?: string): number {
  return getBundledQuestions({ cefrLevel: level, type }).length;
}

export function getBundledQuestionCount(part: number, topic?: string, cefrLevel?: CefrLevel): number {
  return getBundledQuestions({ part, topic, cefrLevel }).length;
}

export function getBundledTopics(part: number, cefrLevel?: CefrLevel): Array<{ topic: string; count: number }> {
  const counts = new Map<string, number>();
  getBundledQuestions({ part, cefrLevel }).forEach((item) => {
    counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
  });

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) =>
    a.topic.localeCompare(b.topic),
  );
}
