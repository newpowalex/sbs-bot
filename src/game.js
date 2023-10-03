const { EmbedBuilder } = require('discord.js');
const {close: closeDB } = require('./db.js');

let players = {
    player1: {
        user: undefined,
        locked: false,
        revealed: false,
        temp: [],
        guessMsg: undefined,
        formation: [],
        attackers: [],
        midfielders: [],
        outsidebacks: [],
        centrebacksgk: []
    },
    player2: {
        user: undefined,
        locked: false,
        revealed: false,
        temp: [],
        guessMsg: undefined,
        formation: [],
        attackers: [],
        midfielders: [],
        outsidebacks: [],
        centrebacksgk: []
    }
};

// Define an array of round names
const roundNames = ['Formation', 'Attackers', 'Midfielders', 'Outside Backs', 'Centerbacks & GK'];

// Initialize the current round index, game over indicator, and current round name
let currentRoundIndex = 0;
let gameOver = false;
let currentRound = 'Formation';

async function startRound(players) {
    // Send DMs to both players with welcome message and current round info
    for (const player of Object.values(players)) {
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription(`Welcome to the ${currentRound} round, ${player.user.tag}! Please provide your guess.`)
            .setColor('#0099ff');

        const dmChannel = await player.user.createDM();
        await dmChannel.send({ embeds: [embed] });
    }
}

async function nextRound(players, reaction) {
    currentRoundIndex++;
    for (const player of Object.values(players)) {
        player.locked = false;
        player.revealed = false;
        player.temp = [];
    }

    if (currentRoundIndex >= roundNames.length) {
        // All rounds are done
        gameOver = true;

        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription('Game Over!\n\n Thanks for playing!')
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });
        reaction.message.reactions.removeAll();

    } else {
        currentRound = roundNames[currentRoundIndex];
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
        return 'error';
    }
}

// Export the game-related functions and the players object
module.exports = { startRound, nextRound, determinePlayer, players };