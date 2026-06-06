export interface OriginalQuestion {
  questionText: string;
  options: string[] | null;
  userAnswer: string | null;
  correctAnswer: string | null;
  imageUrl: string | null;
}

export interface SimilarQuestion {
  id: string;
  questionText: string;
  options: string[] | null;
  answer: string;
  explanation: string;
}

export interface SavedQuestion {
  id: string;
  subject: string;
  grade?: string;
  knowledgePoint: string;
  date: string;
  originalQuestion: OriginalQuestion;
  similarQuestions: SimilarQuestion[];
}
