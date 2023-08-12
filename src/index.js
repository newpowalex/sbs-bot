const { Client, IntentsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMessages
    ],
});

client.once('ready', () => {
    console.log(`✔️  Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    // Ignore messages from bots and non-text channels
    if (message.author.bot || !message.content.startsWith('!')) {
        return;
    }

    // Parse command and arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(command)

    // Handle commands
    if (command == 'start') {
        // TODO: Implement Squad Builder Showdown challenge initiation
        console.log('Started');
    } else if (command == 'guess') {
        // TODO: Implement player guesses
    } else if (command == 'reveal') {
        // TODO: Implement revealing player selections
    } else if (command == 'stats') {
        // TODO: Implement displaying player statistics
    }
});

client.login(process.env.TOKEN);
