// src/services/websocket/socket.ts
import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";
import { getToken } from "../../src/utils/storage";

const socketUrl =
  Constants.expoConfig?.extra?.socketUrl || "ws://api.coolieglobal.com";

console.log("🔌 Socket URL:", socketUrl);

export type SocketEventMap = {
  "join-booking": { bookingId: number };
  "leave-booking": { bookingId: number };
  "update-location": { bookingId: number; latitude: number; longitude: number };
  "update-user-location": { bookingId: number; latitude: number; longitude: number };
  "update-worker-location": { bookingId: number; latitude: number; longitude: number; speed?: number; heading?: number };
  "update-train": { bookingId: number; trainStatus?: string; coachNumber?: string; estimatedArrival?: string };
  "job-status-change": { bookingId: number; status: string; otp?: string };
  "chat-message": { bookingId: number; message: string; senderId: number; senderType: string; timestamp?: string };

  "joined-booking": { bookingId: number; success: boolean };
  "join-error": { bookingId: number; error: string; message?: string };
  "worker-location": { bookingId: number; workerId: number; latitude: number; longitude: number; timestamp: string };
  "user-location": { bookingId: number; latitude: number; longitude: number; timestamp: string };
  "train-update": { bookingId: number; trainStatus?: string; coachNumber?: string; estimatedArrival?: string };
  "job-status": { bookingId: number; status: string; updatedAt: string };
  "new-job-assigned": { bookingId: number; jobData: any; message: string };
  "job-status-update": { bookingId: number; status: string; message: string };
  "train-tracking": any;
};

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // ✅ Connection promise — resolves when socket is actually connected
  private connectPromise: Promise<void> | null = null;

  // ✅ Track joined bookings so we can auto-rejoin on reconnect
  private joinedBookings: Set<number> = new Set();

  /**
   * Connect and WAIT until the socket is actually connected.
   * Safe to call multiple times.
   */
  async connect(): Promise<void> {
    // Already connected
    if (this.socket?.connected) {
      return;
    }

    // A connection attempt is already in progress
    if (this.connectPromise) {
      return this.connectPromise;
    }

    const token = await getToken();
    if (!token) {
      console.warn("⚠️ No auth token. Socket connection skipped.");
      return;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      console.log("🔌 Connecting to socket:", socketUrl);

      const socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket = socket;

      const onConnect = () => {
        console.log("✅ SOCKET CONNECTED:", socket.id);
        this.registerSocketEvents();

        // ✅ Auto-rejoin all tracked bookings on (re)connect
        this.joinedBookings.forEach((bookingId) => {
          console.log(`🔁 Auto-rejoining booking ${bookingId}`);
          socket.emit("join-booking", { bookingId });
        });

        resolve();
      };

      const onConnectError = (err: any) => {
        console.error("❌ SOCKET CONNECT ERROR:", err?.message);
        // Reject only on first-ever attempt
        if (!socket.connected) {
          this.connectPromise = null;
          reject(err);
        }
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onConnectError);
    });

    return this.connectPromise;
  }

  private registerSocketEvents(): void {
    if (!this.socket) return;

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected. Reason:", reason);
    });

    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt #${attempt}`);
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempt(s)`);
    });

    this.socket.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.connectPromise = null;
    this.joinedBookings.clear();
  }

  /**
   * Join booking room — waits for connection if not ready.
   */
  async joinBooking(bookingId: number): Promise<void> {
    // Track for auto-rejoin
    this.joinedBookings.add(bookingId);

    try {
      await this.connect();
    } catch (err) {
      console.warn("⚠️ Cannot join booking. Socket not connected.");
      return;
    }

    if (!this.socket?.connected) {
      console.warn("⚠️ Cannot join booking. Socket not connected.");
      return;
    }

    console.log(`📡 Joining booking ${bookingId}`);
    this.socket.emit("join-booking", { bookingId });
  }

  /**
   * Leave booking room
   */
  async leaveBooking(bookingId: number): Promise<void> {
    this.joinedBookings.delete(bookingId);

    if (!this.socket?.connected) return;

    console.log(`📡 Leaving booking ${bookingId}`);
    this.socket.emit("leave-booking", { bookingId });
  }

  /**
   * Send user location (matches backend: 'update-user-location')
   */
  async updateUserLocation(
    bookingId: number,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;

    this.socket.emit("update-user-location", {
      bookingId,
      latitude,
      longitude,
    });
  }

  /**
   * Send worker location
   */
  async updateWorkerLocation(
    bookingId: number,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;

    this.socket.emit("update-worker-location", {
      bookingId,
      latitude,
      longitude,
      speed,
      heading,
    });
  }

  /**
   * Job status change
   */
  async updateJobStatus(
    bookingId: number,
    status: string,
    otp?: string
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;

    this.socket.emit("job-status-change", { bookingId, status, otp });
  }

  /**
   * Train update
   */
  async updateTrain(
    bookingId: number,
    data: { trainStatus?: string; coachNumber?: string; estimatedArrival?: string }
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;

    this.socket.emit("update-train", { bookingId, ...data });
  }

  /**
   * Send chat message
   */
  async sendChatMessage(
    bookingId: number,
    message: string,
    senderId: number,
    senderType: "user" | "worker"
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;

    this.socket.emit("chat-message", {
      bookingId,
      message,
      senderId,
      senderType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Register event listener
   */
  on<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): () => void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }

    const callbacks = this.listeners.get(event as string)!;
    callbacks.add(callback as any);

    // Register on the socket
    this.socket?.on(event as string, callback as any);

    // Return unsubscribe function
    return () => {
      this.socket?.off(event as string, callback as any);
      callbacks.delete(callback as any);
      if (callbacks.size === 0) {
        this.listeners.delete(event as string);
      }
    };
  }

  off<T extends keyof SocketEventMap>(
    event: T,
    callback?: (data: SocketEventMap[T]) => void
  ): void {
    if (callback) {
      this.socket?.off(event as string, callback as any);
      this.listeners.get(event as string)?.delete(callback as any);
      return;
    }
    this.socket?.removeAllListeners(event as string);
    this.listeners.delete(event as string);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();