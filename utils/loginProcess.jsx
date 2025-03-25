import { collection, getDocs } from 'firebase/firestore';
import { database, auth } from '../utils/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { localUserLogin, setLocalUser, saveMyAvatarURI } from './localstorage';
import { getNotifications } from './interations';

export default async function LoginProcess(email, password) {
    const SaveUserData = async () => {
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach(async (doc) => {
                if (doc.data().email === email) {
                    localUserLogin.id = doc.id;
                    localUserLogin.username = doc.data().username;
                    localUserLogin.nickname = doc.data().name;
                    localUserLogin.blackList = doc.data().blackList != undefined ? doc.data().blackList : [];
                    localUserLogin.blockUsers = doc.data().blockUsers != undefined ? doc.data().blockUsers : [];

                    if (doc.data().avatar != null) {
                        await saveMyAvatarURI(await doc.data().avatar);
                    }

                    await getNotifications(doc.id);
                    await setLocalUser(email, password);
                }
            });
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