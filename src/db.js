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
            // Create tables
            createUsersTable();
            createGamesTable();
            createGuessesTable();
        }
    });
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

// Create the USERS table if it doesn't exist
function createUsersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS USERS (
            id INTEGER PRIMARY KEY,
            discord_id TEXT,
            username TEXT
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('USERS table created or already exists.');
        }
    });
}

// Create the GAMES table if it doesn't exist
function createGamesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS GAMES (
            id INTEGER PRIMARY KEY,
            player1_id INTEGER,
            player2_id INTEGER,
            FOREIGN KEY(player1_id) REFERENCES USERS(id),
            FOREIGN KEY(player2_id) REFERENCES USERS(id)
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('GAMES table created or already exists.');
        }
    });
}

// Create the GUESSES table if it doesn't exist
function createGuessesTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS GUESSES (
            id INTEGER PRIMARY KEY,
            game_id INTEGER,
            player_id INTEGER,
            round_name TEXT,
            guess_text TEXT,
            FOREIGN KEY(game_id) REFERENCES GAMES(id),
            FOREIGN KEY(player_id) REFERENCES USERS(id)
        )
    `;
    db.run(query, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('GUESSES table created or already exists.');
        }
    });
}

// Add a new user to the USERS table
function addUser(discordId, username) {
    const query = 'INSERT INTO USERS (discord_id, username) VALUES (?, ?)';
    db.run(query, [discordId, username], (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`New user added: Discord ID ${discordId}, Username ${username}`);
        }
    });
}

// Add a new game to the GAMES table
function addGame(player1Id, player2Id) {
    const query = 'INSERT INTO GAMES (player1_id, player2_id) VALUES (?, ?)';
    db.run(query, [player1Id, player2Id], (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`New game added: Player 1 ID ${player1Id}, Player 2 ID ${player2Id}`);
        }
    });
}

// Add a guess to the GUESSES table
function addGuess(gameId, playerId, roundName, guessText) {
    const query = 'INSERT INTO GUESSES (game_id, player_id, round_name, guess_text) VALUES (?, ?, ?, ?)';
    db.run(query, [gameId, playerId, roundName, guessText], (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`New guess added: Game ID ${gameId}, Player ID ${playerId}, Round Name ${roundName}, Guess Text ${guessText}`);
        }
    });
}

// Export the database-related functions
module.exports = { init, close, addGame, addGuess, addUser };
