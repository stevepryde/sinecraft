const express = require("express");
const {
    AuthError,
    isAuthenticated,
    TokenInvalidError
} = require("../auth/auth");
const {
    User
} = require("../data/users");
const {
    getAllExitsForRoom,
    getOtherRoom,
    getRoomName,
    getRoomNameWithPrefixIn
} = require("../data/room");
const {
    clearPlayerMessages,
    getPlayerMetadata,
    getPlayerName,
    getPlayersInRoom
} = require("../data/player");
const {
    getItemName,
    getItemsForPlayer,
    getItemsInRoom
} = require("../data/item");
const {
    formatList
} = require("../misc");

const {
    authErrorHandler
} = require("./errors");

const router = express.Router();

router.get('/me', isAuthenticated, function (req, res) {
    // WARNING: NEVER send the entire user object to the client.
    res.json({
        name: req.user.username
    });
});

router.get('/status', isAuthenticated, function (req, res) {
    var status = "";
    var messages = getPlayerMetadata(req.player, 'messages', []);
    for (let message of messages) {
        status += message + "\n\n";
    }

    status += "You are " + getRoomNameWithPrefixIn(req.player.room) + ".\n";
    if (req.player.room.shortDesc) {
        status += req.player.room.shortDesc + "\n";
    }

    Promise.all([
        getItemsInRoom(req.player.room._id),
        getItemsForPlayer(req.player._id),
        getAllExitsForRoom(req.player.room._id),
        getPlayersInRoom(req.player.room._id),
        clearPlayerMessages(req.player)
    ]).then(results => {
        const [roomItems, playerItems, roomExits, playersInRoom, _p] = results;

        let items = [];
        if (playerItems && playerItems.length > 0) {
            for (let i of playerItems) {
                items.push(getItemName(i));
            }

            status += "You are carrying " + formatList(items) + ".\n";
        }

        let playerNames = [];
        if (playersInRoom && playersInRoom.length > 1) {
            for (let p of playersInRoom) {
                if (p._id.toString() !== req.player._id.toString()) {
                    playerNames.push(getPlayerName(p));
                }
            }

            if (playerNames.length > 0) {
                status += "You can see " + formatList(playerNames) + ".\n";
            }
        }

        items = [];
        if (roomItems && roomItems.length > 0) {
            for (let i of roomItems) {
                items.push(getItemName(i));
            }

            status += "You can see " + formatList(items) + ".\n";
        }

        let joinedRooms = [];
        if (roomExits && roomExits.length > 0) {
            for (let r of roomExits) {
                let otherRoom = getOtherRoom(req.player.room._id, r.rooms);
                joinedRooms.push(getRoomName(otherRoom));
            }

            status += "You can visit " + formatList(joinedRooms);
        }

        res.json({
            status: status
        });
    })
        .catch(function (err) {
            res.json({
                status: status
            });
        });
});



module.exports = router;
