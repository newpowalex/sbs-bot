require('dotenv').config();
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

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
        const embed = new MessageEmbed()
            .setTitle('Squad Builder Showdown')
            .setDescription('Welcome to the game! React with ✅ to start.')
            .setColor('#0099ff');

        const sentMessage = await message.channel.send({ embeds: [embed] });
        sentMessage.react('✅');
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '✅' && user.bot === false && players.player1 === user) {
        // Handle the game logic here based on the reaction
        // Update the embedded message as needed
        // Implement the game flow using reactions

        // After handling, send DM to Player 2
        if (!players.player2) {
            players.player2 = user;
            await user.send('You are Player 2! Please provide your guess for the current round through DM.');
        }
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
