import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc, collection, addDoc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import { params } from '../sub-screens/myChat';
import { localUserLogin } from '../../utils/localstorage';

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
                    await fetchImageAvatar(docSnap.data().avatar);
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
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
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

    const fetchImageAvatar = async (url) => {
        const storage = getStorage();
        const imageRef = ref(storage, url);
        const getUrl = await getDownloadURL(imageRef);

        setUserAvatar(getUrl);
    }

    const goToChat = async () => {
        params.channelId = channelId;
        params.nickname = userData.nickname;
        params.avatar = userAvatar;
        props.navigation.navigate('MyChat');
    }

    return (
        <TouchableOpacity style={styles.container}>
            <View style={{ flexDirection: "row" }}>
                <Image style={styles.avatar} source={userAvatar != null ? { uri: userAvatar } : require('../../assets/avatar-default.png')} />
                <View>
                    <Text style={styles.nickname}>{userData.nickname}</Text>
                    {isAdded ?
                        <Text style={styles.description}>{lastMessage}</Text>
                        :
                        <Text style={styles.description}>{userData.description}</Text>
                    }
                </View>
            </View>

            {isAdded ?
                <TouchableOpacity style={styles.user_button_added} onPress={goToChat}>
                    <MaterialCommunityIcons style={styles.user_button_icon_added} name='chat-processing' />
                </TouchableOpacity>
                :
                loadingButton ?
                    <View style={styles.user_loading_button}>
                        <ActivityIndicator color={"#ff0070"} />
                    </View>
                    :
                    <TouchableOpacity style={styles.user_button} onPress={addChat}>
                        <MaterialCommunityIcons style={styles.user_button_icon} name='chat-plus-outline' />
                    </TouchableOpacity>
            }
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        width: "100%",
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
    },
    nickname: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#e40068"
    },
    description: {
        fontSize: 14,
        color: 'white'
    },
    my_nickname: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#abf752"
    },
    user_button_added: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#ff0070",
        borderRadius: 10
    },
    user_loading_button: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderColor: "#65002c",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    user_button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    user_button_icon_added: {
        color: "#210016",
        fontSize: 30
    },
    user_button_icon: {
        color: "#e40068",
        fontSize: 23
    },
    followLabel: {
        color: "#ff0070",
        fontSize: 15,
        fontWeight: "bold"
    }
});