// db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

async function init() {
    db = await open({
        filename: './sbsbot.db',
        driver: sqlite3.Database,
    });

    // Define your database schema and tables here if needed
}

async function close() {
    if (db) {
        await db.close();
    }
}

// Export the database-related functions
module.exports = { init, close };
