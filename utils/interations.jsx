import { localUserLogin } from './localstorage';

import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { database } from './database';

export function isWasInteracted(array) {
    let key = false;

    array.find(function (res) {
        if (res == localUserLogin.username) {
            key = true;
        }
    });
    return key;
}

export function isWasInteractedByID(array) {
    let key = false;

    array.find(function (res) {
        if (res == localUserLogin.id) {
            key = true;
        }
    });
    return key;
}

export function isWasCommented(comments_array) {
    if (comments_array.length != 0) {
        let key = false;

        comments_array.find(function (res) {
            if (res.user === localUserLogin.username) {
                key = true;
            }
        });

        return key;
    } else {
        return false
    }

}

export async function startFollowProcess(UserID, myUserID) {
    try {
        const docRefUser = doc(database, 'users', UserID);
        const docRefMyUser = doc(database, 'users', myUserID);
        await updateDoc(docRefUser, {
            followers: arrayUnion(myUserID)
        });
        await updateDoc(docRefMyUser, {
            following: arrayUnion(UserID)
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function stopFollowProcess(UserID, myUserID) {
    try {
        const docRefUser = doc(database, 'users', UserID);
        const docRefMyUser = doc(database, 'users', myUserID);

        const docSnapUser = await getDoc(docRefUser);
        const docSnapMyUser = await getDoc(docRefMyUser);

        if (docSnapMyUser.exists()) {
            let myFollowersSnapshot = docSnapMyUser.data().following;

            // Eliminando el usuario seleccionado de mi lista de siguiendo
            for (let i = 0; i < myFollowersSnapshot.length; i++) {
                if (myFollowersSnapshot[i] === UserID) {
                    myFollowersSnapshot.splice(i, 1);
                    break;
                }
            }

            await updateDoc(docRefMyUser, { following: myFollowersSnapshot });

            if (docSnapUser.exists()) {
                let userFollowingsSnapshot = docSnapUser.data().followers;

                // Eliminando mi usuario en la lista de seguidores del usuario seleccionado
                for (let i = 0; i < userFollowingsSnapshot.length; i++) {
                    if (userFollowingsSnapshot[i] === myUserID) {
                        userFollowingsSnapshot.splice(i, 1);
                        break;
                    }
                }

                await updateDoc(docRefUser, { followers: userFollowingsSnapshot });
                return true;
            }
        } else {
            console.error("Datos inexistente");
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function deleteFollowerProcess(UserID, myUserID) {
    try {
        const docRefUser = doc(database, 'users', UserID);
        const docRefMyUser = doc(database, 'users', myUserID);

        const docSnapUser = await getDoc(docRefUser);
        const docSnapMyUser = await getDoc(docRefMyUser);

        if (docSnapMyUser.exists()) {
            let myFollowersSnapshot = docSnapMyUser.data().followers;
            
            // Eliminado seguidor de mi lista de seguidores
            for (let i = 0; i < myFollowersSnapshot.length; i++) {
                if (myFollowersSnapshot[i] === UserID) {
                    myFollowersSnapshot.splice(i, 1);
                    break;
                }
            }
            await updateDoc(docRefMyUser, { followers: myFollowersSnapshot });

            if (docSnapUser.exists()) {
                let userFollowingsSnapshot = docSnapUser.data().following;

                // Eliminando mi usuario en la lista de siguiendo del usuario
                for (let i = 0; i < userFollowingsSnapshot.length; i++) {
                    if (userFollowingsSnapshot[i] === myUserID) {
                        userFollowingsSnapshot.splice(i, 1);
                        break;
                    }
                }

                await updateDoc(docRefUser, { following: userFollowingsSnapshot });
            }
            return true;
        } else {
            console.error("Datos inexistentes");
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}