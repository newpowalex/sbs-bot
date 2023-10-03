// db.js
const sqlite3 = require('sqlite3');

let db;

async function init() {
    // Check if there's an existing database connection
    if (db) {
        console.log('Closing the existing database connection.');
        await close(); // Close the existing connection
    }

    db = new sqlite3.Database('./sbsbot.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the database.');
        }
    });

    // Define your database schema and tables here if needed
}

async function close() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log('Closed the database connection.');
                    resolve();
                }
            });
        } else {
            resolve(); // Resolve immediately if there's no open connection
        }
    });
}

// Export the database-related functions
module.exports = { init, close };
