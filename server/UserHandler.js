const { v4: GenGUID } = require("uuid");

class UserHandler {
    createUser(username, isMaster) {
        return { id: GenGUID(), username, isMaster };
    }
}

module.exports = new UserHandler();
