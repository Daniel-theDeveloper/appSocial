import { createUserWithEmailAndPassword } from 'firebase/auth';
import { database, auth } from './database';
import { addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage"

export var params = {
    avatar: null,
    avatarName: null,
    avatarExt: null,
    blacklist: [],
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
    // console.log(params);
    try {
        // let location;
        let avatarSaveURL = null;
        let bannerSaveURL = null;

        // if (params.city.length != undefined) {
        //     location = params.country + ", " + params.city;
        // } else {
        //     location = params.country;
        // }

        const userData = {
            avatar: avatarSaveURL,
            banner: bannerSaveURL,
            details: params.details,
            email: params.email,
            followers: [],
            following: [],
            saves: [],
            // location: location,
            city: params.city,
            country: params.country,
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