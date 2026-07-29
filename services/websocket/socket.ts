import Constants from 'expo-constants';
import io, { Socket } from 'socket.io-client';
import { getToken } from '../../utils/storage';

const socketUrl = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:5000';

export type SocketEventMap = {
  // Emitted by client
  'join-booking': { bookingId: number };
  'leave-booking': { bookingId: number };
  'update-location': { bookingId: number; latitude: number; longitude: number };
  'update-train': { bookingId: number; trainStatus?: string; coachNumber?: string; estimatedArrival?: string };
  'job-status-change': { bookingId: number; status: string };

  // Received from server
  'joined-booking': { bookingId: number; success: boolean };
  'join-error': { bookingId: number; error: string };
  'worker-location': { bookingId: number; workerId: number; latitude: number; longitude: number; timestamp: string };
  'train-update': { bookingId: number; trainStatus?: string; coachNumber?: string; estimatedArrival?: string };
  'job-status': { bookingId: number; status: string; updatedAt: string };
  'new-job-assigned': { bookingId: number; jobData: any; message: string };
  'job-status-update': { bookingId: number; status: string; message: string };
  'train-tracking': any;
};

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  async connect() {
    if (this.socket?.connected) return;

    const token = await getToken();
    if (!token) {
      console.warn('No token available; socket connection skipped.');
      return;
    }

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Auto-register all listeners on reconnect
    this.socket.on('connect', () => {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((cb) => {
          this.socket?.on(event, cb);
        });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a booking room
  joinBooking(bookingId: number) {
    this.socket?.emit('join-booking', { bookingId });
  }

  leaveBooking(bookingId: number) {
    this.socket?.emit('leave-booking', { bookingId });
  }

  // Send location update
  updateLocation(bookingId: number, latitude: number, longitude: number) {
    this.socket?.emit('update-location', { bookingId, latitude, longitude });
  }

  // Send train tracking update
  updateTrain(
    bookingId: number,
    data: { trainStatus?: string; coachNumber?: string; estimatedArrival?: string }
  ) {
    this.socket?.emit('update-train', { bookingId, ...data });
  }

  // Generic listeners
  on<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as any);
    this.socket?.on(event, callback as any);

    return () => {
      this.socket?.off(event, callback as any);
      this.listeners.get(event)?.delete(callback as any);
    };
  }

  // One-time listener
  once<T extends keyof SocketEventMap>(event: T, callback: (data: SocketEventMap[T]) => void) {
    this.socket?.once(event, callback as any);
  }

  // Off all listeners for an event (or specific)
  off<T extends keyof SocketEventMap>(event: T, callback?: (data: SocketEventMap[T]) => void) {
    if (callback) {
      this.socket?.off(event, callback as any);
      this.listeners.get(event)?.delete(callback as any);
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();