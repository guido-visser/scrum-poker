import io from "socket.io-client";

class ClientSocket {
    socket: any = null;

    connect() {
        this.socket = io();
    }

    disconnect() {
        this.socket.disconnect();
    }

    emit(id: string, thing?: any, callback?: (thing: any) => void) {
        this.socket.emit(id, thing, callback);
    }

    subscribe(
        id: string,
        func: (thing: any) => void,
        callback?: (thing: any) => void
    ) {
        this.socket.on(id, func, callback ? callback : undefined);
    }
}

export default new ClientSocket();
