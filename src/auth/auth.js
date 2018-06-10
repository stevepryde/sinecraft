const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    _createuser,
    getUserById,
    getUserAuthStuff,
    updateUserTokens
} = require("../data/users");

const secret = "7d66adb9059ff4b42fd279167acd6ce9f9ae5779";

class AuthError extends Error { }

function isAuthenticated(req, res, next) {
    if (req.headers.hasOwnProperty("x-sinecraft-auth-token")) {
        // Verify JWT
        const token = req.headers["x-sinecraft-auth-token"];
        let decodedId;
        try {
            let decoded = jwt.verify(token, secret);
            decodedId = decoded.id;
        }
        catch (err) {
            throw new AuthError("ERROR_INVALID_CREDENTIALS");
        }

        getUserById(decodedId)
            .then(function (user) {
                if (user.authToken !== token) {
                    throw new AuthError("ERROR_INVALID_TOKEN");
                }

                req.user = user;
                next();
            })
            .catch(function (err) {
                res.status(401);
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
    let token = jwt.sign(payload, secret, {
        expiresIn: "2h"
    });

    let refreshPayload = { token: token };
    let refreshToken = jwt.sign(refreshPayload, secret, {
        expiresIn: "7d"
    });

    // Update DB.
    return updateUserTokens(id, token, refreshToken)
        .then(function (rec) {
            return { token, refreshToken };
        });
}

// Initial authentication for a user.
function authUser(username, password) {
    return getUserAuthStuff(username)
        .then(function (data) {
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


function refreshAuth(token, refreshToken) {
    return new Promise(function (resolve, reject) {
        // Validate the refreshToken.
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, secret);

            if (decoded.token !== token) {
                reject(new AuthError("ERROR_INVALID_TOKEN"));
            }
        }
        catch (err) {
            reject(new AuthError("ERROR_INVALID_TOKEN"));
        }

        // Get user ID from the original token.
        let decodedId;
        try {
            let decodedToken = jwt.verify(token, secret, { ignoreExpiration: true });
            decodedId = decodedToken.id;
        }
        catch (err) {
            reject(new AuthError("ERROR_INVALID_TOKEN"));
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

function createUser(details) {
    return new Promise(function (resolve, reject) {
        const username = details.username;
        const password = details.password;

        if (!validatePassword(password)) {
            reject(new AuthError("ERROR_INVALID_PASSWORD"));
        }

        let salt = crypto.randomBytes(128);
        let derivedKey;
        try {
            derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        } catch (err) {
            throw new AuthError("ERROR_INVALID_CREDENTIALS");
        }

        let p = _createuser({
            username: username,
            displayName: details.displayName || username,
            pwhash: derivedKey.toString('hex'),
            salt: salt.toString('hex')
        }).then(function (user) {
            return authUser(username, password);
        });

        resolve(p);
    });
}

module.exports = {
    AuthError,
    authUser,
    createUser,
    isAuthenticated,
    logoutUser,
    refreshAuth
};
