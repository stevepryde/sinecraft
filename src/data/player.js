const {
    db
} = require("./db");

const {
    User
} = require("./users");

const {
    getDefaultRoom
} = require("./room");

const playerSchema = new db.Schema({
    user: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
        unique: true
    },
    name: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    health: {
        type: Number,
        default: 100
    },
    room: {
        type: db.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index: true,
        default: null
    },
    maxInventory: { type: Number, min: 0 },
    attributes: [String],
    attributeStatus: Object, // Object mapping attributes to state strings.
    contextItem: [db.Schema.Types.ObjectId],  // The IDs of items most recently mentioned.
    contextPlayer: db.Schema.Types.ObjectId,   // The ID of the player most recently mentioned.
    metadata: Object // Object containing various metadata.
});

const Player = db.model('Player', playerSchema);

function _createplayer(userId, name) {
    return getDefaultRoom()
        .then(function (room) {
            let player = {
                user: userId,
                name: name,
                health: 100,
                maxInventory: 20,
                room: room._id,
                metadata: {},
                attributes: [],
                attributeStatus: {},
                contextItem: []
            }
            return new Player(player).save();
        });
}

function getPlayerById(_id) {
    return Player.findById(_id).populate('room').populate('user').exec();
}

function getPlayerByUserId(_id) {
    return Player.findOne({ user: _id }).populate('room').populate('user').exec();
}

function getPlayerByName(name) {
    return Player.findOne({ name: name }).populate('room').populate('user').exec();
}

function updatePlayerRoom(_id, roomId) {
    return Player.findByIdAndUpdate(_id, {
        room: roomId
    }).exec();
}

function updatePlayer(player) {
    return Player.findByIdAndUpdate(player._id, player).exec();
}

function addPlayerAttribute(player, attr) {
    if (player.attributes.indexOf(attr) >= 0) {
        return player; // Nothing to do.
    }

    player.attributes.push(attr);
    return updatePlayer(player);
}

function delPlayerAttribute(player, attr) {
    let index = player.attributes.indexOf(attr);

    if (index < 0) {
        return player; // Nothing to do.
    }

    player.attributes.splice(index, 1);
    return updatePlayer(player);
}

function getPlayersInRoom(roomId) {
    return Player.find({ room: roomId }).exec();
}

function getPlayerName(player) {
    return player.name.charAt(0).toUpperCase() + player.name.slice(1);
}

module.exports = {
    addPlayerAttribute,
    delPlayerAttribute,
    getPlayersInRoom,
    _createplayer,
    getPlayerById,
    getPlayerByUserId,
    getPlayerName,
    Player,
    updatePlayerRoom
};
