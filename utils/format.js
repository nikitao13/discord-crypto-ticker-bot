const formatFDV = fdv => {
    if (fdv >= 1000000) {
        return `${(fdv / 1000000).toFixed(1)}M`;
    } else if (fdv >= 1000) {
        return `${(fdv / 1000).toFixed(0)}K`;
    } else {
        return fdv.toFixed(2);
    }
};

module.exports = formatFDV;