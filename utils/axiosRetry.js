const axios = require('axios').default;
const axiosRetry = require('axios-retry').default;

const axiosInstance = axios.create({ timeout: 5000 });

function configureAxiosRetry() {
    axiosRetry(axiosInstance, {
        retries: 20,
        retryDelay: retryAttempt => {
            const delay = axiosRetry.exponentialDelay(retryAttempt);
            console.log(`Retry attempt: ${retryAttempt}\nRetrying in ${(delay / 1000).toFixed(2)}s`);
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
    resetRetryCount: () => { retryCount = 0; }
};
