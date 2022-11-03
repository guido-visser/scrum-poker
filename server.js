const app = require("./server/express");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const UserHandler = require("./server/UserHandler");
const RoomHandler = require("./server/RoomHandler");
const io = new Server(server, { port: 8081 });

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
        const userId = UserHandler.getUserIdBySocketId(socket.id);
        leaveRoom(userId, RoomHandler.getRoomIdByUserId(userId));
    });

    // Room stuff

    socket.on("createJoin", (obj, callback) => {
        const { roomName, username, spectator } = obj;
        const roomId = RoomHandler.exists(roomName);
        if (roomId) {
            //Join the room
            const user = UserHandler.createUser(
                username,
                socket.id,
                false,
                spectator
            );
            const room = RoomHandler.joinRoom(roomId, user);
            if (room.error) {
                if (callback) callback(room);
                return;
            }
            socket.join(room.id);
            if (callback) callback({ room, user });
            io.to(room.id).emit("roomUpdate", room);
        } else {
            if (spectator) {
                callback({
                    message: "Can't spectate a room that doesn't exist",
                    messageType: "error",
                });
                return;
            }
            //Create the room
            const user = UserHandler.createUser(username, socket.id, true);
            const room = RoomHandler.createRoom(roomName, user);
            socket.join(room.id);
            if (callback) callback({ room, user });
            io.to(room.id).emit("roomUpdate", room);
        }
    });

    const leaveRoom = (userId, roomId) => {
        io.to(roomId).emit(
            "roomUpdate",
            RoomHandler.leaveRoom(roomId, userId, io)
        );
        socket.leave(roomId);
    };

    socket.on("leaveRoom", ({ roomId, userId }) => {
        leaveRoom(userId, roomId);
    });

    // Vote stuff

    socket.on("startVoting", (roomId) => {
        io.to(roomId).emit("roomUpdate", RoomHandler.startVoting(roomId));
    });

    socket.on("stopVoting", (roomId) => {
        io.to(roomId).emit("roomUpdate", RoomHandler.stopVoting(roomId));
    });

    socket.on("castVote", ({ roomId, userId, vote }) => {
        io.to(roomId).emit(
            "roomUpdate",
            RoomHandler.castVote(userId, roomId, vote)
        );
    });

    // Story stuff

    socket.on("saveStories", ({ roomId, stories }) => {
        io.to(roomId).emit(
            "roomUpdate",
            RoomHandler.saveStories(roomId, stories)
        );
    });
});

process.on('SIGINT', function() {
    process.exit(0);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT);

console.log(`Listening on port: ${PORT}`);
