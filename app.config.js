import 'expo-env';

export default {
    "expo": {
        "name": "appSocial",
        "slug": "appSocial",
        "version": "1.1.0",
        "orientation": "portrait",
        "icon": "./assets/icon.png",
        "userInterfaceStyle": "light",
        "owner": "daniel_developer2000",
        "splash": {
            "image": "./assets/splash.png",
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
        },
        "assetBundlePatterns": [
            "**/*"
        ],
        "ios": {
            "supportsTablet": true
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            "permissions": [
                "android.permission.CAMERA",
                "android.permission.MANAGE_MEDIA"
            ],
            "package": "com.daniel_developer2000.appSocialAndroid",
            "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./path/to/google-services.json"
        },
        "web": {
            "favicon": "./assets/favicon.png"
        },
        "plugins": [
            "expo-image-picker"
        ],
        "extra": {
            "eas": {
                "projectId": "9c2811c7-7f6e-4d67-9287-74a116431ed2"
            },
            "API_KEY": process.env.API_KEY,
            "AUTH_DOMAIN": process.env.AUTH_DOMAIN,
            "PROJECT_ID": process.env.PROJECT_ID,
            "STORAGE_BUCKET": process.env.STORAGE_BUCKET,
            "MESSAGING_SENDER_ID": process.env.MESSAGING_SENDER_ID,
            "APP_ID": process.env.APP_ID
        }
    }
}