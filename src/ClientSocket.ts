import io from "socket.io-client";

class ClientSocket {
    socket: any = null;

    connect() {
        this.socket = io();
    }

    disconnect() {
        this.socket.disconnect();
    }

    emit(id: string, thing: any) {
        this.socket.emit(id, thing);
    }

    subscribe(id: string, func: (thing: any) => void) {
        this.socket.on(id, func);
    }
}

export default new ClientSocket();
