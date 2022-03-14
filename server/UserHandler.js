require("uuid");

class UserHandler {
    createUser(username, id, master, spectator) {
        return { id, username, master, spectator };
    }
}

module.exports = new UserHandler();
