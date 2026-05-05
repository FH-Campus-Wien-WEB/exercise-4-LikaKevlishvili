const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');
const users = {};

if (process.env.USER_1_USERNAME && process.env.USER_1_PASSWORD_HASH) {
    users[process.env.USER_1_USERNAME] = {
        username: process.env.USER_1_USERNAME,
        firstName: process.env.USER_1_FIRSTNAME || "",
        lastName: process.env.USER_1_LASTNAME || "",
        password: process.env.USER_1_PASSWORD_HASH
    };
}

module.exports = users;

