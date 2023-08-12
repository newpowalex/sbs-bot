require('dotenv').config();
const { Client, IntentsBitField} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

client.once('ready', (c) => {
    console.log(`✔️  Logged in as ${client.user.tag}`);
});

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
    if (command == 'start') {
        // TODO: Implement Squad Builder Showdown challenge initiation
    } else if (command == 'guess') {
        // TODO: Implement player guesses
    } else if (command == 'reveal') {
        // TODO: Implement revealing player selections
    } else if (command == 'stats') {
        // TODO: Implement displaying player statistics
    }
});

client.login(process.env.TOKEN);
