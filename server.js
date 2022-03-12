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
    });

    socket.on("createJoin", (obj, callback) => {
        const { roomName, username } = obj;
        const roomId = RoomHandler.exists(roomName);
        if (roomId) {
            //Join the room
            const user = UserHandler.createUser(username, false);
            const room = RoomHandler.joinRoom(roomId, user);
            socket.join(room.id);
            io.to(room.id).emit("roomUpdate", room);
            if (callback) callback({ room, user });
        } else {
            //Create the room
            const user = UserHandler.createUser(username);
            const room = RoomHandler.createRoom(roomName, user);
            socket.join(room.id);
            io.to(room.id).emit("roomUpdate", room);
            if (callback) callback({ room, user });
        }
    });

    socket.on("leaveRoom", (roomId, userId) => {
        RoomHandler.leaveRoom(roomId, userId);
        io.to(roomId).emit("roomUpdate", RoomHandler.getRoom(roomId));
        socket.leave(roomId);
    });

    socket.on("roomUpdateTest", (roomId) => {
        socket.emit("roomUpdate", RoomHandler.getRoom(roomId));
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT);

console.log(`Listening on port: ${PORT}`);
