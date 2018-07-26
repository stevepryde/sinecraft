const { cmdRouter } = require("./commandRouter");

const {
    getAllExitsForRoom,
    getOtherRoom,
    getRoomName,
    getRoomNameWithPrefixIn
} = require("../data/room");
const {
    updatePlayerRoom
} = require("../data/player");
const {
    getPlayerItemByName,
    getRoomItemByName,
    updateItem
} = require("../data/item");
const {
    Attributes,
    hasAttribute
} = require("../misc");

cmdRouter.on("go room*", function (params, player) {
    let targetRoom = params.room.toLowerCase();
    targetRoom = targetRoom.replace(new RegExp("^to\\s", 'i'), "");
    targetRoom = targetRoom.replace(new RegExp("^the\\s", 'i'), "");

    return getAllExitsForRoom(player.room._id)
        .then(function (roomExits) {
            if (!roomExits) {
                return "You cannot go anywhere! Looks like you need an admin to rescue you...";
            }

            let newRoom;
            for (let r of roomExits) {
                let otherRoom = getOtherRoom(player.room._id, r.rooms);
                if (otherRoom.name.toLowerCase() === targetRoom.toLowerCase()) {
                    // Go there!
                    newRoom = otherRoom;
                    break;
                }
            }

            // Try partial match.
            if (!newRoom) {
                for (let r of roomExits) {
                    let otherRoom = getOtherRoom(player.room._id, r.rooms);
                    if (otherRoom.name.toLowerCase().includes(targetRoom.toLowerCase())) {
                        // Go there!
                        newRoom = otherRoom;
                        break;
                    }
                }
            }

            if (!newRoom) {
                return "You cannot go there.";
            }


            // Update player room.
            player.room = newRoom._id;
            return updatePlayerRoom(player._id, newRoom._id)
                .then(function (updatedPlayer) {
                    return "You make your way to " + getRoomName(newRoom) + ".";
                });
        })
        .catch(function (err) {
            return "There was an error when attempting to visit that room";
        });
});

cmdRouter.on("drop item*", function (params, player) {
    return getPlayerItemByName(player._id, params.item)
        .then(function (item) {
            if (!item) {
                return "You don't have that item";
            }

            item.player = null;
            item.room = player.room._id;
            return updateItem(item).then(function (itemSaved) {
                return "You dropped the " + itemSaved.name + " " + getRoomNameWithPrefixIn(player.room) + ".";
            });
        })
        .catch(function (err) {
            return "It seems I forgot how to drop things: " + err.message;
        });
});

cmdRouter.on("pick up item*", function (params, player) {
    if (params.up !== 'up') {
        return "Pick what now? Did you mean 'pick up'?";
    }

    return getRoomItemByName(player.room._id, params.item)
        .then(function (item) {
            if (!item) {
                return "I can't find that item anywhere";
            }

            if (!hasAttribute(item, Attributes.canPickUp)) {
                return "This item cannot be picked up";
            }

            item.room = null;
            item.player = player._id;
            return updateItem(item).then(function (item) {
                return "You picked up the " + item.name + ".";
            });
        })
        .catch(function (err) {
            return "It seems I forgot how to pick up things";
        });
});

