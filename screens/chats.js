import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import { doc, getDoc, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { database } from '../utils/database';
import UserChatList from './components/userChatList';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../utils/localstorage';
import { useTheme } from '@react-navigation/native';

import '../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Chats(props) {
    const [suggestionList, setSuggestionList] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [anotherChatList, setAnotherChatList] = useState([]);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadAllCanChat().then(() => {
            loadAnotherCanChat().then(() => {
                loadUserData();
            });
        });
    }, []);

    const loadAllCanChat = async () => {
        try {
            const collectionRef = collection(database, 'channels');
            const q = query(collectionRef, where("userId1", "==", localUserLogin.id));

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                setChatList(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        userId: doc.data().userId2,
                    }))
                )
            })

            return unsubscribe;
        } catch (error) {
            console.error(error);
        }
    }

    const loadAnotherCanChat = async () => {
        try {
            const collectionRef = collection(database, 'channels');
            const q = query(collectionRef, where("userId2", "==", localUserLogin.id));

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                setAnotherChatList(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        userId: doc.data().userId1,
                    }))
                )
            });

            return unsubscribe;
        } catch (error) {
            console.error(error);
        }
    }

    const loadUserData = async () => {
        try {
            let completedList = [];
            let initiatedChat = [];

            // Obteniendo lista de usuarios que ya se iniciaron un chat
            const channels = collection(database, "channels");
            const querySnapshot = await getDocs(channels);

            querySnapshot.forEach((doc) => {
                if (doc.data().userId1 == localUserLogin.id) {
                    initiatedChat.push(doc.data().userId2);
                }
                if (doc.data().userId2 == localUserLogin.id) {
                    initiatedChat.push(doc.data().userId1);
                }
            });

            // Armando la lista de sugerencias
            const docRef = doc(database, "users", localUserLogin.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                docSnap.data().followers.forEach(user => { if (!initiatedChat.includes(user)) { completedList.push(user) } });
                docSnap.data().following.forEach(user => { if (!initiatedChat.includes(user)) { if (!completedList.includes(user)) { completedList.push(user) } } });

                // Guardando los resultados en el hook
                setSuggestionList(completedList);
            } else {
                console.error("Sin conexión");
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    return (
        <ScrollView style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background, padding: 15 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.primary, }}>Chats</Text>

            <Text style={{ marginVertical: 15, fontSize: 21, fontWeight: "bold", color: colors.text }}>{t('ChatsTitle')}</Text>

            {chatList.length == 0 && anotherChatList.length == 0 ?
                <View style={styles.empty_components}>
                    <MaterialCommunityIcons style={{ color: colors.primary_dark_alternative, fontSize: 80, marginBottom: 10 }} name='chat-alert-outline' />
                    <Text style={{ color: colors.primary_dark_alternative, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('noChatsTitle')}</Text>
                    <Text style={{ color: colors.primary_dark_alternative, fontSize: 18, textAlign: "center", }}>{t('noChats')}</Text>
                </View>
                :
                chatList.map((data, key) => (<UserChatList key={key} props={props} idUser={data.userId} isAdded={true} channelId={data.id} />))
            }
            {anotherChatList.length != 0 ?
                anotherChatList.map((data, key) => (<UserChatList key={key} props={props} idUser={data.userId} isAdded={true} channelId={data.id} />))
                :
                <View></View>
            }

            {suggestionList.length != 0 ?
                <View>
                    <Text style={{ marginVertical: 15, fontSize: 21, fontWeight: "bold", color: colors.text }}>{t('suggestions')}</Text>
                    {suggestionList.map((following, key) => (<UserChatList key={key} props={props} idUser={following} isAdded={false} channelId={null} />))}
                </View>
                :
                <View></View>
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 250
    }
})