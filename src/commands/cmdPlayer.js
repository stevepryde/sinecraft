const { cmdRouter } = require("./commandRouter");

const {
    getAllExitsForRoom,
    getOtherRoom,
    getRoomName,
    getRoomNameWithPrefixIn
} = require("../data/room");
const {
    addPlayerMessage,
    getPlayerInRoom,
    getPlayerName,
    getPlayersInRoom,
    updatePlayerRoom
} = require("../data/player");
const {
    getItemName,
    getPlayerItemByName,
    getRoomItemByName,
    updateItem
} = require("../data/item");
const {
    Attributes,
    formatList,
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

cmdRouter.on("give name item*", function (params, player) {
    return getPlayerItemByName(player._id, params.item)
        .then(function (item) {
            if (!item) {
                return "You don't have that item";
            }

            return getPlayerInRoom(player.room._id, params.name)
                .then(function (p) {
                    if (!p) {
                        return params.name + " doesn't seem to be here";
                    }

                    item.player = p._id;
                    item.room = null;
                    return updateItem(item)
                        .then(function (itemSaved) {
                            return addPlayerMessage(p, getPlayerName(player) + " gave you " + getItemName(itemSaved))
                                .then(function (_p) {
                                    return "You give the " + itemSaved.name + " to " + getPlayerName(p);
                                });
                        });
                });
        })
        .catch(function (err) {
            return "It seems I forgot how to give things to people: " + err.message;
        });
});

cmdRouter.on("say message*", function (params, player) {
    return getPlayersInRoom(player.room._id)
        .then(function (playersInRoom) {
            if (!playersInRoom || playersInRoom.length < 2) {
                return "You proudly utter the words only to realise you are the only one in the room";
            }

            var message = getPlayerName(player) + " said, \"" + params.message + "\"";

            var promises = [];
            for (let p of playersInRoom) {
                if (p._id.toString() !== player._id.toString()) {
                    promises.push(addPlayerMessage(p, message));
                }
            }

            return Promise.all(promises)
                .then(function (playerList) {
                    if (!playerList || playerList.length === 0) {
                        return "You speak, but hear only your own echo.";
                    }

                    var playerNames = [];
                    for (let p of playerList) {
                        playerNames.push(getPlayerName(p));
                    }

                    return "Your message was heard by " + formatList(playerNames);
                });
        })
        .catch(function (err) {
            return "Say what now?";
        });
});

cmdRouter.on("tell name message*", function (params, player) {
    return getPlayersInRoom(player.room._id)
        .then(function (playersInRoom) {
            if (!playersInRoom || playersInRoom.length < 2) {
                return "You whisper but there is no one here";
            }

            var message = getPlayerName(player) + " whispered, \"" + params.message + "\"";

            var promises = [];
            for (let p of playersInRoom) {
                if (p.name.toLowerCase() === params.name.toLowerCase()) {
                    return addPlayerMessage(p, message)
                        .then(function (p) {
                            return "You whisper to " + getPlayerName(p);
                        });
                }
            }

            return "You whisper but " + params.name + " is not here";
        })
        .catch(function (err) {
            return "Say what now?";
        });
});
