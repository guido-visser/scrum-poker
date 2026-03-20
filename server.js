const app = require("./server/express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const RoomHandler = require("./server/RoomHandler");
const UserHandler = require("./server/UserHandler");
const { attachLogger, logFile, writeLog } = require("./server/logger");

attachLogger();

app.get("/api/rooms/:roomId", (req, res) => {
    const room = RoomHandler.getRoomSummary(req.params.roomId);
    if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
    }

    res.json(room);
});

app.use((req, res) => {
    res.sendFile(path.join(app.locals.buildPath, "index.html"));
});

const server = http.createServer(app);
const io = new Server(server);

const emitRoomUpdate = (roomId, room) => {
    io.to(roomId).emit("roomUpdate", room);
};

const getSession = (socket) => socket.data.session || null;

const clearSession = (socket) => {
    UserHandler.purgeUser(socket.id);
    delete socket.data.session;
};

const leaveCurrentRoom = (socket, final = false) => {
    const session = getSession(socket);
    if (!session?.roomId || !session?.username) {
        return;
    }

    const updatedRoom = RoomHandler.leaveRoom(
        session.roomId,
        session.username,
        io,
        final
    );
    emitRoomUpdate(session.roomId, updatedRoom);
    socket.leave(session.roomId);
    clearSession(socket);
};

server.on("error", (error) => {
    console.error("HTTP server failed to start", error);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection", reason);
});

io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected", socket.id, reason);
        leaveCurrentRoom(socket);
    });

    socket.on("createJoin", (obj, callback) => {
        const roomName = obj?.roomName?.trim();
        const username = obj?.username?.trim();
        const requestedRoomId = obj?.roomId?.trim();
        const spectator = Boolean(obj?.spectator);

        if (!roomName || !username) {
            callback?.({
                message: "Please fill in all fields",
                messageType: "error",
            });
            return;
        }

        if (getSession(socket)) {
            leaveCurrentRoom(socket, true);
        }

        const roomId = RoomHandler.getRoom(requestedRoomId)
            ? requestedRoomId
            : RoomHandler.exists(roomName);

        if (roomId) {
            const user = {
                username,
                spectator,
                status: "online",
            };
            const room = RoomHandler.joinRoom(roomId, user);
            if (room?.error) {
                callback?.(room);
                return;
            }

            const roomUser = spectator
                ? room.spectators[username]
                : room.users[username];
            const session = {
                roomId: room.id,
                username,
                spectator,
                master: Boolean(roomUser?.master),
            };

            UserHandler.bindUser(socket.id, session);
            socket.data.session = session;
            socket.join(room.id);
            console.log("User joined room", {
                username,
                roomId: room.id,
                spectator,
            });
            callback?.({ room, user: roomUser });
            emitRoomUpdate(room.id, room);
            return;
        }

        if (spectator) {
            callback?.({
                message: "Can't spectate a room that doesn't exist",
                messageType: "error",
            });
            return;
        }

        const user = {
            username,
            master: true,
            status: "online",
        };
        const room = RoomHandler.createRoom(roomName, user);
        const session = {
            roomId: room.id,
            username,
            spectator: false,
            master: true,
        };

        UserHandler.bindUser(socket.id, session);
        socket.data.session = session;
        socket.join(room.id);
        console.log("Room created", {
            roomId: room.id,
            roomName: room.name,
            username,
        });
        callback?.({ room, user: room.users[username] });
        emitRoomUpdate(room.id, room);
    });

    socket.on("leaveRoom", () => {
        console.log("Leave room requested", socket.id);
        leaveCurrentRoom(socket, true);
    });

    socket.on("startVoting", () => {
        const session = getSession(socket);
        if (!session) {
            return;
        }

        console.log("Voting started", session);
        emitRoomUpdate(
            session.roomId,
            RoomHandler.startVoting(session.roomId, session.username)
        );
    });

    socket.on("stopVoting", () => {
        const session = getSession(socket);
        if (!session) {
            return;
        }

        console.log("Voting stopped", session);
        emitRoomUpdate(
            session.roomId,
            RoomHandler.stopVoting(session.roomId, session.username)
        );
    });

    socket.on("castVote", ({ vote }) => {
        const session = getSession(socket);
        if (!session) {
            return;
        }

        console.log("Vote cast", { ...session, vote });
        emitRoomUpdate(
            session.roomId,
            RoomHandler.castVote(session.username, session.roomId, vote)
        );
    });

    socket.on("saveStories", ({ stories }) => {
        const session = getSession(socket);
        if (!session) {
            return;
        }

        console.log("Stories saved", {
            roomId: session.roomId,
            username: session.username,
            storyCount: Object.keys(stories || {}).length,
        });
        emitRoomUpdate(
            session.roomId,
            RoomHandler.saveStories(session.roomId, session.username, stories)
        );
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down");
    process.exit(0);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
    console.log(`Server log file: ${logFile}`);
});

writeLog("INFO", ["Server bootstrap complete"]);
