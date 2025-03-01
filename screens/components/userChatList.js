import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import { params } from '../sub-screens/myChat';
import { localUserLogin } from '../../utils/localstorage';
import { fetchImage } from '../../utils/interations';
import { useTheme } from '@react-navigation/native';

export default function UserChatList({ idUser, props, isAdded, channelId }) {
    const [userData, setUserData] = useState({
        id: "",
        username: "",
        nickname: "",
        description: "",
        avatar: null,
        followingList: []
    });
    const [lastMessage, setLastMessagge] = useState("Nuevo chat");
    const [userAvatar, setUserAvatar] = useState(null);
    const [loadingButton, setLoadingButton] = useState(false);

    const { colors } = useTheme();

    useEffect(() => {
        loadData();
        if (channelId != null) {
            getLastMessage();
        }
    }, []);

    const loadData = async () => {
        try {
            const docRef = doc(database, "users", idUser);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserData({
                    id: docSnap.id,
                    username: docSnap.data().username,
                    nickname: docSnap.data().name,
                    description: docSnap.data().details,
                    avatar: docSnap.data().avatar,
                    followingList: docSnap.data().following
                });
                if (docSnap.data().avatar != null) {
                    setUserAvatar(await fetchImage(docSnap.data().avatar));
                }
            } else {
                setUserData({
                    username: null,
                    nickname: "Usuario eliminado",
                    avatar: null
                })
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addChat = async () => {
        setLoadingButton(true);
        try {
            const newChannel = {
                lastMessage: "Nuevo chat",
                userId1: localUserLogin.id,
                userId2: userData.id
            }
            const docRef = doc(database, "users", localUserLogin.id)
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                let noChatSnapshot = docSnap.data().noChats

                for (let i = 0; i < noChatSnapshot.length; i++) {
                    if (noChatSnapshot[i] === userData.id) {
                        noChatSnapshot.splice(i, 1);
                        break;
                    }
                }
                await updateDoc(docRef, { noChats: noChatSnapshot });
                const channelInfo = await addDoc(collection(database, 'channels'), newChannel);

                params.channelId = channelInfo.id;
                setLoadingButton(false);
                props.navigation.replace('Home');
                props.navigation.navigate('MyChat');
            }
        } catch (error) {
            Alert.alert("Error en el servidor", "Vuélvalo a intentar mas tarde");
            setLoadingButton(false);
            console.error(error);
        }
    }

    const getLastMessage = async () => {
        const docRef = doc(database, "channels", channelId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setLastMessagge(docSnap.data().lastMessage);
        }
    }

    const goToChat = async () => {
        params.channelId = channelId;
        params.userId = idUser;
        params.nickname = userData.nickname;
        params.avatar = userAvatar;
        props.navigation.navigate('MyChat');
    }

    return (
        <TouchableOpacity style={styles.container}>
            <View style={{ flexDirection: "row", width: '65%' }}>
                <Image style={styles.avatar} source={userAvatar != null ? { uri: userAvatar } : require('../../assets/avatar-default.png')} />
                <View>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.primary }}>{userData.nickname}</Text>
                    {isAdded ?
                        <Text style={{ fontSize: 14, color: colors.text }}>{lastMessage}</Text>
                        :
                        <Text style={{ fontSize: 14, color: colors.text }}>{userData.description}</Text>
                    }
                </View>
            </View>

            {isAdded ?
                <TouchableOpacity style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.primary, borderRadius: 10 }} onPress={goToChat}>
                    <MaterialCommunityIcons style={{color: colors.background, fontSize: 30}} name='chat-processing' />
                </TouchableOpacity>
                :
                loadingButton ?
                    <View style={{
                        paddingVertical: 9,
                        paddingHorizontal: 14,
                        borderColor: colors.primary_dark,
                        borderWidth: 2,
                        borderRadius: 10,
                        outlineStyle: "solid",
                        outlineWidth: 2
                    }}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                    :
                    <TouchableOpacity style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderColor: colors.primary,
                        borderWidth: 2,
                        borderRadius: 10,
                        outlineStyle: "solid",
                        outlineWidth: 2
                    }} onPress={addChat}>
                        <MaterialCommunityIcons style={{color: colors.primary, fontSize: 23}} name='chat-plus-outline' />
                    </TouchableOpacity>
            }
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    avatar: {
        marginRight: 20,
        height: 50,
        width: 50,
        borderRadius: 50,
    }
});