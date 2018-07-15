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
    getRoomName
} = require("../data/room");
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
    var status = "You are " + req.player.room.prefixIn + " " + getRoomName(req.player.room) + ".\n";
    if (req.player.room.shortDesc) {
        status += req.player.room.shortDesc + "\n";
    }
    // TODO: list items in room.
    getAllExitsForRoom(req.player.room._id)
        .then(function (roomExits) {
            let joinedRooms = [];
            if (joinedRooms) {
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
