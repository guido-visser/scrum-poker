const { v4: GenGUID } = require("uuid");
const _ = require("lodash");

class RoomHandler {
    rooms = {};
    users = {};

    // Room stuff

    createRoom(roomName, user) {
        const roomId = GenGUID();
        const newRoom = {
            [roomId]: {
                id: roomId,
                name: roomName,
                users: { [user.id]: { ...user, isMaster: true } },
                stories: {
                    0: "Tekstwijziging",
                    1: "",
                    2: "Exporteren van een entiteit",
                    3: "",
                    5: "Mailplugin bouwen",
                    8: "",
                    13: "Documentatie viewer/editor bouwen",
                    20: "",
                    40: "",
                },
                voting: false,
                votes: {},
            },
        };
        this.rooms = {
            ...this.rooms,
            ...newRoom,
        };
        this.users[user.id] = roomId;
        return newRoom[roomId];
    }

    getRoomIdByUserId(userId) {
        return this.users[userId];
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    joinRoom(roomId, user) {
        const thisRoom = this.rooms[roomId];
        this.rooms = {
            ...this.rooms,
            [roomId]: {
                ...thisRoom,
                users: {
                    ...thisRoom.users,
                    [user.id]: user,
                },
            },
        };
        this.users[user.id] = roomId;
        return this.rooms[roomId];
    }

    leaveRoom(roomId, userId) {
        let newUsers = {};
        const thisRoom = this.rooms[roomId];
        let isMaster = thisRoom?.users[userId]?.isMaster || false;
        if (thisRoom) {
            Object.keys(thisRoom?.users)
                .filter((user) => user !== userId)
                .forEach((user) => {
                    newUsers = {
                        ...newUsers,
                        [user]: thisRoom.users[user],
                    };
                });
            thisRoom.users = newUsers;
            if (_.isEmpty(newUsers) || isMaster) {
                delete this.rooms[roomId];
                console.log("Room removed");
            }
        }
        delete this.users[userId];
        return this.rooms[roomId] ? this.rooms[roomId] : null;
    }

    exists(roomName) {
        return Object.keys(this.rooms).find(
            (roomId) => this.rooms[roomId].name === roomName
        );
    }

    // Voting stuff

    startVoting(roomId) {
        const thisRoom = this.rooms[roomId];
        thisRoom.voting = true;
        thisRoom.votes = {};
        return thisRoom;
    }
    stopVoting(roomId) {
        this.rooms[roomId].voting = false;
        return this.rooms[roomId];
    }

    castVote(userId, roomId, vote) {
        const thisRoom = this.rooms[roomId];
        thisRoom.votes[userId] = vote;
        console.log("VOTE CAST");
        //Check if it's the last vote
        if (
            Object.keys(thisRoom.votes).length ===
            Object.keys(thisRoom.users).length
        ) {
            thisRoom.voting = false;
        }
        return thisRoom;
    }

    // Stories stuff

    saveStories(roomId, stories) {
        const thisRoom = this.rooms[roomId];
        thisRoom.stories = stories;
        return thisRoom;
    }
}

module.exports = new RoomHandler();
