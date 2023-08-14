require('dotenv').config();
const { Client, IntentsBitField, MessageEmbed, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions
    ]
});

const players = {};

client.on('messageCreate', async (message) => {
    if (message.content === '!sbs') {
        // Check if the game is already in progress
        if (players.player1 || players.player2) {
            await message.reply('A game is already in progress.');
            return;
        }

        // Set the first player as Player 1
        players.player1 = message.author;

        // Send an embedded message in the chat
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription('The game is ready! React with ✅ to become Player 2.')
            .setColor('#0099ff');

        const sentMessage = await message.channel.send({ embeds: [embed] });
        sentMessage.react('✅');
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '✅' && user.bot === false && players.player1 !== user && !players.player2) {
        // Set the first person who reacts as Player 2
        players.player2 = user;

        // Remove reactions from the message
        reaction.message.reactions.removeAll();

        // Edit the embedded message to display the selected players
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Player 1: ${players.player1.tag}\n Player 2: ${players.player2.tag}`)
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });
    }
});

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'DM' && (message.author === players.player1 || message.author === players.player2)) {
        // Handle guesses and game logic for DM messages here
        // Use the message.content from DMs to process guesses

        // You can also send a reply to the player through DMs
        // await message.author.send('Your guess has been received.');

        // Example: Log the guesses for demonstration
        console.log(`${message.author.tag} guessed: ${message.content}`);
    }
});

client.login(process.env.TOKEN);
