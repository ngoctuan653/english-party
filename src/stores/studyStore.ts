import { create } from 'zustand';
import type { Question, QuestionAnswer } from '@/types/question';
import type { SessionResults } from '@/types/study';

interface StudyStoreState {
  isActive: boolean;
  questions: Question[];
  currentIndex: number;
  answers: QuestionAnswer[];
  selectedAnswer: number | null;
  showExplanation: boolean;
  sessionResults: SessionResults | null;
  startTime: number | null;
  
  startSession: (questions: Question[]) => void;
  selectAnswer: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  showExplanationModal: () => void;
  hideExplanation: () => void;
  endSession: (results: SessionResults) => void;
  reset: () => void;
}

export const useStudyStore = create<StudyStoreState>((set, get) => ({
  isActive: false,
  questions: [],
  currentIndex: 0,
  answers: [],
  selectedAnswer: null,
  showExplanation: false,
  sessionResults: null,
  startTime: null,

  startSession: (questions) => set({
    isActive: true,
    questions,
    currentIndex: 0,
    answers: [],
    selectedAnswer: null,
    showExplanation: false,
    sessionResults: null,
    startTime: Date.now(),
  }),

  selectAnswer: (index) => set({ selectedAnswer: index }),

  submitAnswer: () => {
    const { questions, currentIndex, selectedAnswer, answers, startTime } = get();
    if (selectedAnswer === null) return;
    
    const question = questions[currentIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0;
    
    const answer: QuestionAnswer = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    };
    
    set({
      answers: [...answers, answer],
      showExplanation: true,
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        showExplanation: false,
        startTime: Date.now(),
      });
    }
  },

  showExplanationModal: () => set({ showExplanation: true }),
  hideExplanation: () => set({ showExplanation: false }),

  endSession: (results) => set({
    isActive: false,
    sessionResults: results,
  }),

  reset: () => set({
    isActive: false,
    questions: [],
    currentIndex: 0,
    answers: [],
    selectedAnswer: null,
    showExplanation: false,
    sessionResults: null,
    startTime: null,
  }),
}));
