import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

import { localUserLogin } from '../../utils/localstorage';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess, fetchImage } from '../../utils/interations';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@react-navigation/native';
// Tipo de seguidor:
// 0 - Usuario que me sigue
// 1 - Usuario que sigo
// Si es sugerencia para chatear: 2
export default function UserList({ idUser, list_owner, followType, props }) {
    const [deleteUser, setDeleteUser] = useState(false);

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
    const { t } = useTranslation();

    useEffect(() => {
        const isBlock = localUserLogin.blackList.includes(idUser) || localUserLogin.blockUsers.includes(idUser);

        if (!isBlock) {
            loadData();
        } else {
            setDeleteUser(true);
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
                    nickname: t('noUser'),
                    avatar: null
                });
                setDeleteUser(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function goDetails() {
        if (!deleteUser) {
            if (followType === 2) {
                props.navigation.navigate({ name: 'Perfil', params: { userId: userData.id }, merge: true });
            } else if (userData.username !== null) {
                props.navigation.replace('Perfil', { userId: userData.id });
            } else {
                // Alert.alert("Usuario eliminado", "Este usuario ya no existe");
            }
        }
    }

    const startFollow = async () => {
        setIsFollowed(true)
        const res = await startFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(false);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const stopFollow = async () => {
        setIsFollowed(false);

        const res = await stopFollowProcess(userData.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(true);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const deleteFollower = async () => {
        if (followType == 0) {
            const res = await deleteFollowerProcess(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
        } else if (followType == 1) {
            const res = await stopFollow(userData.id, localUserLogin.id);

            if (res == false) {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
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
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.tertiary }}>{userData.nickname}</Text>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.tertiary_dark }}>@{userData.username}</Text>
                        </View>
                        :
                        !deleteUser ?
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.secondary }}>{userData.nickname}</Text>
                            <Text style={{ fontSize: 16, color: colors.primary }}>@{userData.username}</Text>
                        </View>
                        :
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.secondary_dark, fontStyle: 'italic' }}>{t('noUser')}</Text>
                            <Text style={{ fontSize: 16, color: colors.secondary_dark, fontStyle: 'italic' }}>{t('noUserHelp')}</Text>
                        </View>
                    }
                </View>
                {deleteUser ?
                    <View></View>
                    :
                    list_owner === localUserLogin.username ?
                        <TouchableOpacity style={{ flexDirection: "row", paddingVertical: 8, minWidth: 110, justifyContent: "center", alignItems: 'center', backgroundColor: colors.text_error, borderRadius: 14 }} onPress={deleteFollower}>
                            <MaterialCommunityIcons style={{ color: colors.text_button, fontSize: 22, marginRight: 6 }} name='account-minus-outline' />
                            <Text style={{ color: colors.text_button, fontSize: 14, fontWeight: "bold" }}>{t('deleteCommon')}</Text>
                        </TouchableOpacity>
                        :
                        userData.username === localUserLogin.username ?
                            <View></View>
                            :
                            isFollowed ?
                                <TouchableOpacity style={{ flexDirection: "row", paddingVertical: 8, minWidth: 110, justifyContent: "center", backgroundColor: colors.quartet, borderRadius: 14}} onPress={stopFollow}>
                                    <MaterialCommunityIcons style={{ color: colors.text_button, fontSize: 20, marginRight: 6 }} name='account-minus-outline' />
                                    <Text style={{ color: colors.text_button, fontSize: 14, fontWeight: "bold" }}>{t('following')}</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={{ flexDirection: "row", paddingVertical: 8, minWidth: 110, justifyContent: "center", backgroundColor: colors.quartet, borderRadius: 14}} onPress={startFollow}>
                                    <MaterialCommunityIcons style={{ color: colors.text_button, fontSize: 20, marginRight: 6 }} name='account-multiple-plus-outline' />
                                    <Text style={{ color: colors.text_button, fontSize: 14, fontWeight: "bold" }}>{t('follow')}</Text>
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