import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import { localUserLogin } from '../../utils/localstorage';
import { userId } from './Publish';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess } from '../../utils/interations';

// Tipo de seguidor:
// 0 - Usuario que me sigue
// 1 - Usuario que sigo
export default function UserList({ idUser, list_owner, followType, props }) {
    const [userData, setUserData] = useState({
        username: "",
        nickname: "",
        avatar: null,
        followingList: []
    });
    const [isFollowed, setIsFollowed] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);
    const [isMe, setIsMe] = useState(false);

    useEffect(() => {
        loadData();
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
                    avatar: docSnap.data().avatar,
                    followingList: docSnap.data().following
                });
                if (docSnap.data().avatar != null) {
                    await fetchImageAvatar(docSnap.data().avatar);
                }
                if (docSnap.data().username === localUserLogin.username) {
                    setIsMe(true);
                }
                setIsFollowed(isWasInteractedByID(docSnap.data().followers));
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

    const fetchImageAvatar = async (url) => {
        const storage = getStorage();
        const imageRef = ref(storage, url);
        const getUrl = await getDownloadURL(imageRef);

        setUserAvatar(getUrl);
    }

    function goDetails() {
        if (userData.username !== null) {
            userId.id = userData.username;
            props.navigation.replace('Perfil');
        } else {
            Alert.alert("Usuario eliminado", "Este usuario ya no existe");
        }
    }

    const startFollow = async () => {
        setIsFollowed(true)
        const res = await startFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(false);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
        }
    }

    const stopFollow = async () => {
        setIsFollowed(false);

        const res = await stopFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(true);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
        }
    }

    const deleteFollower = async () => {
        if (followType == 0) {
            const res = await deleteFollowerProcess(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
            }
        } else if (followType == 1) {
            const res = await stopFollow(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
            }
        } else {
            console.error("Tipo de seguidor invalido");
        }
    }

    return (
        <TouchableOpacity onPress={goDetails}>
            <View style={styles.container}>
                <Image style={styles.avatar} source={userAvatar != null ? { uri: userAvatar } : require('../../assets/avatar-default.png')} />

                {isMe ?
                    <Text style={styles.my_nickname}>{userData.nickname}</Text>
                    :
                    <Text style={styles.nickname}>{userData.nickname}</Text>
                }

                {userData.nickname === "Usuario eliminado" ?
                    <View></View>
                    :
                    list_owner === localUserLogin.username ?
                        <TouchableOpacity style={styles.user_button} onPress={deleteFollower}>
                            <MaterialCommunityIcons style={styles.user_button_icon} name='account-minus-outline' />
                            <Text style={styles.followLabel}>Eliminar</Text>
                        </TouchableOpacity>
                        :
                        userData.username === localUserLogin.username ?
                            <View></View>
                            :
                            isFollowed ?
                                <TouchableOpacity style={styles.user_button} onPress={stopFollow}>
                                    <MaterialCommunityIcons style={styles.user_button_icon} name='account-minus-outline' />
                                    <Text style={styles.followLabel}>Siguiendo</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={styles.user_button} onPress={startFollow}>
                                    <MaterialCommunityIcons style={styles.user_button_icon} name='account-multiple-plus-outline' />
                                    <Text style={styles.followLabel}>Seguir</Text>
                                </TouchableOpacity>
                }
            </View>
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
        height: 50,
        width: 50,
        borderRadius: 50,
    },
    nickname: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#e40068"
    },
    my_nickname: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#abf752"
    },
    user_button: {
        flexDirection: "row",
        paddingVertical: 8,
        minWidth: 133,
        justifyContent: "center",
        paddingHorizontal: 16,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    user_button_icon: {
        color: "#e40068",
        fontSize: 23,
        marginRight: 6
    },
    followLabel: {
        color: "#ff0070",
        fontSize: 15,
        fontWeight: "bold"
    }
});