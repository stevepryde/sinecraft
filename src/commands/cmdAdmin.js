/* Admin command handler */

const { cmdRouter } = require("./commandRouter");
const { createUser, setUserPassword } = require("../auth/auth");
const {
    addPlayerAttribute,
    delPlayerAttribute,
    getPlayerByUserId
} = require("../data/player");
const {
    getAllExitsForRoom,
    getOtherRoom,
    getRoomByName,
    joinRooms,
    roomCreate,
    roomDelete,
    roomList,
    splitRooms,
    updateRoom
} = require("../data/room");
const {
    _deluser,
    getAllUsers,
    getUserByName,
    updateUsername
} = require("../data/users");
const {
    addItemAttribute,
    delItemAttribute,
    getItemById,
    getItemsForPlayer,
    getItemsInRoom,
    itemCreate,
    itemDelete,
    updateItem
} = require("../data/item");
const {
    Attributes,
    hasAttribute
} = require("../misc");

cmdRouter.on("/adduser username password", function (params, player) {
    var username = params.username;
    var password = params.password;
    return createUser({
        username: username,
        password: password
    }).then(function (user) {
        return "User '" + username + "' created successfully";
    }).catch(function (err) {
        return "Error adding user: " + err.message;
    });
});

cmdRouter.on("/moduser username param value", function (params, player) {
    return getUserByName(params.username)
        .then(function (user) {
            switch (params.param.toLowerCase()) {
                case 'username':
                    return updateUsername(user._id, params.value)
                        .then(function (user) {
                            return "User '" + params.username + "' updated to '" + params.value + "'";
                        });
                case 'password':
                    return setUserPassword(user._id, params.value)
                        .then(function (updatedUser) {
                            return "User '" + params.username + "' password updated.";
                        });

                default:
                    return "Unknown param: " + params.param;
            }
        })
        .catch(function (err) {
            return "Error updating user: " + params.username;
        });
});

cmdRouter.on("/deluser username", function (params, player) {
    return getUserByName(params.username)
        .then(function (user) {
            return _deluser(user._id)
                .then(function (user) {
                    return "User '" + params.username + "' deleted successfully";
                });
        })
        .catch(function (err) {
            return "Error deleting user: " + err.message;
        });
});

cmdRouter.on("/addroom name", function (params, player) {
    return roomCreate(params.name)
        .then(function (room) {
            return "Room '" + params.name + "' created successfully";
        }).catch(function (err) {
            return "Error adding room: " + err.message;
        });
});

cmdRouter.on("/modroom name param value", function (params, player) {
    return getRoomByName(params.name)
        .then(function (room) {
            switch (params.param.toLowerCase()) {
                case 'name':
                    room.name = params.value;
                    break;
                case 'shortdesc':
                    room.shortDesc = params.value;
                    break;
                case 'longdesc':
                    room.longDesc = params.value;
                    break;
                case 'prefix':
                    room.prefix = params.value;
                    break;
                case 'prefixin':
                    room.prefixIn = params.value;
                    break;
                default:
                    return "Unknown param: " + params.param;
            }

            return updateRoom(room)
                .then(function (room) {
                    return "Room '" + params.name + "' updated successfully.";
                });
        })
        .catch(function (err) {
            return "Error updating room: " + params.name;
        });
});

cmdRouter.on("/delroom name", function (params, player) {
    return getRoomByName(params.name)
        .then(function (room) {
            return roomDelete(room._id)
                .then(function () {
                    return "Room '" + params.name + "' deleted successfully.";
                });
        })
        .catch(function (err) {
            return "Error deleting room: " + err.message;
        });
});

cmdRouter.on("/joinrooms room1 room2", function (params, player) {
    return Promise.all([getRoomByName(params.room1), getRoomByName(params.room2)])
        .then(function (values) {
            if (!values || values.length !== 2) {
                throw new Error("Couldn't find room");
            }

            return joinRooms(values[0]._id, values[1]._id);
        })
        .then(function (roomExit) {
            return "Rooms joined successfully.";
        })
        .catch(function (err) {
            return "Error joining rooms: " + err.message;
        });
});

cmdRouter.on("/splitrooms room1 room2", function (params, player) {
    return Promise.all([getRoomByName(params.room1), getRoomByName(params.room2)])
        .then(function (values) {
            if (!values || values.length !== 2) {
                throw new Error("Couldn't find room");
            }

            return splitRooms(values[0]._id, values[1]._id);
        })
        .then(function (roomExit) {
            return "Rooms were split successfully.";
        })
        .catch(function (err) {
            return "Error splitting rooms: " + err.message;
        });
});

cmdRouter.on("/additem name", function (params, player) {
    return itemCreate(params.name, player._id)
        .then(function (item) {
            return "Item '" + params.name + "' created successfully";
        }).catch(function (err) {
            return "Error adding item: " + err.message;
        });
});

