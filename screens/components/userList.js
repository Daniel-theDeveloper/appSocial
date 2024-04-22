import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

export default function UserList(idUser, props) {
    const [userData, setUserData] = useState({
        username: "",
        nickname: "",
        avatar: null
    });
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        console.log(idUser);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const docRef = doc(database, "users", idUser)
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserAvatar({
                    username: docSnap.data().username,
                    nickname: docSnap.data().name,
                    avatar: docSnap.data().avatar
                })
            } else {
                setUserData({
                    username: null,
                    nickname: "Usuario no encontrado o eliminado",
                    avatar: null
                })
            }

            if (userData.avatar != null) {
                const storage = getStorage();
                const imageRef = ref(storage, userData.avatar);
                const getUrl = await getDownloadURL(imageRef);

                setUserAvatar(getUrl);
            }
        } catch (error) {
            console.error(error);
        }
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
        alignItems: "center"
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