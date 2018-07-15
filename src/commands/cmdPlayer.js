const { cmdRouter } = require("./commandRouter");

const {
    getAllExitsForRoom,
    getOtherRoom,
    getRoomName
} = require("../data/room");
const {
    updatePlayerRoom
} = require("../data/player");

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