cmdRouter.on("/moditem itemid param value", function (params, player) {
    return getItemById(params.itemid)
        .then(function (item) {
            switch (params.param.toLowerCase()) {
                case 'name':
                    item.name = params.value;
                    break;
                case 'shortdesc':
                    item.shortDesc = params.value;
                    break;
                case 'longdesc':
                    item.longDesc = params.value;
                    break;
                case 'prefix':
                    item.prefix = params.value;
                    break;
                case 'weight':
                    item.weight = parseFloat(params.value);
                    break;
                case 'health':
                    item.health = parseFloat(params.value);
                    break;
                case 'maxhealth':
                    item.maxHealth = parseFloat(params.value);
                    break;
                case 'hpModifier':
                    item.hpModifier = parseFloat(params.value);
                    break;
                default:
                    return "Unknown param: " + params.param;
            }

            return updateItem(item)
                .then(function (item) {
                    return "Item '" + item.name + " (" + params.itemid + ")' updated successfully.";
                });
        })
        .catch(function (err) {
            return "Error updating item: " + params.name;
        });
});

cmdRouter.on("/delitem itemid", function (params, player) {
    return getItemById(params.itemid)
        .then(function (item) {
            return itemDelete(item._id)
                .then(function () {
                    return "Item '" + item.name + " (" + params.itemid + ")' deleted successfully.";
                });
        })
        .catch(function (err) {
            return "Error deleting item: " + err.message;
        });
});

cmdRouter.on("/list thing*", function (params, player) {
    switch (params.thing.toLowerCase()) {
        case "rooms":
            return roomList().then(function (rooms) {
                if (!rooms || rooms.length === 0) {
                    return "There are no rooms";
                }

                var message = '';
                for (let r of rooms) {
                    message += r.name + "\n";
                }

                return message;
            });
        case "users":
            return getAllUsers().then(function (users) {
                if (!users || users.length === 0) {
                    return "There are no users";
                }

                var message = '';
                for (let u of users) {
                    message += u.username + "\n";
                }

                return message;
            });
        case "items":
            return getItemsInRoom(player.room).then(function (items) {
                if (!items || items.length === 0) {
                    return "There are no items in this room";
                }

                var message = '';
                for (let i of items) {
                    message += [i._id, i.name].join("  ") + "\n";
                }

                return message;
            });
        case "my items":
            return getItemsForPlayer(player._id).then(function (items) {
                if (!items || items.length === 0) {
                    return "You have no items";
                }

                var message = '';
                for (let i of items) {
                    message += [i._id, i.name].join("  ") + "\n";
                }

                return message;
            });
        default:
            return "Unknown parameter: " + params.thing;
    }
});

cmdRouter.on("/info thing name", function (params, player) {
    switch (params.thing.toLowerCase()) {
        case "room":
            let thisRoom;
            return getRoomByName(params.name)
                .then(function (room) {
                    if (!room) {
                        throw new Error("No such room");
                    }

                    thisRoom = room;
                    return getAllExitsForRoom(room._id);
                })
                .then(function (roomExits) {
                    var msg = "Room '" + thisRoom.name + "'\n";
                    msg += "Short Desc: " + thisRoom.shortDesc + "\n";
                    msg += "Long Desc: " + thisRoom.longDesc + "\n";

                    let joinedRooms = [];
                    if (roomExits) {
                        for (var r of roomExits) {
                            joinedRooms.push(getOtherRoom(_id, r.rooms).name);
                        }
                    }
                    msg += "Joining rooms: [" + joinedRooms.join(', ') + "]\n";
                    return msg;
                })
                .catch(function (err) {
                    return "Couldn't find room '" + params.name + "': " + err.message;
                });
        case "user":
            return getUserByName(params.name)
                .then(function (user) {
                    return getPlayerByUserId(user._id);
                })
                .then(function (_player) {
                    var msg = "Player '" + _player.name + "'\n";
                    msg += "Room: " + _player.room.name + "\n";
                    msg += "Health: " + _player.health + "\n";
                    return msg;
                })
                .catch(function (err) {
                    return "Couldn't find player '" + params.name + "': " + err.message;
                });
        case "item":
            return getItemById(params.name)
                .then(function (item) {
                    var msg = "Item '" + item.name + " (" + item._id + ")'\n";
                    msg += "Prefix: " + item.prefix + "\n";
                    msg += "Short Desc: " + item.shortDesc + "\n";
                    msg += "Long Desc: " + item.longDesc + "\n";
                    return msg;
                })
                .catch(function (err) {
                    return "Couldn't find item '" + params.name + "': " + err.message;
                });
        default:
            return "Unknown parameter: " + params.thing;
    }
});

cmdRouter.on("/addattr itemid attr", function (params, player) {
    if (!Attributes.hasOwnProperty(params.attr)) {
        return "No such attribute: " + params.attr;
    }

    return getItemById(params.itemid)
        .then(function (item) {
            return addItemAttribute(item, params.attr);
        })
        .then(function (item) {
            return "Attribute '" + params.attr + "' added to item '" + item.name + "'";
        })
        .catch(function (err) {
            return "Error adding attribute to item";
        });
});

cmdRouter.on("/delattr itemid attr", function (params, player) {
    if (!Attributes.hasOwnProperty(params.attr)) {
        return "No such attribute: " + params.attr;
    }

    return getItemById(params.itemid)
        .then(function (item) {
            return delItemAttribute(item, params.attr);
        })
        .then(function (item) {
            return "Attribute '" + params.attr + "' removed from item '" + item.name + "'";
        })
        .catch(function (err) {
            return "Error deleting attribute from item";
        });
})
