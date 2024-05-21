require('dotenv').config();

const client = require("./discord/client.js");
const axiosRetry = require('axios-retry').default;
const formatFDV = require("./utils/format.js");

const { axiosInstance, configureAxiosRetry, getRetryCount, resetRetryCount } = require('./utils/axiosRetry');
const { ActivityType } = require('discord.js');

const { DISCORD_BOT_TOKEN, TOKEN_CONTRACT_ADDRESS } = process.env;
const api_url = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONTRACT_ADDRESS}`;

let updateInterval;
let isFetching = false;

configureAxiosRetry();

client.once('ready', () => {
    console.log('Client is ready!');
    startBot();
});

async function fetchData() {
    if (isFetching) return [];
    if (!TOKEN_CONTRACT_ADDRESS) {
        console.error('Token contract address not set in .env file');
        return [];
    }

    isFetching = true;
    try {
        console.log('Refreshing price...');
        const response = await axiosInstance.get(api_url);
        const pairs = response.data?.pairs || [];
        
        if (!pairs.length) throw new Error('Invalid API response');
        
        resetRetryCount();
        return pairs;
    } finally {
        isFetching = false;
    }
}

async function setActivity(priceUsd) {
    if (!client.user) return console.error('client.user is not defined');
    try {
        console.log('USD:', priceUsd);
        await client.user.setActivity(`USD: $${priceUsd}`, { type: ActivityType.Watching });
    } catch (error) {
        console.error('Error setting price:', error);
    }
}

async function setNickname(fdv, symbol) {
    const guild = client.guilds.cache.get("1216704396440637440");
    if (!guild || !guild.members.me) return console.error('guild or guild.members.me is not defined');

    try {
        console.log('FDV:', fdv);
        await guild.members.me.setNickname(`$${symbol.toUpperCase()} ${formatFDV(fdv)}`);
    } catch (error) {
        console.error('Error setting FDV:', error);
    }
}

async function updateBotStatus() {
    const pairs = await fetchData();
    if (!pairs.length) return;
    const { fdv, priceUsd, baseToken: { symbol } } = pairs[0];
    await setActivity(priceUsd);
    await setNickname(fdv, symbol);
}

function startBot() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateBotStatus, 20000);
    updateBotStatus().then(() => console.log('Bot started successfully!'));
}

client.login(DISCORD_BOT_TOKEN)
    .then(() => console.log('Logged in!'))
    .catch(error => {
        if (error.code === 'TokenInvalid') {
            console.error('Invalid Discord token, double check your .env file.\n');
            process.exit(1);
        } else {
            console.error('Error logging in:', error.message || error);
            setTimeout(() => client.login(DISCORD_BOT_TOKEN), 5000);
        }
    });
