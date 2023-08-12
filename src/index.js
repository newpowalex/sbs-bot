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
let players = [];

client.on('messageCreate', async (message) => {

    // Ignore messages from bots and non-text channels
    console.log('message: ' + message.content)
    if (message.author.bot || !message.content.startsWith('!')) {
        return;
    }

    // Parse command and arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle commands
    if (command == 'sbs') {
        if (gameStarted) {
            await message.reply('A game is already in progress.');
        } else {
            gameStarted = true;
            players.player1 = message.author; // Set the player who used the command as Player 1
            await message.reply('You are Player 1! Who is Player 2? Mention them with @');        }
    } else if (gameStarted && !players.player2 && message.mentions.users.size == 1) {
        players.player2 = message.mentions.users.first(); // Set the mentioned user as Player 2
        await message.reply(`Both players selected: ${players.player1.tag} and ${players.player2.tag}.`);
        await players.player1.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
        await players.player2.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
    }
});

client.login(process.env.TOKEN);