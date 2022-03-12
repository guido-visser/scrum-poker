const app = require("./server/express");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const UserHandler = require("./server/UserHandler");
const RoomHandler = require("./server/RoomHandler");
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
        leaveRoom(socket.id, RoomHandler.getRoomIdByUserId(socket.id));
    });

    socket.on("createJoin", (obj, callback) => {
        const { roomName, username } = obj;
        const roomId = RoomHandler.exists(roomName);
        if (roomId) {
            //Join the room
            socket.sp_roomId = roomId;
            const user = UserHandler.createUser(username, socket.id, false);
            const room = RoomHandler.joinRoom(roomId, user);
            socket.join(room.id);
            if (callback) callback({ room, user });
            io.to(room.id).emit("roomUpdate", room);
        } else {
            //Create the room
            const user = UserHandler.createUser(username, socket.id);
            const room = RoomHandler.createRoom(roomName, user);
            socket.join(room.id);
            if (callback) callback({ room, user });
            io.to(room.id).emit("roomUpdate", room);
        }
    });

    socket.on("startVoting", (roomId) => {
        io.to(roomId).emit("roomUpdate", RoomHandler.startVoting(roomId));
    });

    socket.on("castVote", ({ roomId, userId, vote }) => {
        const room = RoomHandler.castVote(userId, roomId, vote);
        io.to(roomId).emit("roomUpdate", room);
    });

    const leaveRoom = (userId, roomId) => {
        io.to(roomId).emit("roomUpdate", RoomHandler.leaveRoom(roomId, userId));
        socket.leave(roomId);
    };

    socket.on("leaveRoom", ({ roomId, userId }) => {
        leaveRoom(userId, roomId);
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT);

console.log(`Listening on port: ${PORT}`);
