import { Timestamp } from 'firebase/firestore';
import rawQuestions from './generated/toeic-questions.json';
import type { Question } from '@/types/question';

interface QuestionBankFilters {
  exam?: string;
  part?: number;
  topic?: string;
  difficulty?: number;
  type?: string;
}

const bundledQuestions: Question[] = rawQuestions.map((item) => ({
  ...item,
  type: item.type as Question['type'],
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
}));

export function getBundledQuestions(filters: QuestionBankFilters = {}): Question[] {
  if (filters.exam && filters.exam !== 'toeic') return [];

  return bundledQuestions.filter((item) => {
    if (filters.part && item.part !== filters.part) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.type && item.type !== filters.type) return false;
    return true;
  });
}

export function getBundledQuestionCount(part: number, topic?: string): number {
  return getBundledQuestions({ part, topic }).length;
}

export function getBundledTopics(part: number): Array<{ topic: string; count: number }> {
  const counts = new Map<string, number>();
  getBundledQuestions({ part }).forEach((item) => {
    counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
  });

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) =>
    a.topic.localeCompare(b.topic),
  );
}
