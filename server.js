const app = require("./server/express");
const path = require("path");
const { v4: GenGUID } = require("uuid");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let rooms = {};

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("createJoin", (obj) => {
        const { roomName, username } = obj;
        if (rooms[roomName]) {
            //Join the room
        } else {
            //Create the room
            const roomId = GenGUID();

            console.log("ROOM CREATED:", roomId);
            socket.emit("createdRoom", roomId);
        }
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT);

console.log(`Listening on port: ${PORT}`);
