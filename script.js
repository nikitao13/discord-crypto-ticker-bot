require('dotenv').config();

const axios = require('axios');
const { configureAxiosRetry, getRetryCount, resetRetryCount } = require('./utils/axiosRetry');
const client = require("./discord/client.js");
const { ActivityType } = require('discord.js');
const formatFDV = require("./utils/format.js");

const { DISCORD_BOT_TOKEN, TOKEN_CONTRACT_ADDRESS } = process.env;
const api_url = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONTRACT_ADDRESS}`;

let updateInterval;
let isFetching = false;

configureAxiosRetry();

client.once('ready', () => {
    console.log('client is ready!');
    startBot();
});

async function fetchData() {
    if (isFetching) {
        return [];
    }
    isFetching = true;

    if (!TOKEN_CONTRACT_ADDRESS) {
        console.error('token contract address not set in .env file');
        isFetching = false;
        return [];
    }

    try {
        console.log('refreshing price...');
        const response = await axios.get(api_url);
        if (response.data && response.data.pairs && response.data.pairs.length > 0) {
            resetRetryCount();
            isFetching = false;
            return response.data.pairs;
        } else {
            console.error('API response does not contain valid pairs data:', response.data);
            throw new Error('Invalid API response');
        }
    } catch (error) {
        const retryCount = getRetryCount();
        if (!axiosRetry.isNetworkOrIdempotentRequestError(error) && (!error.response || error.response.status < 500)) {
            console.error(`error fetching data on attempt ${retryCount}:`, error.message || error);
        }
        isFetching = false;
        throw error;
    }
}

async function setActivity(priceUsd) {
    if (client.user) {
        try {
            console.log('USD:', priceUsd);
            await client.user.setActivity(`USD: $${priceUsd}`, { type: ActivityType.Watching });
        } catch (error) {
            console.error('error setting price: ', error);
        }
    } else {
        console.error('client.user is not defined');
    }
}

async function setNickname(fdv, symbol) {
    const guild = client.guilds.cache.get("1216704396440637440");
    if (guild && guild.members.me) {
        console.log('FDV:', fdv);
        try {
            const botMember = guild.members.me;
            await botMember.setNickname(`$${symbol.toUpperCase()} ${formatFDV(fdv)}`);
        } catch (error) {
            console.error('error setting fdv: ', error);
        }
    } else {
        console.error('guild or guild.members.me is not defined');
    }
}

async function updateBotStatus() {
    try {
        const pairs = await fetchData();
        if (pairs !== null && pairs.length > 0) {
            const { fdv, priceUsd, baseToken } = pairs[0];
            const symbol = baseToken.symbol;
            await setActivity(priceUsd);
            await setNickname(fdv, symbol);
        } else {
            console.error('error updating bot: token data not found/invalid API request.\nplease check your token address in the .env file.\n');
        }
    } catch (error) {
        if (!axiosRetry.isNetworkOrIdempotentRequestError(error) && (!error.response || error.response.status < 500)) {
            console.error('error updating bot: ', error.message || error);
        }
    }
}

function startBot() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    updateInterval = setInterval(updateBotStatus, 60000);
    updateBotStatus().then(() => console.log('bot started successfully!'));
}

client.login(DISCORD_BOT_TOKEN).then(() => {
    console.log('logged in!');
}).catch(error => {
    if (error.code === 'TokenInvalid') {
        console.error('invalid discord token, double check your .env file.\n');
        process.exit(1);
    } else {
        console.error('error logging in:', error.message || error);
        setTimeout(() => client.login(DISCORD_BOT_TOKEN), 5000);
    }
});