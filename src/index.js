require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

client.once('ready', (c) => {
    console.log(`✔️  Logged in as ${client.user.tag}`);
});

let gameStarted = false;
let players = {
    player1: null,
    player2: null
};

let guesses = {
    player1: {
        formation: null,
        attackers: null,
        midfielders: null,
        outsideBacks: null,
        centreBacksGk: null
    },
    player2: {
        formation: null,
        attackers: null,
        midfielders: null,
        outsideBacks: null,
        centreBacksGk: null
    }
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    // Handle message for bot read
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command == 'sbs') {
        if (gameStarted) {
            await message.reply('A game is already in progress.');
        } else {
            gameStarted = true;
            players.player1 = message.author; // Set the player who used the command as Player 1
            await message.reply('You are Player 1! Mention Player 2 with @');
        }
    } else if (gameStarted && !players.player2 && message.mentions.users.size === 1) {
        const mentionedUser = message.mentions.users.first();

        // Check if the mentioned user is not Player 1
        if (mentionedUser.id == players.player1.id) {
            players.player2 = mentionedUser; // Set the mentioned user as Player 2
            await message.reply(`Both players selected: ${players.player1.tag} and ${players.player2.tag}.`);
            await players.player1.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
            await players.player2.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
        }
    // Save formation guess for both players
    } else if (gameStarted && players.player1 && players.player2 &&
        message.author.id === players.player1.id && !guesses.player1.formation) {
        guesses.player1.formation = message.content;
        await message.reply('Formation guess saved for Player 1.');
    } else if (gameStarted && players.player1 && players.player2 &&
        message.author.id === players.player2.id && !guesses.player2.formation) {
        guesses.player2.formation = message.content;
        await message.reply('Formation guess saved for Player 2.');
    }

    if (formationGuesses.player1 && formationGuesses.player2) {
        // Both players have guessed, send a message
        await message.reply('Both players have guessed. Use commands `!reveal p1` and `!reveal p2` to see their guesses.');
    }
});

client.login(process.env.TOKEN);