class UserHandler {
    users = {};

    createUser(username, socketId, master, spectator) {
        this.users[socketId] = username;
        if (!spectator) {
            return { username, master, status: "online" };
        } else {
            return { username, spectator, status: "online" };
        }
    }

    getUserIdBySocketId = (socketId) => {
        return this.users[socketId];
    };

    purgeUser = (id) => {
        delete this.users[id];
    };
}

module.exports = new UserHandler();
