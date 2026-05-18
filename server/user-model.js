const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');

/**
 * Loads all users from users.json.
 * In exercise 4, the user model provides read-only access to user credentials.
 *
 * @returns {object} all users indexed by username
 */
function loadUsers() {
    if (!fs.existsSync(usersFile)) {
        return {};
    }

    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
}

/**
 * Returns one user by username.
 *
 * @param {string} username - The username from the login form.
 * @returns {object|undefined} the matching user or undefined if no user exists
 */
function getUserByUsername(username) {
    const users = loadUsers();
    return users[username];
}

module.exports = {
    getUserByUsername
};