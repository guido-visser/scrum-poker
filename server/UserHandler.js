class UserHandler {
    users = {};

    bindUser(socketId, session) {
        this.users[socketId] = session;
        return session;
    }

    getSessionBySocketId(socketId) {
        return this.users[socketId] || null;
    }

    purgeUser(socketId) {
        delete this.users[socketId];
    }
}

module.exports = new UserHandler();
