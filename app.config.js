import 'dotenv/config';

export default {
    expo: {
        name: process.env.GAMING_NAME || 'ebetgame',
        slug: 'ebetgame',
        version: '1.0.0',
        sdkVersion: '54.0.0',
        platforms: ["ios", "android", "web"],
        extra: {
            eas: {
                projectId: 'f5287f35-b85a-4f6b-be81-8b8f68d314ec'
            },
            GAMING_NAME: process.env.GAMING_NAME,
            GAMING_DOMAIN: process.env.GAMING_DOMAIN,
            GAMING_API: process.env.GAMING_API
        },
        android: {
            package: "com.ybdev33.ebet",
            permissions: [
                "BLUETOOTH",
                "BLUETOOTH_ADMIN",
                "BLUETOOTH_CONNECT",
                "BLUETOOTH_SCAN",
                "ACCESS_FINE_LOCATION"
            ],
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            minSdkVersion: 24
        },
        ios: {
            bundleIdentifier: "com.ybdev33.ebet",
            infoPlist: {
                NSBluetoothAlwaysUsageDescription: "This app uses Bluetooth to connect to thermal printers"
            }
        }
    }
};
