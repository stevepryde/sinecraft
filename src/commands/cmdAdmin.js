/* Admin command handler */

const { cmdRouter } = require("./commandRouter");
const { createUser } = require("../auth/auth");
const {
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
        .then(function (user) {
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

cmdRouter.on("/list thing", function (params, player) {
    switch (params.thing.toLowerCase()) {
        case "rooms":
            return roomList().then(function (rooms) {
                if (!rooms) {
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
                if (!users) {
                    return "There are no users";
                }

                var message = '';
                for (let u of users) {
                    message += u.username + "\n";
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
        default:
            return "Unknown parameter: " + params.thing;
    }
});
