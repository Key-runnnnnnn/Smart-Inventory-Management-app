import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.reconnectAttempts++;
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinInventoryRoom() {
    this.socket?.emit("join:inventory");
  }

  joinAlertsRoom() {
    this.socket?.emit("join:alerts");
  }

  joinItemRoom(itemId: string) {
    this.socket?.emit("join:item", itemId);
  }

  requestAlerts() {
    this.socket?.emit("request:alerts");
  }

  onInventoryUpdate(callback: (data: unknown) => void) {
    this.socket?.on("inventory:update", callback);
  }

  onTransactionNew(callback: (data: unknown) => void) {
    this.socket?.on("transaction:new", callback);
  }

  onAlertNew(callback: (data: unknown) => void) {
    this.socket?.on("alert:new", callback);
  }

  onLowStockAlert(callback: (data: unknown) => void) {
    this.socket?.on("alert:low-stock", callback);
  }

  onAlertsUpdate(callback: (data: unknown) => void) {
    this.socket?.on("alerts:update", callback);
  }

  onAlertsSummary(callback: (data: unknown) => void) {
    this.socket?.on("alerts:summary", callback);
  }

  offInventoryUpdate(callback?: (data: unknown) => void) {
    this.socket?.off("inventory:update", callback);
  }

  offTransactionNew(callback?: (data: unknown) => void) {
    this.socket?.off("transaction:new", callback);
  }

  offAlertNew(callback?: (data: unknown) => void) {
    this.socket?.off("alert:new", callback);
  }

  offLowStockAlert(callback?: (data: unknown) => void) {
    this.socket?.off("alert:low-stock", callback);
  }

  offAlertsUpdate(callback?: (data: unknown) => void) {
    this.socket?.off("alerts:update", callback);
  }

  offAlertsSummary(callback?: (data: unknown) => void) {
    this.socket?.off("alerts:summary", callback);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketClient = new SocketClient();
export default socketClient;
