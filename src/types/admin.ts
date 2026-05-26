export interface CSVImportResult {
  total: number;
  success: number;
  failed: number;
  errors: CSVImportError[];
}

export interface CSVImportError {
  row: number;
  field: string;
  message: string;
}

export interface CSVColumnMapping {
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  explanation?: string;
  topic?: string;
  difficulty?: string;
  part?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalVocabulary: number;
  totalSessions: number;
  activeUsersToday: number;
  questionsAnsweredToday: number;
}
