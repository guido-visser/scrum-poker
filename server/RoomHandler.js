const { v4: GenGUID } = require("uuid");
const _ = require("lodash");

class RoomHandler {
    rooms = {};
    users = {};
    spectators = {};

    cleanup() {
        setTimeout(() => {}, 30000);
    }

    // Room stuff

    createRoom(roomName, user) {
        const roomId = GenGUID();
        const newRoom = {
            [roomId]: {
                id: roomId,
                name: roomName,
                users: { [user.username]: { ...user, master: true } },
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
                spectators: {},
            },
        };
        this.rooms = {
            ...this.rooms,
            ...newRoom,
        };
        this.users[user.username] = roomId;
        return newRoom[roomId];
    }

    getRoomIdByUserId(userId) {
        return this.users[userId] || this.spectators[userId];
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    joinRoom(roomId, user) {
        let thisRoom = this.rooms[roomId];
        //If the user is not a spectator and does not exist in the room
        if (!user.spectator) {
            //Check if user already exists
            if (thisRoom.users[user.username]) {
                if (thisRoom.users[user.username].status === "online") {
                    return {
                        error: "User already exists, please use another username",
                    };
                }
            }
            thisRoom = {
                ...thisRoom,
                users: {
                    ...thisRoom.users,
                    [user.username]: user,
                },
            };
            this.users[user.username] = roomId;
        } else {
            thisRoom = {
                ...thisRoom,
                spectators: {
                    ...thisRoom.spectators,
                    [user.username]: user,
                },
            };
            this.spectators[user.username] = roomId;
        }
        this.rooms[roomId] = thisRoom;
        return thisRoom;
    }

    leaveRoom(roomId, userId, io, final) {
        let newUsers = {};
        let newSpectators = {};
        const thisRoom = this.rooms[roomId];

        if (!thisRoom) {
            console.log("Trying to leave a room that doesn't exist");
            return;
        }

        const spectator = !!_.get(thisRoom, `spectators[${userId}]`, false);
        if (spectator) {
            Object.keys(thisRoom.spectators).forEach((spectator) => {
                const thisSpectator = thisRoom.spectators[spectator];
                if (spectator !== userId) {
                    newSpectators = {
                        ...newSpectators,
                        [spectator]: thisSpectator,
                    };
                }
            });
            this.rooms[roomId].spectators = newSpectators;
            return this.rooms[roomId];
        }

        const isMaster = _.get(thisRoom, `users[${userId}].master`, false);
        Object.keys(thisRoom.users).forEach((user) => {
            const thisUser = thisRoom.users[user];
            if (user === userId) {
                if (thisUser.status === "offline") {
                    newUsers = { ...newUsers };
                    return;
                }
                newUsers = {
                    ...newUsers,
                    [user]: {
                        ...thisUser,
                        status: "offline",
                    },
                };
            } else {
                newUsers = {
                    ...newUsers,
                    [user]: thisUser,
                };
            }
        });
        thisRoom.users = newUsers;
        if (isMaster || _.isEmpty(newUsers)) {
            io.to(roomId).emit("roomUpdate", null);
            delete this.rooms[roomId];
            console.log("Room removed");
            return;
        }

        //After 20 seconds, remove
        if (!final) {
            setTimeout(() => {
                if (this.rooms[roomId]?.users[userId]?.status === "offline") {
                    io.to(roomId).emit(
                        "roomUpdate",
                        this.leaveRoom(roomId, userId, io, true)
                    );
                }
            }, 1000 * 20);
        }
        return this.rooms[roomId] || null;
    }

    exists(roomName) {
        return Object.keys(this.rooms).find(
            (roomId) => this.rooms[roomId].name === roomName
        );
    }

    // Voting stuff

    startVoting(roomId) {
        const thisRoom = this.getRoom(roomId);
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
        if (!thisRoom) return;

        thisRoom.votes[userId] = vote;
        console.log("VOTE CAST");
        //Check if it's the last vote
        if (
            Object.keys(thisRoom.votes).length ===
            Object.keys(thisRoom.users).length
        ) {
            thisRoom.voting = false;
            thisRoom.lastVoteTime = new Date();
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
