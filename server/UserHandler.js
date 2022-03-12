require("uuid");

class UserHandler {
    createUser(username, id, isMaster) {
        return { id, username, isMaster };
    }
}

module.exports = new UserHandler();
