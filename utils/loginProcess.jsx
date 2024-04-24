import { collection, getDocs } from 'firebase/firestore';
import { database, auth } from '../utils/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { localUserLogin, setLocalUser, saveMyAvatarURI } from './localstorage';

export default async function LoginProcess(email, password) {
    const SaveUserData = async () => {
        let userData = [];
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                userData.push({ id: doc.id, data: doc.data() });
            });
            const userInfo = userData.find(function (res) {
                if (res.data.email === email) {
                    return res;
                }
            });

            localUserLogin.id = await userInfo.id;
            localUserLogin.username = await userInfo.data.username;
            localUserLogin.nickname = await userInfo.data.name;

            if (userInfo.data.avatar != null) {
                await saveMyAvatarURI(userInfo.data.avatar);
            }
            await setLocalUser(email, password);

            return true
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const loginProcess = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            SaveUserData().then((res) => {
                if (res == false) {
                    return false;
                }
            });
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }

    return await loginProcess();
}