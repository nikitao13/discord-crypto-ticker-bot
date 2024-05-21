const axios = require('axios');
const axiosRetry = require('axios-retry').default;

let retryCount = 0;

function configureAxiosRetry() {
    axiosRetry(axios, {
        retries: 50,
        retryDelay: (retryAttempt) => {
            retryCount++;
            const delay = axiosRetry.exponentialDelay(retryAttempt);
            console.log(`retry attempt: ${retryAttempt + 1}, retrying in ${delay / 1000} seconds`);
            return delay;
        },
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
        },
    });
}

module.exports = {
    configureAxiosRetry,
    getRetryCount: () => retryCount,
    resetRetryCount: () => { retryCount = 0; }
};
