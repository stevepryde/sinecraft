const {
    db
} = require("./db");

const userSchema = db.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    displayName: String,
    pwhash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    authToken: String,
    refreshToken: String
});

const User = db.model('User', userSchema);

function _createuser(user) {
    return new User(user).save();
}

function getUserById(_id) {
    return User.findById(_id).exec();
}

function getUserAuthStuff(username) {
    return User.findOne({
        username: username
    }, '_id pwhash salt').exec();
}

function updateUserTokens(_id, token, refreshToken) {
    return User.findOneAndUpdate({ _id: _id }, {
        authToken: token,
        refreshToken: refreshToken
    }).exec();
}

module.exports = {
    _createuser,
    getUserAuthStuff,
    getUserById,
    User,
    updateUserTokens
};
