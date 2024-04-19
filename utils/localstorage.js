import AsyncStorage from '@react-native-async-storage/async-storage';

export var myIdUser = "";
export var globalUsername = "";
export var avatarURL = "";

export async function setUsername(username) {
    try {
        await AsyncStorage.setItem('username', JSON.stringify(username));
        globalUsername = username;
    } catch (error) {
        console.error(error);
    }
}

export async function getUsername() {
    try {
        const nameCrude = await AsyncStorage.getItem('username');
    
        if (nameCrude !== null) {
            const nameString = nameCrude.split('"');
            const username = nameString[1];
            globalUsername = username
            return username;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error(error)
        return undefined
    }
}

export function setIdUser(id) {
    myIdUser = id;
}

export async function erase_all() {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error(error);
    }
}