const { v4: GenGUID } = require("uuid");
const _ = require("lodash");

class RoomHandler {
    rooms = {};
    users = {};
    spectators = {};

    createRoom(roomName, user) {
        const roomId = GenGUID();
        const joinedAt = Date.now();
        const newRoom = {
            [roomId]: {
                id: roomId,
                name: roomName,
                users: {
                    [user.username]: {
                        ...user,
                        master: true,
                        joinedAt,
                    },
                },
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

    getRoom(roomId) {
        return this.rooms[roomId] || null;
    }

    getRoomSummary(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return null;
        }

        return {
            id: room.id,
            name: room.name,
        };
    }

    exists(roomName) {
        return Object.keys(this.rooms).find(
            (roomId) => this.rooms[roomId].name === roomName
        );
    }

    getRoomIdByUserId(userId) {
        return this.users[userId] || this.spectators[userId] || null;
    }

    isMaster(roomId, userId) {
        return Boolean(this.getRoom(roomId)?.users?.[userId]?.master);
    }

    canVote(roomId, userId) {
        const user = this.getRoom(roomId)?.users?.[userId];
        return Boolean(user && user.status === "online");
    }

    joinRoom(roomId, user) {
        let thisRoom = this.rooms[roomId];
        if (!thisRoom) {
            return {
                error: "Room does not exist",
            };
        }

        if (!user.spectator) {
            const existingUser = thisRoom.users[user.username];
            if (existingUser?.status === "online") {
                return {
                    error: "User already exists, please use another username",
                };
            }

            thisRoom = {
                ...thisRoom,
                users: {
                    ...thisRoom.users,
                    [user.username]: {
                        ...user,
                        master: Boolean(existingUser?.master),
                        joinedAt: existingUser?.joinedAt || Date.now(),
                    },
                },
            };
            this.users[user.username] = roomId;
        } else {
            const existingSpectator = thisRoom.spectators[user.username];
            thisRoom = {
                ...thisRoom,
                spectators: {
                    ...thisRoom.spectators,
                    [user.username]: {
                        ...user,
                        joinedAt: existingSpectator?.joinedAt || Date.now(),
                    },
                },
            };
            this.spectators[user.username] = roomId;
        }

        this.rooms[roomId] = thisRoom;
        return thisRoom;
    }

    getOnlineUsers(roomId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return [];
        }

        return Object.entries(room.users)
            .map(([username, user]) => ({ username, ...user }))
            .filter((user) => user.status === "online");
    }

    getNextMaster(roomId, leavingUserId) {
        return this.getOnlineUsers(roomId)
            .filter((user) => user.username !== leavingUserId)
            .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))[0];
    }

    transferMaster(roomId, leavingUserId) {
        const room = this.getRoom(roomId);
        if (!room) {
            return null;
        }

        const nextMaster = this.getNextMaster(roomId, leavingUserId);
        if (!nextMaster) {
            return null;
        }

        if (room.users[leavingUserId]) {
            room.users[leavingUserId].master = false;
        }
        room.users[nextMaster.username].master = true;
        return nextMaster.username;
    }

    leaveRoom(roomId, userId, io, final = false) {
        const thisRoom = this.rooms[roomId];
        if (!thisRoom) {
            return null;
        }

        if (thisRoom.spectators[userId]) {
            delete thisRoom.spectators[userId];
            delete this.spectators[userId];
            return thisRoom;
        }

        const thisUser = thisRoom.users[userId];
        if (!thisUser) {
            return thisRoom;
        }

        const isMaster = Boolean(thisUser.master);
        delete this.users[userId];

        if (final) {
            delete thisRoom.users[userId];
        } else {
            thisRoom.users[userId] = {
                ...thisUser,
                status: "offline",
                master: false,
            };
        }

        const remainingOnlineUsers = this.getOnlineUsers(roomId).filter(
            (user) => user.username !== userId
        );

        if (isMaster) {
            if (remainingOnlineUsers.length === 0) {
                io.to(roomId).emit("roomUpdate", null);
                Object.keys(thisRoom.users).forEach((username) => delete this.users[username]);
                Object.keys(thisRoom.spectators).forEach(
                    (username) => delete this.spectators[username]
                );
                delete this.rooms[roomId];
                return null;
            }

            this.transferMaster(roomId, userId);
        }

        if (!final) {
            setTimeout(() => {
                const room = this.rooms[roomId];
                if (room?.users?.[userId]?.status === "offline") {
                    io.to(roomId).emit(
                        "roomUpdate",
                        this.leaveRoom(roomId, userId, io, true)
                    );
                }
            }, 1000 * 20);
        }

        return thisRoom;
    }

    startVoting(roomId, userId) {
        if (!this.canVote(roomId, userId)) {
            return this.getRoom(roomId);
        }

        const thisRoom = this.getRoom(roomId);
        if (!thisRoom) {
            return null;
        }

        thisRoom.voting = true;
        thisRoom.votes = {};
        return thisRoom;
    }

    stopVoting(roomId, userId) {
        if (!this.isMaster(roomId, userId)) {
            return this.getRoom(roomId);
        }

        const thisRoom = this.getRoom(roomId);
        if (!thisRoom) {
            return null;
        }

        thisRoom.voting = false;
        return thisRoom;
    }

    castVote(userId, roomId, vote) {
        const thisRoom = this.getRoom(roomId);
        if (!thisRoom || !this.canVote(roomId, userId) || !thisRoom.voting) {
            return thisRoom;
        }

        const numericVote = Number(vote);
        if (!Number.isFinite(numericVote) || !(numericVote in thisRoom.stories)) {
            return thisRoom;
        }

        thisRoom.votes[userId] = numericVote;
        if (
            Object.keys(thisRoom.votes).length === this.getOnlineUsers(roomId).length
        ) {
            thisRoom.voting = false;
            thisRoom.lastVoteTime = new Date().toISOString();
        }

        return thisRoom;
    }

    saveStories(roomId, userId, stories) {
        if (!this.isMaster(roomId, userId)) {
            return this.getRoom(roomId);
        }

        const thisRoom = this.getRoom(roomId);
        if (!thisRoom || !stories || typeof stories !== "object") {
            return thisRoom;
        }

        const sanitizedStories = Object.entries(stories).reduce((acc, [key, value]) => {
            const numericKey = Number(key);
            if (!Number.isFinite(numericKey)) {
                return acc;
            }

            acc[numericKey] = typeof value === "string" ? value : String(value ?? "");
            return acc;
        }, {});

        if (_.isEmpty(sanitizedStories)) {
            return thisRoom;
        }

        thisRoom.stories = sanitizedStories;
        return thisRoom;
    }
}

module.exports = new RoomHandler();
