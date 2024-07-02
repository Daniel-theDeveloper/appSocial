import { localUserLogin } from './localstorage';

import { doc, getDoc, updateDoc, arrayUnion, collection, onSnapshot, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
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

export const isWasSaved = async (publishId) => {
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

            // Eliminando la publicacion de mi lista de guardados
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
            following: arrayUnion(UserID),
            noChats: arrayUnion(UserID)
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
            let myNoChatsSnapshot = docSnapMyUser.data().noChats;

            // Eliminando el usuario seleccionado de mi lista de siguiendo y de no chats
            for (let i = 0; i < myFollowersSnapshot.length; i++) {
                if (myFollowersSnapshot[i] === UserID) {
                    myFollowersSnapshot.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < myNoChatsSnapshot.length; i++) {
                if (myNoChatsSnapshot[i] === UserID) {
                    myNoChatsSnapshot.splice(i, 1);
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

export const fetchImage = async (url) => {
    if (url != null) {
        const storage = getStorage();
        const imageRef = ref(storage, url);
        const getUrl = await getDownloadURL(imageRef);

        return getUrl;
    } else {
        return null;
    }
}

export const getNotifications = async (idUser) => {
    let notificationArray = [];
    let no_readed_count = 0;
    try {
        const QuerySnapshot = await getDocs(collection(database, "users/" + idUser + "/notifications"));
        QuerySnapshot.forEach(async (doc) => {
            notificationArray.push(doc.data());
        });
        if (notificationArray != undefined) {
            if (notificationArray.length > 0) {
                for (let x = 0; x < notificationArray.length; x++) {
                    if (!notificationArray[x].readed) {
                        no_readed_count++;
                        console.log(notificationArray[x].body);
                    }
                }
            } else {
                console.log("No tienes nuevos mensajes");
            }
        } else {
            console.log("No tienes nuevos mensajes");
        }
    } catch (error) {
        console.error("Error en la obtencion de las notificaciones");
        console.error(error);
    }
}

export const sendNotification = async (type, idUserToSend, origin, messageToSend) => {
    let message = "";
    let optionalData = null;
    switch (type) {
        case 'message':
            message = localUserLogin.nickname + ' te ha enviado un mensaje: "' + messageToSend + '".';
            optionalData = { channel: origin };
            break;
        case 'follow':
            message = localUserLogin.nickname + " te ha empezado a seguir.";
            break;
        case 'comment':
            message = localUserLogin.nickname + " ha comentado en tu publicacion.";
            optionalData = { publish: origin };
            break;
        case 'reply_c':
            message = localUserLogin.nickname + ' ha respondido tu comentario: "' + messageToSend + '".';
            optionalData = { publish: origin };
            break;
        case 'reply_p':
            message = localUserLogin.nickname + ' ha replicado tu publicacion: "' + messageToSend + '".';
            optionalData = { publish: origin };
            break;
        default:
            console.error("Se establecio como: " + type);
    }

    const new_notification = {
        body: message,
        idUser: localUserLogin.id,
        optionalData: optionalData,
        readed: false,
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