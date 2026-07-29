export interface Notification {
    id: number;
    userId: number;
    title: string;
    body: string;
    data?: Record<string, any>;
    type?: string;
    isRead: boolean;
    readAt?: string;
    sentAt: string;
  }