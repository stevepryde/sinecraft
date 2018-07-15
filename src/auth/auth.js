const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    _createuser,
    _updatepw,
    getUserById,
    getUserAuthStuff,
    updateUserTokens,
} = require("../data/users");
const {
    _createplayer,
    getPlayerByUserId
} = require("../data/player");

const secret = process.env.SINECRAFT_SECRET || "7d66adb9059ff4b42fd279167acd6ce9f9ae5779";

class AuthError extends Error { }
class TokenInvalidError extends AuthError { }

function isAuthenticated(req, res, next) {
    if (req.headers.hasOwnProperty("x-sinecraft-auth-token")) {
        // Verify JWT
        const authToken = req.headers["x-sinecraft-auth-token"];
        let decodedId;
        try {
            let decoded = jwt.verify(authToken, secret);
            decodedId = decoded.id;
        }
        catch (err) {
            res.status(498);
            res.json({ code: 'ERROR_INVALID_TOKEN' });
            return;
        }

        getUserById(decodedId)
            .then(function (user) {
                if (!user || user.authToken !== authToken) {
                    throw new TokenInvalidError("ERROR_INVALID_TOKEN");
                }

                req.user = user;

                return getPlayerByUserId(decodedId);
            })
            .then(function (player) {
                if (!player) {
                    return _createplayer(decodedId, req.user.username);
                }
                return player;
            })
            .then(function (player) {
                req.player = player;
                next();
            })
            .catch(function (err) {
                console.log(err);
                res.status(498);
                res.json({ code: 'ERROR_INVALID_TOKEN' });
                return;
            });
        return;
    }

    // Not logged in - make them re-auth!
    res.status(403);
    res.json({ code: 'ERROR_AUTH_REQUIRED' });
}


function updateTokens(id) {
    // Create new JWT.
    let payload = { id: id };
    let authToken = jwt.sign(payload, secret, {
        expiresIn: "2h"
    });

    let refreshPayload = { token: authToken };
    let refreshToken = jwt.sign(refreshPayload, secret, {
        expiresIn: "7d"
    });

    // Update DB.
    return updateUserTokens(id, authToken, refreshToken)
        .then(function (rec) {
            return { authToken, refreshToken };
        });
}

// Initial authentication for a user.
function authUser(username, password) {
    return getUserAuthStuff(username)
        .then(function (data) {
            if (!data) {
                throw new AuthError("ERROR_INVALID_CREDENTIALS");
            }

            var { _id, pwhash, salt } = data;
            let derivedKey;
            try {
                derivedKey = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
            } catch (err) {
                throw new AuthError("ERROR_INVALID_CREDENTIALS");
            }

            if (derivedKey.toString('hex') !== pwhash) {
                throw new AuthError("ERROR_INVALID_CREDENTIALS");
            }

            return updateTokens(_id);
        });
}

function logoutUser(_id) {
    return updateUserTokens(_id, "", "");
}


function refreshAuth(authToken, refreshToken) {
    return new Promise(function (resolve, reject) {
        // Validate the refreshToken.
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, secret);

            if (decoded.token !== authToken) {
                reject(new TokenInvalidError("ERROR_INVALID_TOKEN"));
            }
        }
        catch (err) {
            reject(new TokenInvalidError("ERROR_INVALID_TOKEN"));
        }

        // Get user ID from the original token.
        let decodedId;
        try {
            let decodedToken = jwt.verify(authToken, secret, { ignoreExpiration: true });
            decodedId = decodedToken.id;
        }
        catch (err) {
            reject(new TokenInvalidError("ERROR_INVALID_TOKEN"));
        }

        // Update both user tokens.
        resolve(updateTokens(decodedId));
    });
}

function validatePassword(pw) {
    if (pw.length < 8) {
        return false;
    }

    return true;
}

function getNewPasswordHash(password) {
    let salt = crypto.randomBytes(128);
    let derivedKey;
    try {
        derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    } catch (err) {
        throw new AuthError("ERROR_INVALID_CREDENTIALS");
    }

    return {
        pwhash: derivedKey.toString('hex'),
        salt: salt.toString('hex')
    };
}

function createUser(details) {
    return new Promise(function (resolve, reject) {
        const username = details.username;
        const password = details.password;

        if (!validatePassword(password)) {
            reject(new AuthError("ERROR_INVALID_PASSWORD"));
            return;
        }

        let { pwhash, salt } = getNewPasswordHash(password);

        let p = _createuser({
            username: username,
            pwhash: pwhash,
            salt: salt
        }).then(function (user) {
            return authUser(username, password);
        });

        resolve(p);
    });
}

function createAdminUser(details) {
    return new Promise(function (resolve, reject) {
        const username = details.username;
        const password = details.password;

        if (!validatePassword(password)) {
            reject(new AuthError("ERROR_INVALID_PASSWORD"));
            return;
        }

        let { pwhash, salt } = getNewPasswordHash(password);

        let p = _createuser({
            username: username,
            pwhash: pwhash,
            salt: salt,
            isAdmin: true
        }).then(function (user) {
            return authUser(username, password);
        });

        resolve(p);
    });
}


function updatepw(username, password, newPassword) {
    return getUserAuthStuff(username)
        .then(function (data) {
            const { _id, pwhash, salt } = data;
            let derivedKey;
            try {
                derivedKey = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512');
            } catch (err) {
                throw new AuthError("ERROR_INVALID_CREDENTIALS");
            }

            if (derivedKey.toString('hex') !== pwhash) {
                throw new AuthError("ERROR_INVALID_CREDENTIALS");
            }

            const newpw = getNewPasswordHash(newPassword);
            return _updatepw(_id, newpw.pwhash, newpw.salt);
        })
        .then(function (updatedUser) {
            return updateTokens(updatedUser._id);
        })
        .catch(function (err) {
            console.log(err);
            throw new AuthError("ERROR_INVALID_CREDENTIALS");
        });
}

module.exports = {
    AuthError,
    authUser,
    createAdminUser,
    createUser,
    isAuthenticated,
    logoutUser,
    refreshAuth,
    TokenInvalidError,
    updatepw
};
