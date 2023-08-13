require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✔️  Logged in as ${client.user.tag}`);
});

let gameStarted = false;
let players = {
    player1: null,
    player2: null,
};

let currentRound = 'formation';

let guesses = {
    player1: {},
    player2: {},
};

async function sendDM(user, content) {
    try {
        const dmChannel = await user.createDM();
        await dmChannel.send(content);
    } catch (error) {
        console.error(`Error sending DM to ${user.tag}: ${error}`);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const mentionedUser = message.mentions.users.first();

    switch (command) {
        case 'sbs':
            if (gameStarted) {
                await message.reply('A game is already in progress.');
            } else {
                if (!players.player1) {
                    players.player1 = message.author;
                    await message.reply('You are Player 1! Mention Player 2 with @');
                } else if (!players.player2 && mentionedUser && mentionedUser.id !== players.player1.id) {
                    players.player2 = mentionedUser;
                    gameStarted = true;
                    await message.reply(`Both players selected: ${players.player1.tag} and ${players.player2.tag}.`);
                    await players.player1.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
                    await players.player2.send('Welcome to the Squad Builder Showdown game! Please provide your formation guess.');
                }
            }
            break;
        case 'reveal':
            if (gameStarted && players.player1 && players.player2 && mentionedUser) {
                if (mentionedUser.id === players.player1.id || mentionedUser.id === players.player2.id) {
                    // Handle reveal logic
                } else {
                    await message.reply('Invalid usage of reveal command.');
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

