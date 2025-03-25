import { localUserLogin } from './localstorage';

import { doc, getDoc, updateDoc, arrayUnion, collection, getDocs, addDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from './database';

export function isWasInteracted(array) {
    if (array != undefined) {
        let key = false;

        array.find(function (res) {
            if (res == localUserLogin.username || res === localUserLogin.id) {
                key = true;
            }
        });
        return key;
    } else {
        return false;
    }
}

export function isWasInteractedByID(array) {
    if (array != undefined) {
        let key = false;

        array.find(function (res) {
            if (res == localUserLogin.id) {
                key = true;
            }
        });
        return key;
    } else {
        return false;
    }
}

export function isWasCommented(comments_array) {
    if (comments_array != undefined) {
        if (comments_array.length != 0) {
            let key = false;

            // comments_array.find(function (res) {
            //     if (res.user === localUserLogin.username || res.user === localUserLogin.id) {
            //         key = true;
            //     }
            // });
            comments_array.find(function (res) {
                if (res != undefined) {
                    if (res.data().user === localUserLogin.username || res.data().user === localUserLogin.id) {
                        key = true;
                    }
                } else {
                    key = false;
                }
            });

            return key;
        } else {
            return false
        }
    } else {
        return false;
    }
}

export const youAreFollower = async (author) => {
    try {
        let key = false;

        const docSnap = await getDoc(author);

        if (docSnap.exists()) {
            if (docSnap.data().following.includes(localUserLogin.id)) {
                key = true;
            }
        }

        return key;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const isWasSaved = async (publishId) => {
    if (publishId != undefined) {
        let key = false;

        const docRef = doc(database, "users", localUserLogin.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            docSnap.data().saves.find(function (res) {
                if (res === publishId) {
                    key = true;
                }
            })
        }

        return key;
    } else {
        return false;
    }
}

export const likePublish = async (publishId) => {
    try {
        const docRef = doc(database, 'publications', publishId);
        await updateDoc(docRef, {
            likes: arrayUnion(localUserLogin.username)
        });
        return true
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const deletePublishAction = async (id) => {
    try {
        let key = true;

        await runTransaction(database, async (transaction) => {
            const docRef = doc(database, "publications", id);
            const docSnapshot = await transaction.get(docRef);

            if (!docSnapshot.exists()) {
                console.error("Publicación inexistente");
                key = false;
            } else {
                const url = "archived/" + localUserLogin.id + "/publications";

                const publish = docSnapshot.data();
                const deleteRef = doc(database, url, id);

                transaction.set(deleteRef, {
                    ...publish, delete_at: serverTimestamp()
                });

                transaction.delete(docRef);
            }
        });
        return key;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const deleteLike = async (publishId) => {
    try {
        const docRef = doc(database, 'publications', publishId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let AllLikes = docSnap.data().likes;

            // Eliminando mi like en la lista de likes
            for (let i = 0; i < AllLikes.length; i++) {
                if (AllLikes[i] === localUserLogin.username) {
                    AllLikes.splice(i, 1);
                }
            }

            await updateDoc(docRef, { likes: AllLikes });

            return true
        } else {
            return false
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const savePublish = async (publishId) => {
    try {
        const docRef = doc(database, 'users', localUserLogin.id);
        await updateDoc(docRef, {
            saves: arrayUnion(publishId)
        });

        return true
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const deleteSavePublish = async (publishId) => {
    try {
        const docRef = doc(database, 'users', localUserLogin.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let mySavesList = docSnap.data().saves;

            // Eliminando la publicación de mi lista de guardados
            for (let i = 0; i < mySavesList.length; i++) {
                if (mySavesList[i] === publishId) {
                    mySavesList.splice(i, 1);
                }
            }

            await updateDoc(docRef, { saves: mySavesList });

            return true
        } else {
            return false
        }
    } catch (error) {
        console.error(error);
        return false;
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
        await sendNotification('follow', UserID, null, null);
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

            // Eliminando el usuario seleccionado de mi lista de siguiendo y de no chats
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

export async function addBlockUser(UserID) {
    try {
        const docRefUser = doc(database, 'users', UserID);
        const docRefMyUser = doc(database, 'users', localUserLogin.id);

        const updateList = async (docRef, field, value, remove = false) => {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data()[field]?.includes(value)) {
            const updatedList = docSnap.data()[field].filter(item => item !== value);
            if (!remove) updatedList.push(value);
            await updateDoc(docRef, { [field]: updatedList });
            }
        };

        // Update my user data
        await updateList(docRefMyUser, 'followers', UserID, true);
        await updateList(docRefMyUser, 'following', UserID, true);
        await updateDoc(docRefMyUser, { blackList: arrayUnion(UserID) });

        // Update target user data
        await updateList(docRefUser, 'followers', localUserLogin.id, true);
        await updateList(docRefUser, 'following', localUserLogin.id, true);
        await updateDoc(docRefUser, { blockUsers: arrayUnion(localUserLogin.id) });

        localUserLogin.blackList.push(UserID);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function removeBlockUser(UserID) {
    try {
        const docRefUser = doc(database, 'users', UserID);
        const docRefMyUser = doc(database, 'users', localUserLogin.id);

        const docSnapUser = await getDoc(docRefUser);
        const docSnapMyUser = await getDoc(docRefMyUser);

        if (docSnapMyUser.exists()) {
            let myBlockedSnapshot = docSnapMyUser.data().blackList;

            // Eliminando usuario bloqueado de mi lista de bloqueados
            for (let i = 0; i < myBlockedSnapshot.length; i++) {
                if (myBlockedSnapshot[i] === UserID) {
                    myBlockedSnapshot.splice(i, 1);
                    break;
                }
            }
            await updateDoc(docRefMyUser, { blackList: myBlockedSnapshot });

            if (docSnapUser.exists()) {
                let userBlockedSnapshot = docSnapUser.data().blockUsers;

                // Eliminando mi usuario de la lista de bloqueados del usuario
                for (let i = 0; i < userBlockedSnapshot.length; i++) {
                    if (userBlockedSnapshot[i] === localUserLogin.id) {
                        userBlockedSnapshot.splice(i, 1);
                        break;
                    }
                }
                await updateDoc(docRefUser, { blockUsers: userBlockedSnapshot });

                for (let i = 0; i < localUserLogin.blackList.length; i++) {
                    if (localUserLogin.blackList[i] === UserID) {
                        localUserLogin.blackList.splice(i, 1);
                        break;
                    }
                }
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

export const fetchImage = async (url) => {
    try {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);

            return getUrl;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getNotifications = async (idUser) => {
    let notificationArray = [];
    let no_read_count = 0;
    try {
        const QuerySnapshot = await getDocs(collection(database, "users/" + idUser + "/notifications"));
        QuerySnapshot.forEach(async (doc) => {
            notificationArray.push(doc.data());
        });
        if (notificationArray != undefined) {
            if (notificationArray.length > 0) {
                for (let x = 0; x < notificationArray.length; x++) {
                    if (!notificationArray[x].read) {
                        no_read_count++;
                    }
                }
            } else {
                // console.log("No tienes nuevos mensajes");
            }
        } else {
            // console.log("No tienes nuevos mensajes");
        }
    } catch (error) {
        // console.error("Error en la obtención de las notificaciones");
        console.error(error);
    }
}

export const sendNotification = async (type, idUserToSend, origin, messageToSend) => {
    let message = "";
    let optionalData = null;

    switch (type) {
        case 'message':
            optionalData = { channel: origin, message: messageToSend };
            break;
        case 'follow':
            optionalData = null;
            break;
        case 'comment':
            optionalData = { publish: origin, message: messageToSend };
            break;
        case 'reply_c':
            optionalData = { publish: origin, message: messageToSend };
            break;
        case 'reply_p':
            optionalData = { publish: origin, message: messageToSend };
            break;
        default:
            console.error("Se estableció como: " + type);
    }

    const new_notification = {
        body: message,
        idUser: localUserLogin.id,
        nickname: localUserLogin.nickname,
        optionalData: optionalData,
        read: false,
        type: type,
        date: new Date()
    }

    try {
        const url = "users/" + idUserToSend + "/notifications";
        await addDoc(collection(database, url), new_notification);
    } catch (error) {
        console.error(error);
    }
}