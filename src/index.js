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

let players = {
    player1: {
        locked: undefined,
        revealed: undefined,
        formation: [],
        attackers: [],
        midfielders: [],
        outsidebacks: [],
        centrebacksgk: []
    },
    player2: {
        locked: undefined,
        revealed: undefined,
        formation: [],
        attackers: [],
        midfielders: [],
        outsidebacks: [],
        centrebacksgk: []
    }
};
let currentRound = 'formation';

async function startRound(players) {
    // Send DMs to both players with welcome message and current round info
    for (const player of Object.values(players)) {
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Welcome to round ${currentRound}, ${player.tag}! Please provide your guess.`)
            .setColor('#0099ff');

        const dmChannel = await player.createDM();
        await dmChannel.send({ embeds: [embed] });
    }
}

client.on('messageCreate', async (message) => {
    if (message.content === '!sbs') {
        // Check if the game is already in progress
        if (players.player1.tag || players.player2.tag) {
            await message.reply('A game is already in progress.');
            return;
        }

        // Set the first player as Player 1
        players.player1 = message.author;
        console.log(players.player1.tag)
        console.log(players.player2.tag)


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
    if (reaction.emoji.name === '✅' && user.bot === false && players.player1 !== user && !players.player2.tag) {
        // Set the first person who reacts as Player 2
        players.player2 = user;
        console.log(players.player2.tag)

        // Remove reactions from the message
        reaction.message.reactions.removeAll();

        // Edit the embedded message to display the selected players
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Player 1: ${players.player1.tag}\n Player 2: ${players.player2.tag}\n\n DM Showdown with your guesses!`)
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });
        

        // Start the first round by sending DMs to players
        startRound(players);
        await reaction.message.react('🔒');
    }

    if (reaction.emoji.name === '🔒' && user.bot === false && (players.player1 === user || players.player2 === user)) {
        console.log(`Someone locked: ${user.tag}  | Locked?: ${user.locked}`)
        if (typeof user.locked === 'undefined') {
            user.locked = true;
            console.log(user.tag, 'locked')
        }

        if (players.player1.locked === true && players.player2.locked === true) {
            // Remove reactions from the message
            reaction.message.reactions.removeAll();

            const embed1 = new EmbedBuilder()
                .setTitle('Squad Builder Showdown')
                .setDescription(`Both players locked in!\n\n React with 1️⃣ to reveal ${players.player1.tag}\n\n React with 2️⃣ to reveal ${players.player2.tag}`)
                .setColor('#0099ff');

            reaction.message.edit({ embeds: [embed1] });
            await reaction.message.react('1️⃣');
            await reaction.message.react('2️⃣');
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.channel.type === 'DM' && (message.author === players.player1 || message.author === players.player2)) {
        // Handle guesses and game logic for DM messages here
        const content = message.content;

        // You can also send a reply to the player through DMs
        // await message.author.send('Your guess has been received.');

        // Example: Log the guesses for demonstration
        console.log(`${message.author.tag} guessed: ${message.content}`);
    }
});

client.login(process.env.TOKEN);
