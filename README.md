# Squad Builder Showdown Bot

The **Squad Builder Showdown Bot** is a Discord bot that facilitates a game where players guess the starting lineup of an oppents EA Sports FC team in various rounds.

**Please Note:** This bot is currently in active development and is not ready to be invited to servers yet. The codebase is a work in progress and may not include all the features or be fully polished.

## Features

- Select two players to participate in a Squad Builder Showdown game.
- Guide players through rounds of guessing player names or formations.
- Reveal guesses and move to the next round.

## Usage

1. **Setup:**
   - Invite the bot to your server using the provided invitation link.
   - Set up the necessary roles and permissions for the bot to function correctly.

2. **Starting a Game:**
   - Use the command `!sbs` to initiate a new Squad Builder Showdown game.
   - React to the bot's message to become a participant in the game.
   - Once two players have joined, the game will start.

3. **Gameplay:**
   - The game consists of several rounds where players make guesses.
   - Follow the bot's prompts in the chat and use reactions to interact.
   - Players take turns making guesses based on the round's theme (formation or player names).
   - Use the appropriate format for guesses.

4. **Locking In:**
   - When both players are ready to proceed, they can react with the lock emoji to lock in their guesses.
   - The game will advance to the next phase after both players have locked in.

5. **Revealing Guesses:**
   - After both players have locked in, their guesses will be revealed.
   - Use reactions to reveal each player's guesses.

6. **Moving to the Next Round:**
   - Once both players have revealed their guesses, react with the green checkmark emoji to move to the next round.

7. **Winner Declaration:**
   - The game continues through rounds until all rounds are completed.

## Commands

- `/sbs`: Start a new Squad Builder Showdown game.

## Dependencies

- Node.js
- Discord.js

## Contributing

Contributions to the Squad Builder Showdown Bot are welcome! If you'd like to contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m "Add new feature"`.
4. Push to your forked repository: `git push origin feature-name`.
5. Create a pull request on the original repository.

## Credits

- [Alex Newell-Powers](https://github.com/newpowalex) - Bot Developer
- [Discord.js](https://discord.js.org/) - Discord API Library

## License

This project is licensed under the [MIT License](LICENSE).

---