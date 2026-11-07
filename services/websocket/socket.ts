// src/services/websocket/socket.ts
import Constants from "expo-constants";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { getToken } from "../../src/utils/storage";

// ─── Resolve socket URL ─────────────────────────────────────────────
// socket.io-client needs an HTTP(S) URL — it performs the WS upgrade
// itself. Passing ws:// makes the client treat the socket as raw WS and
// the /socket.io handshake never runs → "websocket error".
const RAW_URL = "https://api.coolieglobal.com";
// const RAW_URL = "http://192.168.0.5:3000";
    
const socketUrl = RAW_URL.replace(/\/$/, "");

console.log("🔌 Socket URL:", socketUrl);

// ─── Event map (matches backend src/socket.js) ──────────────────────
export type SocketEventMap = {
  // client → server
  "join-booking": { bookingId: number };
  "leave-booking": { bookingId: number };
  "update-user-location": { bookingId: number; latitude: number; longitude: number };
  "update-worker-location": {
    bookingId: number;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  };
  "update-train": {
    bookingId: number;
    trainStatus?: string;
    coachNumber?: string;
    estimatedArrival?: string;
  };
  "job-status-change": { bookingId: number; status: string; otp?: string };
  "chat-message": { bookingId: number; message: string };

  // server → client
  "joined-booking": { bookingId: number; success: boolean };
  "join-error": { bookingId: number; error: string; message?: string };
  "worker-location": {
    bookingId: number;
    workerId: number;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  };
  "user-location": {
    bookingId: number;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  "train-update": {
    bookingId: number;
    trainStatus?: string;
    coachNumber?: string;
    estimatedArrival?: string;
  };
  "new-job-assigned": { bookingId: number; jobData: any; message: string };
  "job-status-update": { bookingId: number; status: string; message: string };
  // helper emit (emitToUser) — kept for parity
  "job-status-updated": { bookingId: number; status: string; message: string };
  // backend emits this via socket.emit('error', { message })
  error: { message: string };
};

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectPromise: Promise<void> | null = null;
  private eventsRegistered = false;
  private joinedBookings: Set<number> = new Set();

  /**
   * Connect and resolve when the socket is actually connected.
   * Safe to call concurrently.
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) return;
    if (this.connectPromise) return this.connectPromise;

    const token = await getToken();
    if (!token) {
      console.warn("⚠️ No auth token. Socket connection skipped.");
      return;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      console.log("🔌 Connecting to socket:", socketUrl);

      const socket = io(socketUrl, {
        auth: { token },
        // RN: websocket-only avoids long-polling quirks behind NAT
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 8000,
        timeout: 20000,
        forceNew: false,
      });

      this.socket = socket;

      let settled = false;

      const onConnect = () => {
        console.log("✅ SOCKET CONNECTED:", socket.id);
        settled = true;

        // register lifecycle listeners exactly once
        this.registerSocketEvents();

        // re-attach any user event listeners that were registered before connect
        this.listeners.forEach((cbs, event) => {
          cbs.forEach((cb) => socket.on(event, cb as any));
        });

        // auto-rejoin tracked rooms
        this.joinedBookings.forEach((bookingId) => {
          console.log(`🔁 Auto-rejoining booking ${bookingId}`);
          socket.emit("join-booking", { bookingId });
        });

        resolve();
      };

      const onConnectError = (err: any) => {
        console.error("❌ SOCKET CONNECT ERROR:", err?.message);
        // Only fail the pending promise on the very first attempt.
        // Subsequent failures are handled by the reconnection manager.
        if (!settled) {
          settled = true;
          this.connectPromise = null;
          reject(err);
        }
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onConnectError);
    });

    return this.connectPromise;
  }

  /** Register manager-level events exactly once per socket instance. */
  private registerSocketEvents(): void {
    if (!this.socket || this.eventsRegistered) return;
    this.eventsRegistered = true;

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected. Reason:", reason);
    });

    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt #${attempt}`);
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempt(s)`);
      // re-emit join for tracked bookings
      this.joinedBookings.forEach((bookingId) =>
        this.socket?.emit("join-booking", { bookingId })
      );
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
    this.eventsRegistered = false;
    this.joinedBookings.clear();
  }

  // ─── Room management ──────────────────────────────────────────────

  async joinBooking(bookingId: number): Promise<void> {
    this.joinedBookings.add(bookingId);
    try {
      await this.connect();
    } catch {
      console.warn("⚠️ Cannot join booking. Socket not connected.");
      return;
    }
    if (!this.socket?.connected) return;
    console.log(`📡 Joining booking ${bookingId}`);
    this.socket.emit("join-booking", { bookingId });
  }

  async leaveBooking(bookingId: number): Promise<void> {
    this.joinedBookings.delete(bookingId);
    if (!this.socket?.connected) return;
    console.log(`📡 Leaving booking ${bookingId}`);
    this.socket.emit("leave-booking", { bookingId });
  }

  // ─── Emit helpers (all match backend handler names) ───────────────

  async updateUserLocation(
    bookingId: number,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;
    this.socket.emit("update-user-location", { bookingId, latitude, longitude });
  }

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

  async updateJobStatus(
    bookingId: number,
    status: string,
    otp?: string
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;
    this.socket.emit("job-status-change", { bookingId, status, otp });
  }

  async updateTrain(
    bookingId: number,
    data: { trainStatus?: string; coachNumber?: string; estimatedArrival?: string }
  ): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;
    this.socket.emit("update-train", { bookingId, ...data });
  }

  /**
   * Backend now derives senderId/senderType from socket.userId / socket.userRole,
   * so callers no longer pass them.
   */
  async sendChatMessage(bookingId: number, message: string): Promise<void> {
    await this.connect();
    if (!this.socket?.connected) return;
    this.socket.emit("chat-message", { bookingId, message });
  }

  // ─── Listener management ──────────────────────────────────────────

  on<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ): () => void {
    const key = event as string;
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(callback as any);

    // If socket already exists, attach now; otherwise connect() will attach
    this.socket?.on(key, callback as any);

    return () => {
      this.socket?.off(key, callback as any);
      const set = this.listeners.get(key);
      set?.delete(callback as any);
      if (set && set.size === 0) this.listeners.delete(key);
    };
  }

  off<T extends keyof SocketEventMap>(
    event: T,
    callback?: (data: SocketEventMap[T]) => void
  ): void {
    const key = event as string;
    if (callback) {
      this.socket?.off(key, callback as any);
      this.listeners.get(key)?.delete(callback as any);
      return;
    }
    this.socket?.removeAllListeners(key);
    this.listeners.delete(key);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();