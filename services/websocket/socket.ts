import Constants from 'expo-constants';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../../src/utils/storage';

const socketUrl =
  Constants.expoConfig?.extra?.socketUrl ||
  'ws://192.168.0.12:3000';

console.log('🔌 Socket URL:', socketUrl);

export type SocketEventMap = {
  // Client → Server
  'join-booking': {
    bookingId: number;
  };

  'leave-booking': {
    bookingId: number;
  };

  'update-location': {
    bookingId: number;
    latitude: number;
    longitude: number;
  };

  'update-train': {
    bookingId: number;
    trainStatus?: string;
    coachNumber?: string;
    estimatedArrival?: string;
  };

  'job-status-change': {
    bookingId: number;
    status: string;
  };

  // Server → Client
  'joined-booking': {
    bookingId: number;
    success: boolean;
  };

  'join-error': {
    bookingId: number;
    error: string;
  };

  'worker-location': {
    bookingId: number;
    workerId: number;
    latitude: number;
    longitude: number;
    timestamp: string;
  };

  'train-update': {
    bookingId: number;
    trainStatus?: string;
    coachNumber?: string;
    estimatedArrival?: string;
  };

  'job-status': {
    bookingId: number;
    status: string;
    updatedAt: string;
  };

  'new-job-assigned': {
    bookingId: number;
    jobData: any;
    message: string;
  };

  'job-status-update': {
    bookingId: number;
    status: string;
    message: string;
  };

  'train-tracking': any;
};

class SocketService {
  private socket: Socket | null = null;

  private listeners: Map<
    keyof SocketEventMap,
    Set<(data: any) => void>
  > = new Map();

  /**
   * Connect to Socket.IO server
   */
  async connect(): Promise<void> {
    // Already connected
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected:', this.socket.id);
      return;
    }

    // If a connection attempt is already in progress,
    // don't create another socket.
    if (this.socket) {
      console.log('🔌 Socket connection already exists');
      return;
    }

    const token = await getToken();

    if (!token) {
      console.warn(
        '⚠️ No authentication token available. Socket connection skipped.'
      );
      return;
    }

    console.log('🔌 Connecting to socket:', socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
    
      transports: ['polling', 'websocket'],
    
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    
      timeout: 10000,
    });
    
    this.registerSocketEvents();
  }

  /**
   * Register internal Socket.IO events
   */
  private registerSocketEvents(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      console.log('=================================');
      console.log('🔌 SOCKET CONNECTED');
      console.log('🆔 Socket ID:', this.socket?.id);
      console.log('🌐 Socket URL:', socketUrl);
      console.log('=================================');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected');
      console.log('Reason:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('=================================');
      console.error('❌ SOCKET CONNECTION ERROR');
      console.error('Message:', error?.message);
      console.error('Description:', error?.description);
      console.error('Context:', error?.context);
      console.error('=================================');
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Socket reconnect attempt #${attempt}`);
    });

    this.socket.io.on('reconnect', (attempt) => {
      console.log(`✅ Socket reconnected after ${attempt} attempt(s)`);
    });

    this.socket.io.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnect error:', error);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    console.log('🔌 Disconnecting socket...');

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  /**
   * Join booking room
   */
  joinBooking(bookingId: number): void {
    if (!this.socket?.connected) {
      console.warn(
        '⚠️ Cannot join booking. Socket is not connected.'
      );
      return;
    }

    console.log(`📡 Joining booking ${bookingId}`);

    this.socket.emit('join-booking', {
      bookingId,
    });
  }

  /**
   * Leave booking room
   */
  leaveBooking(bookingId: number): void {
    if (!this.socket?.connected) {
      console.warn(
        '⚠️ Cannot leave booking. Socket is not connected.'
      );
      return;
    }

    console.log(`📡 Leaving booking ${bookingId}`);

    this.socket.emit('leave-booking', {
      bookingId,
    });
  }

  /**
   * Send user location
   *
   * IMPORTANT:
   * This uses "update-location".
   * If your backend expects "update-user-location",
   * change the event name here.
   */
  updateUserLocation(
    bookingId: number,
    latitude: number,
    longitude: number
  ): void {
    if (!this.socket?.connected) {
      console.warn(
        '⚠️ Cannot update location. Socket is not connected.'
      );
      return;
    }

    this.socket.emit('update-location', {
      bookingId,
      latitude,
      longitude,
    });
  }

  /**
   * Send train tracking update
   */
  updateTrain(
    bookingId: number,
    data: {
      trainStatus?: string;
      coachNumber?: string;
      estimatedArrival?: string;
    }
  ): void {
    if (!this.socket?.connected) {
      console.warn(
        '⚠️ Cannot update train. Socket is not connected.'
      );
      return;
    }

    this.socket.emit('update-train', {
      bookingId,
      ...data,
    });
  }

  /**
   * Send job status change
   */
  updateJobStatus(
    bookingId: number,
    status: string
  ): void {
    if (!this.socket?.connected) {
      console.warn(
        '⚠️ Cannot update job status. Socket is not connected.'
      );
      return;
    }

    this.socket.emit('job-status-change', {
      bookingId,
      status,
    });
  }

  /**
   * Register event listener
   */
  on<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;

    callbacks.add(callback as any);

    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }

    // Return unsubscribe function
    return () => {
      this.socket?.off(event as string, callback as any);

      callbacks.delete(callback as any);

      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Register one-time listener
   */
  once<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): void {
    this.socket?.once(event as string, callback as any);
  }

  /**
   * Remove listener
   */
  off<T extends keyof SocketEventMap>(
    event: T,
    callback?: (data: SocketEventMap[T]) => void
  ): void {
    if (callback) {
      this.socket?.off(event as string, callback as any);

      this.listeners.get(event)?.delete(callback as any);

      return;
    }

    this.socket?.removeAllListeners(event as string);
    this.listeners.delete(event);
  }

  /**
   * Check connection
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();