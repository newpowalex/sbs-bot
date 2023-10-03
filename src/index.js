require('dotenv').config();
const { Client, IntentsBitField, MessageEmbed, EmbedBuilder } = require('discord.js');
const { init: initDB, close: closeDB, addGame, addGuess, addUser } = require('./db.js');
const { startRound, nextRound, determinePlayer, players } = require('./game.js');
const { v4: uuidv4 } = require('uuid');
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

//Initialize database
initDB();


client.on('messageCreate', async (message) => {
    if (message.content === '!sbs') {
        // Check if the game is already in progress
        if (players.player1.user || players.player2.user) {
            await message.reply('A game is already in progress.');
            return;
        }

        // Generate a unique game ID
        const gameID = uuidv4();
        console.log('Generated game ID:', gameID);

        // Set the first player as Player 1
        players.player1.user = message.author;

        //Add player 1 to the user table
        addUser(players.player1.user.id, players.player1.user.username);

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

        //Add player 2 to the user table
        addUser(players.player2.user.id, players.player2.user.username);

        //Add game to the game table
        addGame(players.player1.user.id, players.player2.user.id);

        // Remove reactions from the message
        reaction.message.reactions.removeAll();

        // Edit the embedded message to display the selected players
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Player 1: ${players.player1.user.tag}\n Player 2: ${players.player2.user.tag}\n\n DM Showdown with your guesses!`)
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });


        // Start the first round by sending DMs to players
        startRound(players);
        await reaction.message.react('🔒');
    }

    if (reaction.emoji.name === '🔒' && user.bot === false && (players.player1.user === user || players.player2.user === user)) {
        const player = determinePlayer(players, user);

        if (player.locked === false) {
            player.locked = true;
            player[currentRound] = player.temp;
            player.user.send(`Guess of ${player[currentRound]} for ${currentRound} saved.`);
        }

        if (players.player1.locked === true && players.player2.locked === true) {
            // Remove reactions from the message
            reaction.message.reactions.removeAll();

            const embed = new EmbedBuilder()
                .setTitle('Squad Builder Showdown')
                .setDescription(`Both players locked in!\n\n React with 1️⃣ to reveal ${players.player1.user.tag}\n\n React with 2️⃣ to reveal ${players.player2.user.tag}`)
                .setColor('#0099ff');

            reaction.message.edit({ embeds: [embed] });
            await reaction.message.react('1️⃣');
            await reaction.message.react('2️⃣');
        }
    }

    // Reveal Player 1's guess
    if (reaction.emoji.name === '1️⃣' && user.bot === false && (players.player1.user === user || players.player2.user === user)) {
        const embed = new EmbedBuilder()
            .setTitle(`${players.player1.user.tag}'s Guess`)
            .setDescription(`${players.player1[currentRound]}`)
            .setColor('#0099ff');

        // Find the '1️⃣' and remove all reactions from the embed
        const emoji = '1️⃣';
        players.player1.guessMsg = await reaction.message.channel.send({ embeds: [embed] });
        const reaction1 = reaction.message.reactions.cache.get(emoji);
        await reaction1.remove();
        players.player1.revealed = true;

        // Reveal Player 2's guess
    } else if (reaction.emoji.name === '2️⃣' && user.bot === false && (players.player1.user === user || players.player2.user === user)) {
        const embed = new EmbedBuilder()
            .setTitle(`${players.player2.user.tag}'s Guess`)
            .setDescription(`${players.player2[currentRound]}`)
            .setColor('#0099ff');

        // Find the '2️⃣' and remove all reactions from the embed
        const emoji = '2️⃣';
        players.player2.guessMsg = await reaction.message.channel.send({ embeds: [embed] });
        const reaction2 = reaction.message.reactions.cache.get(emoji);
        await reaction2.remove();
        players.player2.revealed = true;
    }

    if (players.player1.revealed === true && players.player2.revealed === true) {
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Both players revealed!\n\n React with 🟢 to move onto next round.`)
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });
        await reaction.message.react('🟢');
    }

    // Change to next round
    if (reaction.emoji.name === '🟢' && user.bot === false && (players.player1.user === user || players.player2.user === user)) {
        // Delete P1 and P2's guess reveal messages
        await players.player1.guessMsg.delete();
        await players.player2.guessMsg.delete();

        await nextRound(players, reaction);
        if (currentRoundIndex < roundNames.length) {
            await startRound(players);
        }

        reaction.message.reactions.removeAll();

        if (gameOver === false) {
            const embed = new EmbedBuilder()
                .setTitle('Squad Builder Showdown')
                .setDescription('DM Showdown with your guesses!')
                .setColor('#0099ff');

            reaction.message.edit({ embeds: [embed] });
            await reaction.message.react('🔒');
        }
    }
});

client.on('messageCreate', async (message) => {
    if (!message.guild && (message.author === players.player1.user || message.author === players.player2.user)) {
        const content = message.content;
        const player = determinePlayer(players, message.author);

        // Check if it's the formation round
        if (currentRound === 'formation') {
            // Formation round: Check if the content is valid)
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
        player.temp = [];
        player.temp.push(content);

        //Add the guess to the database
        addGuess(gameID, player.user.id, currentRound, content);
    }
});

// Gracefully shut down the database connection when the bot is manually stopped 
process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Closing database connection...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Closing database connection...');
    await closeDB();
    process.exit(0);
});

client.login(process.env.TOKEN);