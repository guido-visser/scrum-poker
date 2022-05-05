class UserHandler {
    createUser(username, id, master, spectator) {
        if (!spectator) {
            return { id, username, master, status: "online" };
        } else {
            return { id, username, spectator, status: "online" };
        }
    }
}

module.exports = new UserHandler();
