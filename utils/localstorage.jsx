import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export let localUserLogin = {
    id: "",
    avatar: null,
    username: "",
    nickname: ""
}

export const setLocalUser = async (email, password) => {
    try {
        await AsyncStorage.setItem('email', JSON.stringify(email));
        await AsyncStorage.setItem('password', JSON.stringify(password));
    } catch (error) {
        console.error("No fue posible guardar los parametros para el autologueo, detalles: ");
        console.error(error);
    }
}

export const getLocalUser = async () => {
    try {
        let resLocal = [];
        const localEmail = await AsyncStorage.getItem('email');
        const localPassword = await AsyncStorage.getItem('password');

        if (localEmail !== null && localPassword !== null) {
            resLocal = { email: localEmail, password: localPassword }
            return resLocal;
        } else {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }
}

export function setIdUser(id) {
    localUserLogin.id = id;
}

export const saveMyAvatarURI = async (url) => {
    const storage = getStorage();
    const imageRef = ref(storage, url);
    const saveURI = await getDownloadURL(imageRef);

    localUserLogin.avatar = saveURI;
}

export const setSaveTheme = async (name) => {
    try {
        await AsyncStorage.setItem('theme', JSON.stringify(name));
    } catch (error) {
        console.error('Error en el guardado del tema: ' + error);
    }
}

export const getSaveTheme = async () => {
    try {
        const themeName = await AsyncStorage.getItem('theme');

        if (themeName !== null) {
            const themeCrude = themeName.split('"');
            const theme = themeCrude[1];

            return theme;
        } else {
            return 'system';
        }
    } catch (error) {
        console.error("Error en la obtencion del tema: " + error);
        return 'system';
    }
}

export async function erase_all() {
    try {
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('password');
    } catch (error) {
        console.error(error);
    }
}