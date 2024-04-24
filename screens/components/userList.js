import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

export default function UserList({idUser, props}) {
    const [userData, setUserData] = useState({
        username: "",
        nickname: "",
        avatar: null
    });
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const docRef = doc(database, "users", idUser)
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserData({
                    username: docSnap.data().username,
                    nickname: docSnap.data().name,
                    avatar: docSnap.data().avatar
                });
                if (userData.avatar != null) {
                    await fetchImageAvatar(userData.avatar);
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

    const fetchImageAvatar = async (url) => {
        const storage = getStorage();
        const imageRef = ref(storage, url);
        const getUrl = await getDownloadURL(imageRef);
        
        setUserAvatar(getUrl);
    }

    return (
        <View style={styles.container}>
            <Image style={styles.avatar} source={userAvatar != null ? { uri: userAvatar } : require('../../assets/avatar-default.png')} />
            <Text style={styles.nickname}>{userData.nickname}</Text>
            <View style={styles.deleteButton}>
                <MaterialCommunityIcons style={styles.deleteIcon} name='account-minus-outline' />
            </View>
        </View>
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
    deleteButton: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    deleteIcon: {
        color: "#e40068",
        fontSize: 24
    }
});