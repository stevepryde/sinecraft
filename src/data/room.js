const {
    db
} = require("./db");


const roomSchema = new db.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    shortDesc: {
        type: String,
        default: ''
    },
    longDesc: {
        type: String,
        default: ''
    },
    prefix: {
        type: String,
        default: "the"
    },
    prefixIn: {
        type: String,
        default: "in"
    }
});

const Room = db.model('Room', roomSchema);

const exitSchema = new db.Schema({
    rooms: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Room',
        index: true,
        required: true
    }], // Array of room ids. Must be 2 only.
    door: {
        type: Boolean, // True if there's a door, otherwise False.
        default: false
    },
    attributes: [String], // canLock ?
    attributeStatus: Object, // Object mapping attributes to state strings.
    metadata: Object // Object containing metadata.
});

const RoomExit = db.model('Exit', exitSchema);

function roomCreate(name) {
    let room = {
        name: name
    };
    return new Room(room).save();
}

function roomDelete(_id) {
    const roomId = _id;
    // First delete any exits to this room.
    return RoomExit.deleteMany({ rooms: roomId }).exec()
        .then(function () {
            // Now delete the room itself.
            return Room.findByIdAndRemove(roomId).exec();
        });
}

function roomList() {
    return Room.find().exec();
}

function getRoomById(_id) {
    return Room.findById(_id).exec();
}

function getRoomByName(name) {
    return Room.findOne({ name: name }).exec();
}

function getDefaultRoom() {
    return getRoomByName("lobby");
}

function updateRoom(room) {
    return Room.findByIdAndUpdate(room._id, room).exec();
}

function getAllExitsForRoom(_id) {
    return RoomExit.find({ rooms: _id }).populate('rooms').exec();
}

function getOtherRoom(_id, rooms) {
    if (rooms[0]._id.toString() !== _id.toString()) {
        return rooms[0];
    }

    return rooms[1];
}

function getRoomName(room) {
    return [room.prefix, room.name].join(" ");
}

function getJoiningRoomNames(_id) {
    return getAllExitsForRoom(_id)
        .then(function (roomExits) {
            let joinedRooms = [];
            if (roomExits) {
                for (var r of roomExits) {
                    joinedRooms.push(getOtherRoom(_id, r.rooms).name);
                }
            }

            return joinedRooms;
        });
}

function getRoomExit(id1, id2) {
    return RoomExit.findOne({
        rooms: { $all: [id1, id2] }
    }).exec();
}

function joinRooms(id1, id2) {
    // Check if they're already joined.
    return getRoomExit(id1, id2)
        .then(function (existingExit) {
            if (existingExit) {
                return existingExit;
            }

            let roomExit = {
                rooms: [id1, id2],
                door: false,
                attributes: [],
                attributeStatus: {},
                metadata: {}
            }
            return new RoomExit(roomExit).save();
        });
}

function splitRooms(id1, id2) {
    return getRoomExit(id1, id2)
        .then(function (roomExit) {
            return RoomExit.findByIdAndRemove(roomExit._id).exec();
        });
}

module.exports = {
    getAllExitsForRoom,
    getDefaultRoom,
    getJoiningRoomNames,
    getOtherRoom,
    getRoomById,
    getRoomByName,
    getRoomExit,
    getRoomName,
    joinRooms,
    Room,
    roomCreate,
    roomDelete,
    roomList,
    splitRooms,
    updateRoom
};
