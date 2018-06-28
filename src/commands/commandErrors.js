/* Exception classes */

class CommandError extends Error { };

class UsageError extends CommandError { };

module.exports = {
    CommandError,
    UsageError
};
