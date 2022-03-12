const { v4: GenGUID } = require("uuid");
const _ = require("lodash");

class RoomHandler {
    rooms = {};
    roomLookup = {};

    createRoom(roomName, userObj) {
        const roomId = GenGUID();
        const newRoom = {
            [roomId]: {
                id: roomId,
                name: roomName,
                users: { [userObj.id]: { ...userObj, isMaster: true } },
                referenceStories: {
                    0: "",
                    1: "",
                    2: "",
                    3: "",
                    5: "",
                    8: "",
                    13: "",
                    20: "",
                    40: "",
                },
            },
        };
        this.rooms = {
            ...this.rooms,
            ...newRoom,
        };
        this.roomLookup = { ...this.roomLookup, [roomName]: roomId };
        return newRoom[roomId];
    }

    exists(roomName) {
        const roomId = this.roomLookup[roomName];
        if (roomId) {
            return roomId;
        }
        return false;
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    joinRoom(roomId, user) {
        this.rooms = {
            ...this.rooms,
            [roomId]: {
                ...this.rooms[roomId],
                users: {
                    ...this.rooms[roomId].users,
                    [user.id]: user,
                },
            },
        };
        console.log(this.rooms[roomId]);
        return this.rooms[roomId];
    }

    leaveRoom(roomId, userId) {
        delete this.rooms[roomId].users[userId];
        if (_.isEmpty(this.rooms[roomId].users)) {
            delete this.rooms[roomId];
        }
        return this.rooms;
    }
}

module.exports = new RoomHandler();
