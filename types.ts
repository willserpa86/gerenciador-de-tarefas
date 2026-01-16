
export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name?: string;
}

export interface CardUpdate {
  text: string;
  timestamp: number;
  author: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  mediaFiles: MediaFile[]; // Alterado de mediaUrl/mediaType para array
  assignedEmails: string[];
  createdAt: number;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  updates: CardUpdate[];
  status: 'todo' | 'doing' | 'done';
}

export type ViewType = 'board' | 'create' | 'login';

export interface AppState {
  cards: TaskCard[];
  searchQuery: string;
  currentUserEmail: string;
  currentView: ViewType;
  isAuthenticated: boolean;
}
