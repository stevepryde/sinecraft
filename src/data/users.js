const {
    db
} = require("./db");

const userSchema = new db.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    pwhash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    authToken: String,
    refreshToken: String,
    lastLogin: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false }
});

const User = db.model('User', userSchema);

function _createuser(user) {
    return new User(user).save();
}

function _deluser(_id) {
    return User.findOneAndRemove({ _id: _id }).exec();
}

function _updatepw(_id, newpwhash, newsalt) {
    return User.findOneAndUpdate(
        { _id: _id },
        {
            pwhash: newpwhash,
            salt: newsalt
        }).exec();
}

function getUserById(_id) {
    return User.findById(_id).exec();
}

function getUserByName(username) {
    return User.findOne({ username: username }).exec();
}

function getUserAuthStuff(username) {
    return User.findOne({
        username: username
    }, '_id pwhash salt').exec();
}

function getAllUsers() {
    return User.find().exec();
}

function updateUsername(_id, username) {
    return User.findOneAndUpdate({ _id: _id }, { username: username }).exec();
}

function updateUserTokens(_id, token, refreshToken) {
    return User.findOneAndUpdate({ _id: _id }, {
        authToken: token,
        refreshToken: refreshToken
    }).exec();
}


module.exports = {
    _createuser,
    _deluser,
    _updatepw,
    getAllUsers,
    getUserAuthStuff,
    getUserById,
    getUserByName,
    User,
    updateUsername,
    updateUserTokens
};
