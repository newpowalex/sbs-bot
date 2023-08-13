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
let players = {
    player1: null,
    player2: null
};

let currentRound = 'formation';

let guesses = {
    player1: {
        formation: null,
        attackers: null,
        midfielders: null,
        outsideBacks: null,
        centreBacksGk: null
    },
    player2: {
        formation: null,
        attackers: null,
        midfielders: null,
        outsideBacks: null,
        centreBacksGk: null
    }
};

async function moveToNextRound(round) {
    currentRound = round;
    await message.reply(`Next round: ${currentRound}.`);
    await players.player1.send(`Welcome to round ${currentRound}! Please provide your guess.`);
    await players.player2.send(`Welcome to round ${currentRound}! Please provide your guess.`);
}

async function handleGuess(player, content, currentRound) {
    const guessKey = currentRound.toLowerCase();

    if (content.toLowerCase() === 'done') {
        if (!guesses[player.tag][guessKey]) {
            await sendDM(player, `You haven't provided any guesses for ${currentRound} yet. Please provide your guess or type "done".`);
            return;
        }

        await sendDM(player, `Guesses for ${currentRound} saved. You can now reveal your guesses with "!reveal ${player.tag}"`);

        // Determine the next round
        const nextRound = nextRoundType(currentRound);
        if (nextRound) {
            moveToNextRound(nextRound);
        }
    } else {
        // Save the guess for the current round
        if (!guesses[player.tag][guessKey]) {
            guesses[player.tag][guessKey] = [];
        }
        guesses[player.tag][guessKey].push(content);
        await sendDM(player, `Guess for ${currentRound} saved. Please provide your next guess or type "done" to finish.`);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    // Handle message for bot read
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'sbs') {
        if (gameStarted) {
            await message.reply('A game is already in progress.');
        } else {
            gameStarted = true;
            players.player1 = message.author; // Set the player who used the command as Player 1
            await message.reply('You are Player 1! Mention Player 2 with @');
        }
    } else if (gameStarted && !players.player2 && message.mentions.users.size === 1) {
        const mentionedUser = message.mentions.users.first();

        // Check if the mentioned user is not Player 1
        if (mentionedUser.id == players.player1.id) {
            players.player2 = mentionedUser; // Set the mentioned user as Player 2
            await message.reply(`Both players selected: ${players.player1.tag} and ${players.player2.tag}.`);
            await players.player1.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
            await players.player2.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
        }
    } else if (gameStarted && players.player1 && players.player2 && message.author.id === players.player1.id) {
        handleGuess(players.player1, message.content, currentRound);
    } else if (gameStarted && players.player1 && players.player2 && message.author.id === players.player2.id) {
        handleGuess(players.player2, message.content, currentRound);
    }

    if (guesses.player1.formation && guesses.player2.formation) {
        moveToNextRound('midfielders');
    } else if (guesses.player1.midfielders && guesses.player2.midfielders) {
        moveToNextRound('outsideBacks');
    } else if (guesses.player1.outsideBacks && guesses.player2.outsideBacks) {
        moveToNextRound('centreBacksGk');
    } else if (guesses.player1.centreBacksGk && guesses.player2.centreBacksGk) {
        // All rounds are completed, you can perform final actions here
    }
});

client.login(process.env.TOKEN);
