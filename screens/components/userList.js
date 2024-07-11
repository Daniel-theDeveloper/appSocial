import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import { localUserLogin } from '../../utils/localstorage';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess, fetchImage } from '../../utils/interations';

import { useTheme } from '@react-navigation/native';
// Tipo de seguidor:
// 0 - Usuario que me sigue
// 1 - Usuario que sigo
// Si es sugerencia para chatear: 2
export default function UserList({ idUser, list_owner, followType, props }) {
    const [userData, setUserData] = useState({
        id: "",
        username: "",
        nickname: "",
        avatar: null,
        followingList: []
    });
    const [isFollowed, setIsFollowed] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);
    const [isMe, setIsMe] = useState(false);

    const { colors } = useTheme();

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
                    setUserAvatar(await fetchImage(docSnap.data().avatar));
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

    function goDetails() {
        if (followType === 2) {
            props.navigation.navigate({ name: 'Perfil', params: { userId: userData.id }, merge: true });
        } else if (userData.username !== null) {
            props.navigation.replace('Perfil', { userId: userData.id });
        } else {
            Alert.alert("Usuario eliminado", "Este usuario ya no existe");
        }
    }

    const startFollow = async () => {
        setIsFollowed(true)
        const res = await startFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(false);
            Alert.alert("Error en el servidor", "Vuélvalo a intentar mas tarde");
        }
    }

    const stopFollow = async () => {
        setIsFollowed(false);

        const res = await stopFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(true);
            Alert.alert("Error en el servidor", "Vuélvalo a intentar mas tarde");
        }
    }

    const deleteFollower = async () => {
        if (followType == 0) {
            const res = await deleteFollowerProcess(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert("Error en el servidor", "Vuélvalo a intentar mas tarde");
            }
        } else if (followType == 1) {
            const res = await stopFollow(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert("Error en el servidor", "Vuélvalo a intentar mas tarde");
            }
        } else {
            console.error("Tipo de seguidor invalido");
        }
    }

    return (
        <TouchableOpacity onPress={goDetails}>
            <View style={styles.container}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                    <Image style={styles.avatar} source={userAvatar != null ? { uri: userAvatar } : require('../../assets/avatar-default.png')} />

                    {isMe ?
                        <Text style={{fontSize: 16, fontWeight: "bold", color: colors.tertiary}}>{userData.nickname}</Text>
                        :
                        <Text style={{fontSize: 16, fontWeight: "bold", color: colors.primary}}>{userData.nickname}</Text>
                    }
                </View>
                {userData.nickname === "Usuario eliminado" ?
                    <View></View>
                    :
                    list_owner === localUserLogin.username ?
                        <TouchableOpacity style={{flexDirection: "row", paddingVertical: 8, minWidth: 130, justifyContent: "center", paddingHorizontal: 16, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2}} onPress={deleteFollower}>
                            <MaterialCommunityIcons style={{color: colors.primary, fontSize: 20, marginRight: 6}} name='account-minus-outline' />
                            <Text style={{color: colors.primary, fontSize: 14, fontWeight: "bold"}}>Eliminar</Text>
                        </TouchableOpacity>
                        :
                        userData.username === localUserLogin.username ?
                            <View></View>
                            :
                            isFollowed ?
                                <TouchableOpacity style={{flexDirection: "row", paddingVertical: 8, minWidth: 130, justifyContent: "center", paddingHorizontal: 16, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2}} onPress={stopFollow}>
                                    <MaterialCommunityIcons style={{color: colors.primary, fontSize: 20, marginRight: 6}} name='account-minus-outline' />
                                    <Text style={{color: colors.primary, fontSize: 14, fontWeight: "bold"}}>Siguiendo</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={{flexDirection: "row", paddingVertical: 8, minWidth: 130, justifyContent: "center", paddingHorizontal: 16, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2}} onPress={startFollow}>
                                    <MaterialCommunityIcons style={{color: colors.primary, fontSize: 20, marginRight: 6}} name='account-multiple-plus-outline' />
                                    <Text style={{color: colors.primary, fontSize: 14, fontWeight: "bold"}}>Seguir</Text>
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
        height: 45,
        width: 45,
        borderRadius: 50,
        marginRight: 10
    }
});