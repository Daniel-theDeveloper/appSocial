import { createUserWithEmailAndPassword } from 'firebase/auth';
import { database, auth } from './database';
import { addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage"

export var params = {
    avatar: null,
    avatarName: null,
    avatarExt: null,
    banner: null,
    bannerName: null,
    bannerExt: null,
    details: "Soy nuevo en esta maravillosa red social",
    email: "",
    username: "",
    nickname: "",
    country: "",
    city: "",
    password: ""
}

export default async function SignUp() {
    console.log(params);
    try {
        let location;
        let avatarSaveURL = null;
        let bannerSaveURL = null;

        if (params.city.length != undefined) {
            location = params.city + ", " + params.country;
        } else {
            location = params.country;
        }

        if (params.avatar != null) {
            const url = params.username + params.avatarName + "." + params.avatarExt;

            const response = await fetch(params.avatar);
            const blob = await response.blob();
            const storage = getStorage();
            const storageRef = ref(storage, url);

            const snapshot = await uploadBytes(storageRef, blob);

            avatarSaveURL = snapshot.ref.fullPath;
        }

        if (params.banner != null) {
            const url = params.username + params.bannerName + "." + params.bannerExt;

            const response = await fetch(params.banner);
            const blob = await response.blob();
            const storage = getStorage();
            const storageRef = ref(storage, url);

            const snapshot = await uploadBytes(storageRef, blob);

            bannerSaveURL = snapshot.ref.fullPath;
        }

        const userData = {
            avatar: avatarSaveURL,
            banner: bannerSaveURL,
            details: params.details,
            email: params.email,
            followers: [],
            following: [],
            location: location,
            name: params.username,
            username: params.nickname,
            wasCreated: new Date()
        }

        await createUserWithEmailAndPassword(auth, params.email, params.password);
        await addDoc(collection(database, 'users'), userData);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}