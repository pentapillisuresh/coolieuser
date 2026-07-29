export interface Training {
    id: number;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    applicableProfessions?: string[];
    level: 'beginner' | 'intermediate' | 'advanced';
    duration?: number;
    isRequired: boolean;
    isActive: boolean;
    scheduledDate?: string;
    meetingLink?: string;
    createdAt?: string;
    updatedAt?: string;
    videos?: TrainingVideo[];
    quiz?: Quiz;
  }
  
  export interface TrainingVideo {
    id: number;
    trainingId: number;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: number;
    sortOrder: number;
    isFree: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Quiz {
    id: number;
    trainingId: number;
    title: string;
    description?: string;
    passingScore: number;
    timeLimit?: number;
    isActive: boolean;
    questions?: QuizQuestion[];
  }
  
  export interface QuizQuestion {
    id: number;
    quizId: number;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
    sortOrder: number;
  }
  
  export interface QuizAttempt {
    id: number;
    workerId: number;
    quizId: number;
    score: number;
    passed: boolean;
    answers: number[];
    startedAt: string;
    completedAt?: string;
  }
  
  export interface Certificate {
    id: number;
    workerId: number;
    trainingId: number;
    certificateUrl: string;
    issuedAt: string;
    expiryAt?: string;
    isActive: boolean;
  }