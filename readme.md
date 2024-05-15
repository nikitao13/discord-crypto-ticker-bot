# Discord Ticker Bot

A simple bot that displays the price and FDV (Fully Diluted Valuation) of a cryptocurrency on Discord via Activity Status and Nickname.  Data is fetched from DEXSCREENER and only tokens that are there will work. You can also find the contract address there.

## Setup - Make sure Node.Js & Git are installed
*create a new text document then file save as, set save as type to 'all files' and file name to .env

1. Create a `.env`* file in the root directory with the following content:
    ```
    DISCORD_BOT_TOKEN=
    TOKEN_CONTRACT_ADDRESS=
    ```

2. Visit [Discord Developer Portal](https://discord.com/developers/applications) to create a new application and bot.

3. Copy the bot token and paste it into the `DISCORD_BOT_TOKEN` field in the `.env` file.

4. Copy the token contract address from somewhere like Dexscreener.

5. Paste the token contract address into the `TOKEN_CONTRACT_ADDRESS` field in the `.env` file.

6. Invite the bot to your server via the Developer Portal making sure to enable the 'bot' scope and 'nickname' & 'activities' permissions.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/nikitao13/discord-crypto-ticker-bot.git
    ```

2. Navigate to the project directory:

    ```bash
    cd discord-crypto-ticker-bot
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Usage

1. Start the bot:

    ```bash
    npm start
    ```

## Contributing

Contributions are welcome! This is very basic bot and more features could be added in the future. Feel free to submit pull requests or open issues.

