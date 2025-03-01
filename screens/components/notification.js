import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { convertDate } from '../../utils/convertDate';
import { localUserLogin } from '../../utils/localstorage';
import { params } from '../sub-screens/myChat';
import { fetchImage } from '../../utils/interations';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Notification({
    id,
    // body,
    date,
    idUser,
    nickname,
    optionalData,
    read,
    type,
    props
}) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const goToPage = async () => {
        try {
            if (!read) {
                const url = 'users/' + localUserLogin.id + '/notifications';
                const docRef = doc(database, url, id);

                await updateDoc(docRef, {
                    read: true
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
                    console.error("Tipo invalido, se estableció como: " + type);
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

    function createBodyNotification () {
        var message = "";

        switch (type) {
            case 'message':
                message = nickname + t('typeMessage') + optionalData.message + '".';
                break;
            case 'follow':
                message = nickname + t('typeFollow');
                break;
            case 'comment':
                message = nickname + t('typeComment');
                break;
            case 'reply_comment':
                message = nickname + t('typeReply_c') + optionalData.message + '".';
                break;
            case 'reply_c':
                message = nickname + t('typeReply_c') + optionalData.message + '".';
                break;
            case 'reply_p':
                message = nickname + t('typeReply_p') + optionalData.message + '".';
                break;
            default:
                console.error("Tipo invalido, se estableció como: " + type);
                message = t('typeDefault');
        }

        return message;
    }

    return (
        <View>
            <View style={read ? {} : {position: 'absolute', top: 30, right: 5, height: 15, width: 15, backgroundColor: colors.tertiary, borderRadius: 10, zIndex: 10}}></View>
            <Text style={{marginTop: 10, marginBottom: 6, marginLeft: 5, color: colors.text, fontSize: 16, fontWeight: 'bold'}}>{convertDate(date)}</Text>
            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: colors.background, borderRadius: 15, alignItems: 'center', marginBottom: 10}} onPress={goToPage}  >
                <MaterialCommunityIcons style={{color: colors.primary, fontSize: 35, marginRight: 15}} name={type == 'message' ? 'chat-processing-outline' : type == 'follow' ? 'account-plus-outline' : type == 'comment' ? 'comment-account-outline' : type == 'reply_c' ? 'comment-quote-outline' : type == 'reply_p' ? 'share-all-outline' : 'exclamation-thick'} />
                <Text style={read ? {width: '75%', color: colors.text, fontSize: 16} : {width: '75%', color: colors.text, fontSize: 16, fontWeight: 'bold'}}>{createBodyNotification()}</Text>
                <MaterialCommunityIcons style={{color: colors.text, fontSize: 45}} name='chevron-right' />
            </TouchableOpacity>
        </View>
    );
}