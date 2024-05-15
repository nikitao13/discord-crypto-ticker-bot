require('dotenv').config();

const axios = require('axios');
const client = require("./discord/client.js");
const formatFDV = require("./utils/format.js");
const { ActivityType } = require('discord.js');

const { DISCORD_BOT_TOKEN, TOKEN_CONTRACT_ADDRESS } = process.env;
const api_url = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONTRACT_ADDRESS}`;

client.once('ready', () => {
    console.log('client is ready!');
    updateBotStatus().then(() => console.log('bot updated'));
    setInterval(updateBotStatus, 60000);
});

async function fetchData() {
    if (!TOKEN_CONTRACT_ADDRESS) {
        console.error('token contract address not set in .env file');
        return [];
    }

    try {
        console.log('refreshing price...');
        const response = await axios.get(api_url);
        return response.data['pairs'];
    } catch(error) {
        console.error('error fetching data: ', error);
        return [];
    }
}

async function setActivity(priceUsd) {
    try {
        console.log('USD:', priceUsd);
        await client.user.setActivity(`USD: $${priceUsd}`, { type: ActivityType['Watching'] });
    } catch(error) {
        console.error('error setting price: ', error)
    }
}

async function setNickname(fdv, symbol) {
    console.log('FDV:', fdv);
    try {
        const guild = client.guilds.cache.get("1216704396440637440");
        const botMember = guild.members.me;
        await botMember.setNickname(`$${symbol.toUpperCase()} ${formatFDV(fdv)}`);
    } catch(error) {
        console.error('error setting fdv: ', error)
    }
}

async function updateBotStatus() {
    const pairs = await fetchData();
    try {
        if (pairs !==  null && pairs.length > 0) {
            const { fdv, priceUsd, baseToken } = pairs[0];
            const symbol = baseToken['symbol'];
            await setActivity(priceUsd);
            await setNickname(fdv, symbol);
        } else {
            console.error('error updating bot: token data not found/invalid API request.\nplease check your token address in the .env file.\n');
            process.exit(1);
        }
    } catch(error) {
        console.error('error updating bot: ', error);
    }
}

client.login(DISCORD_BOT_TOKEN)
    .then(() => console.log('logged in!'))
    .catch(error => {
        if (error.code === 'TokenInvalid') {
            console.error('invalid discord token, double check your .env file.\n');
            process.exit(1);
        } else {
            console.error('error logging in:', error);
        }
    });