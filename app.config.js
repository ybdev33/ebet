import 'dotenv/config';

export default {
    expo: {
        name: "EBet",
        slug: "ebet",
        version: "1.0.0",
        extra: {
            GAMING_NAME: process.env.GAMING_NAME,
            GAMING_DOMAIN: process.env.GAMING_DOMAIN,
            GAMING_API: process.env.GAMING_API,
        },
    },
};
