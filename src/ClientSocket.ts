import { io, Socket } from "socket.io-client";

class ClientSocket {
    socket: Socket | null = null;

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io({ autoConnect: true });
        return this.socket;
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    emit<T>(id: string, payload?: T, callback?: (response: any) => void) {
        this.socket?.emit(id, payload, callback);
    }

    subscribe<T>(id: string, func: (payload: T) => void) {
        this.socket?.on(id, func);
    }

    unsubscribe(id: string) {
        this.socket?.off(id);
    }
}

export default new ClientSocket();
