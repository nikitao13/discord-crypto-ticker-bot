const axios = require('axios').default;
const axiosRetry = require('axios-retry').default;

let retryCount = 0;

const axiosInstance = axios.create({ timeout: 5000 });

function configureAxiosRetry() {
    axiosRetry(axiosInstance, {
        retries: 20,
        retryDelay: retryAttempt => {
            retryCount++;
            const delay = axiosRetry.exponentialDelay(retryAttempt);
            console.log(`Retry attempt: ${retryAttempt + 1}, retrying in ${(delay / 1000).toFixed(2)} seconds`);
            return delay;
        },
        retryCondition: error =>
            axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500),
        shouldResetTimeout: true
    });
}

module.exports = {
    axiosInstance,
    configureAxiosRetry,
    getRetryCount: () => retryCount,
    resetRetryCount: () => { retryCount = 0; }
};
