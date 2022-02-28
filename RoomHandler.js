class RoomHandler {
    rooms = {};

    createRoom(roomId, userObj) {
        this.rooms = {
            ...this.rooms,
            [roomId]: {
                users: {
                    [userObj]: userObj.name,
                },
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
    }

    joinRoom(roomId, userObj) {
        this.rooms = {
            ...this.rooms,
            [roomId]: {
                ...this.rooms[roomId],
                users: {
                    ...this.rooms[roomId].users,
                    [userObj.id]: userObj.name,
                },
            },
        };
    }
    leaveRoom(roomId, userObj) {}
}
