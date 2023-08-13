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

let guesses = {
    player1: {
        formation: [],
        attackers: [],
        midfielders: [],
        outsideBacks: [],
        centreBacksGk: []
    },
    player2: {
        formation: [],
        attackers: [],
        midfielders: [],
        outsideBacks: [],
        centreBacksGk: []
    }
};

function nextRoundType(currentRound) {
    // Determine the next round based on the current round
    // You can customize this logic based on your game's rules
    switch (currentRound.toLowerCase()) {
        case 'formation':
            return 'attackers';
        case 'attackers':
            return 'midfielders';
        case 'midfielders':
            return 'outsidebacks';
        case 'outsidebacks':
            return 'centrebacksgk';
        case 'centrebacksgk':
            return null; // No more rounds
        default:
            return null;
    }
}

function moveToNextRound(message) {
    const nextRound = nextRoundType(currentRound);
    if (nextRound) {
        currentRound = nextRound;
        message.reply(`Next round: ${nextRound}.`);
    } else {
        // Handle end of game or other logic
    }
}

async function sendDM(player, content) {
    try {
        const dmChannel = await player.createDM();
        await dmChannel.send(content);
    } catch (error) {
        console.error(`Error sending DM to ${player.tag}:`, error);
    }
}

async function handleGuessCommand(player, content, currentRound, message) {
    const guessKey = currentRound.toLowerCase();

    if (content.toLowerCase() === 'done') {
        if (!guesses[player.tag][guessKey]) {
            await sendDM(player, `You haven't provided any guesses for ${currentRound} yet. Please provide your guess or type "done".`);
            return;
        }

        await sendDM(player, `Guesses for ${currentRound} saved. You can now reveal your guesses with "!reveal ${player.tag}"`);
        moveToNextRound(message); // Move to the next round

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

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'sbs':
            if (gameStarted) {
                await message.reply('A game is already in progress.');
            } else {
                gameStarted = true;
                players.player1 = message.author;
                await message.reply('You are Player 1! Mention Player 2 with @');
            }
            break;
        case 'reveal':
            if (players.player1 && players.player2 && message.mentions.users.size === 1) {
                const mentionedUser = message.mentions.users.first();
                if (mentionedUser.id === players.player1.id) {
                    const playerGuesses = guesses.player1[currentRound.toLowerCase()];
                    if (playerGuesses && playerGuesses.length > 0) {
                        await sendDM(mentionedUser, `Your ${currentRound} guess: ${playerGuesses.join(', ')}`);
                    } else {
                        await sendDM(mentionedUser, `You haven't provided any ${currentRound} guesses yet.`);
                    }
                } else if (mentionedUser.id === players.player2.id) {
                    const playerGuesses = guesses.player2[currentRound.toLowerCase()];
                    if (playerGuesses && playerGuesses.length > 0) {
                        await sendDM(mentionedUser, `Your ${currentRound} guess: ${playerGuesses.join(', ')}`);
                    } else {
                        await sendDM(mentionedUser, `You haven't provided any ${currentRound} guesses yet.`);
                    }
                }
            }
            break;
        default:
            if (gameStarted && players.player1 && players.player2) {
                if (message.author.id === players.player1.id) {
                    handleGuessCommand(players.player1, message.content, currentRound, message);
                } else if (message.author.id === players.player2.id) {
                    handleGuessCommand(players.player2, message.content, currentRound, message);
                }
            }
            break;
    }
});

client.login(process.env.TOKEN);
