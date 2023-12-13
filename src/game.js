const { EmbedBuilder, ChannelType } = require('discord.js');

let players = {
    player1: {
        user: undefined,
        dbId: undefined,
        thread: undefined,
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
        dbId: undefined,
        thread: undefined,
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

let game = {
    id: undefined,
    currentRound: 'Formation',
    currentRoundIndex: 0,
    gameOver: false,
    roundNames: ['Formation', 'Attackers']
    // roundNames: ['Formation', 'Attackers', 'Midfielders', 'Outside Backs', 'Centerbacks & GK']
}

async function startRound(players) {
    // Send DMs to both players with welcome message and current round info
    if (game.gameOver !== true) {
        for (const player of Object.values(players)) {
            const embed = new EmbedBuilder()
                .setTitle('Squad Builder Showdown')
                .setDescription(`Welcome to the ${game.currentRound} round, ${player.user.tag}! Please provide your guess.`)
                .setColor('#0099ff');

            // const dmChannel = await player.user.createDM();
            // await dmChannel.send({ embeds: [embed] });
        }
    }
}

async function checkGameOver() {
    if (game.currentRoundIndex >= game.roundNames.length - 1) {
        // All rounds are done
        game.gameOver = true;
    }
    return game.gameOver;
}

async function nextRound(players, reaction) {
    game.currentRoundIndex++;
    for (const player of Object.values(players)) {
        player.locked = false;
        player.revealed = false;
        player.temp = [];
    }

    if (game.gameOver === true) {
        const embed = new EmbedBuilder()
            .setTitle('Squad Builder Showdown')
            .setDescription('Game Over!\n\n Thanks for playing!')
            .setColor('#0099ff');

        reaction.message.edit({ embeds: [embed] });
        reaction.message.reactions.removeAll();

    } else {
        game.currentRound = game.roundNames[game.currentRoundIndex];
        startRound(players);

        return game.currentRound;
    }
}

async function createThread(player, channel) {
    if (!channel) {
        return console.log('Channel not found.');
    }

    // Create a private thread
    const thread = await channel.threads.create({
        name: `${player.user.username}'s Guess Thread`, // Thread name
        autoArchiveDuration: 60, // Auto-archive duration in minutes
        type: ChannelType.PrivateThread,
        reason: `Private Thread for ${player.user.username} to send their guesses`,
    });

    console.log(`Created thread: ${thread.name}`);

    // Invite player to the private thread
    await thread.members.add(player.user.id);

    console.log(thread.get('thread-id'));

    console.log(`Invited user ${player.user.username} to the thread: ${thread.name}`);

    return thread;
}

async function determinePlayer(players, iD) {
    const isPlayer1 = (iD === players.player1.thread.channelId);
    console.log(iD);
    const isPlayer2 = (iD === players.player2.thread.channelId);
    console.log(players.player2.thread.channelId);

    if (isPlayer1 === true) {
        return players.player1;

    } else if (isPlayer2 === true) {
        return players.player2;

    } else {
        return 'error';
    }
}

// Export the game-related functions and the players object
module.exports = { checkGameOver, startRound, nextRound, determinePlayer, createThread, players, game };