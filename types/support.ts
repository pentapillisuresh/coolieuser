export interface Ticket {
    id: number;
    userId: number;
    subject: string;
    message: string;
    category?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    assignedTo?: number;
    resolvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    replies?: TicketReply[];
  }
  
  export interface TicketReply {
    id: number;
    ticketId: number;
    userId: number;
    message: string;
    attachments?: string[];
    isInternal: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }