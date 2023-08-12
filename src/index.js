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
    if (command === 'sbs') {
        gameStarted = true;
        await message.reply('The game has started! Who is Player 1? Mention them with @');
    } else if (gameStarted && players.length === 0 && message.mentions.users.size === 1) {
        players.push(message.mentions.users.first());
        await message.reply('Player 1 selected! Who is Player 2? Mention them with @');
    } else if (gameStarted && players.length === 1 && message.mentions.users.size === 1) {
        players.push(message.mentions.users.first());
        await message.reply(`Both players selected: ${players[0].tag} and ${players[1].tag}.`);
        await players[0].send('Welcome to the Squad Builder Showdown game! Please provide your first guess.');
        await players[1].send('Welcome to the Squad Builder Showdown game! Please provide your first guess.');
    }
});

client.login(process.env.TOKEN);