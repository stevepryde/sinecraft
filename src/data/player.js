const {
    db
} = require("./db");

const {
    User
} = require("./users");

const playerSchema = new db.Schema({
    userId: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
        unique: true
    },
    name: String,
    health: Number,
    roomId: {
        type: String,
        index: true
    },
    maxInventory: { type: Number, min: 0 },
    inventory: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    attributes: [String],
    contextItem: [String],  // The IDs of items most recently mentioned.
    contextPlayer: String   // The ID of the player most recently mentioned.
});

const Player = db.model('Player', playerSchema);

function _createplayer(userId, displayName) {
    let player = {
        userId: userId,
        name: displayName,
        health: 100,
        room: ''
    }
    return new Player(player).save();
}

function getPlayerById(_id) {
    return Player.findById(_id).exec();
}

function getPlayerByUserId(_id) {
    return Player.findOne({ userId: _id }).exec();
}

module.exports = {
    _createplayer,
    getPlayerById,
    getPlayerByUserId,
    Player
};
