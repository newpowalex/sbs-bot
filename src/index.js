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

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    const args = message.content.trim(1).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command == 'sbs') {
        if (gameStarted) {
            await message.reply('A game is already in progress.');
        } else {
            gameStarted = true;
            players.player1 = message.author; // Set the player who used the command as Player 1
            await message.reply('You are Player 1! Mention Player 2 with @');
        }
    } else if (gameStarted && !players.player2 && message.mentions.users.size == 1) {
        const mentionedUser = message.mentions.users.first();

        // Check if the mentioned user is not Player 1
        if (mentionedUser.id == players.player1.id) {
            players.player2 = mentionedUser; // Set the mentioned user as Player 2
            await message.reply(`Both players selected: ${players.player1.tag} and ${players.player2.tag}.`);
            await players.player1.send('Welcome to the Squad Builder Showdown game! Please provide your first guess.');
            await players.player2.send('Welcome to the Squad Builder Showdown game! Please provide your first guess.');
        }
    }
});

client.login(process.env.TOKEN);