import AsyncStorage from '@react-native-async-storage/async-storage';

export var globalUsername = ""

export async function setUsername(username) {
    try {
        await AsyncStorage.setItem('username', JSON.stringify(username));
        globalUsername = username;
    } catch (error) {
        console.error(error);
    }
}

export async function getUsername() {
    const nameCrude = await AsyncStorage.getItem('username');
    const nameString = nameCrude.split('"');
    const username = nameString[1];

    if (username !== null) {
        globalUsername = username
        return username;
    } else {
        return undefined;
    }
}

export async function erase_all() {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error(error);
    }
}