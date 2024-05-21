import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { convertDate } from '../../utils/convertDate';
import { localUserLogin } from '../../utils/localstorage';
import { params } from '../sub-screens/myChat';
import { fetchImage } from '../../utils/interations';


export default function Notification({
    id,
    body,
    date,
    idUser,
    optionalData,
    readed,
    type,
    props
}) {
    // useEffect(() => {
    //     console.log(type);
    // }, []);

    const goToPage = async () => {
        try {
            if (!readed) {
                const url = 'users/' + localUserLogin.id + '/notifications';
                const docRef = doc(database, url, id);

                await updateDoc(docRef, {
                    readed: true
                });
            }

            switch (type) {
                case 'message':
                    await goToChat();
                    break;
                case 'follow':
                    props.navigation.navigate({ name: 'Perfil', params: { userId: idUser }, merge: true });
                    break;
                case 'comment':
                    props.navigation.navigate({ name: 'Details', params: { id: optionalData.publish, nickname: localUserLogin.nickname, avatar: localUserLogin.avatar }, merge: true });
                    break;
                case 'reply_comment':
                    props.navigation.navigate({ name: 'Details', params: { id: optionalData.publish, nickname: localUserLogin.nickname, avatar: localUserLogin.avatar }, merge: true });
                    break;
                case 'reply_c':
                    props.navigation.navigate({ name: 'Details', params: { id: optionalData.publish, nickname: localUserLogin.nickname, avatar: localUserLogin.avatar }, merge: true });
                    break;
                case 'reply_p':
                    await goToReplyPublish();
                    break;
                default:
                    console.error("Tipo invalido, se establecio como: " + type);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const goToChat = async () => {
        const docRef = doc(database, 'users', idUser);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            params.channelId = optionalData.channel;
            params.nickname = await docSnap.data().nickname;
            params.avatar = await fetchImage(docSnap.data().avatar);
            props.navigation.navigate('MyChat');
        } else {
            params.channelId = optionalData.channelId;
            params.nickname = "USUARIO ELIMINADO";
            params.avatar = null;
            props.navigation.navigate('MyChat');
        }
    }

    const goToReplyPublish = async () => {
        const docRef = doc(database, 'users', idUser);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const urlAvatar = await fetchImage(docSnap.data().avatar);
            props.navigation.navigate({ name: 'Details', params: { id: optionalData.publish, nickname: docSnap.data().name, avatar: urlAvatar }, merge: true });
        } else {
            props.navigation.navigate({ name: 'Details', params: { id: optionalData.publish, nickname: "USUARIO ELIMINADO", avatar: null }, merge: true });
        }
    }

    return (
        <View>
            <View style={readed ? {} : styles.point}></View>
            <Text style={styles.date}>{convertDate(date)}</Text>
            <TouchableOpacity style={styles.container} onPress={goToPage}>
                <MaterialCommunityIcons style={styles.icon} name={type == 'message' ? 'chat-processing-outline' : type == 'follow' ? 'account-plus-outline' : type == 'comment' ? 'comment-account-outline' : type == 'reply_c' ? 'comment-quote-outline' : type == 'reply_p' ? 'share-all-outline' : 'exclamation-thick'} />
                <Text style={styles.message}>{body}</Text>
                <MaterialCommunityIcons style={styles.iconRight} name='chevron-right' />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#48002b',
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 10
    },
    point: {
        position: 'absolute',
        top: 30,
        right: 5,
        height: 15,
        width: 15,
        backgroundColor: '#a1e64d',
        borderRadius: 10,
        zIndex: 10
    },
    date: {
        marginTop: 10,
        marginBottom: 6,
        marginLeft: 5,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    icon: {
        color: '#ed007e',
        fontSize: 35
    },
    message: {
        width: '75%',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'justify'
    },
    iconRight: {
        color: 'white',
        fontSize: 45
    }
});