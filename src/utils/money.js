exports.toNumber = v => Math.max(0, Number(v || 0));
exports.platformFee = (amount, percent) => Math.round((Number(amount || 0) * Number(percent || 0)) / 100);
