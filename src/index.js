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
        user: undefined,
        locked: false,
        temp: [],
        formation: [],
        attackers: [],
        midfielders: [],
        outsidebacks: [],
        centrebacksgk: []
    },
    player2: {
        user: undefined,
        locked: false,
        temp: [],
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
            .setDescription(`Welcome to round ${currentRound}, ${player.user.tag}! Please provide your guess.`)
            .setColor('#0099ff');

        const dmChannel = await player.user.createDM();
        await dmChannel.send({ embeds: [embed] });
    }
}

function determinePlayer(players, user) {
    const isPlayer1 = (user.id === players.player1.user.id);
    const isPlayer2 = (user.id === players.player2.user.id);

    if (isPlayer1 === true) {
        return players.player1;

    } else if (isPlayer2 === true) {
        return players.player2;

    } else {
        console.log('Error: Not P1 or P2');
        return 'error';
    }
}

client.on('messageCreate', async (message) => {
    if (message.content === '!sbs') {
        // Check if the game is already in progress
        if (players.player1.user || players.player2.user) {
            await message.reply('A game is already in progress.');
            return;
        }

        // Set the first player as Player 1
        players.player1.user = message.author;
        console.log(`Player tag and id: ${players.player1.user.tag}, ${players.player1.user.id}`)

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
    if (reaction.emoji.name === '✅' && user.bot === false && players.player1.user !== user && !players.player2.user) {
        // Set the first person who reacts as Player 2
        players.player2.user = user;
        console.log(`Player tag and id: ${players.player2.user.tag}, ${players.player2.user.id}`)

        // Remove reactions from the message
        reaction.message.reactions.removeAll();

        // Edit the embedded message to display the selected players
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Player 1: ${players.player1.user.tag}\n Player 2: ${players.player2.tag}\n\n DM Showdown with your guesses!`)
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });


        // Start the first round by sending DMs to players
        startRound(players);
        await reaction.message.react('🔒');
    }

    if (reaction.emoji.name === '🔒' && user.bot === false && (players.player1.user === user || players.player2.user === user)) {
        const player = determinePlayer(players, user);
        // console.log(`Determined player: ${player.user}`);
        console.log('Someone reacted with a lock');
        console.log(`${player.user.tag}, Locked? = ${player.locked} `);

        if (player.locked === false) {
            player.locked = true;
            console.log(`Locking in: ${player.user.tag}, Locked? = ${player.locked} `);
            player[currentRound] = player.temp;
            player.user.send(`Guess of ${player[currentRound]} for ${currentRound} saved.`);
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
    if (!message.guild && (message.author === players.player1.user || message.author === players.player2.user)) {
        const content = message.content;
        // console.log(`Content: ${message.content}`);

        const player = determinePlayer(players, message.author);
        // console.log(`Determined player: ${player.user}`);

        // Check if it's the formation round
        if (currentRound === 'formation') {
            // Formation round: Check if the content is valid (numbers separated by '-')
            const isValidFormation = /^[0-9]+(-[0-9]+| [0-9]+)*$/.test(content);
            if (!isValidFormation) {
                player.user.send('Invalid guess format. Please provide numbers separated by "-".');
                return;
            }
        } else {
            // Other rounds: Check if the content is valid player names separated by ',')
            const isValidGuess = /^[A-Za-z0-9\s]+(,[A-Za-z0-9\s]+)*$/.test(content);
            if (!isValidGuess) {
                player.user.send('Invalid guess format. Please provide player names separated by ",".');
                return;
            }
        }

        // Save the guess to temp
        console.log(`Temp: ${player.temp}`);
        player.temp = [];
        player.temp.push(content);
        console.log(`Guess: ${player.temp}`);
    }
});

client.login(process.env.TOKEN);
