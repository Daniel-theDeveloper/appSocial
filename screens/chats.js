import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { database } from '../utils/database';
import UserChatList from './components/userChatList';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../utils/localstorage';

export default function Chats(props) {
    const [suggestionList, setSuggestionList] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [anotherChatList, setAnotherChatList] = useState([]);

    useEffect(() => {
        loadUserData();
        loadAllCanChat();
        loadAnotherCanChat();
    }, []);

    function loadAllCanChat() {
        try {
            const collectionRef = collection(database, 'channels');
            const q = query(collectionRef, where("userId1", "==", localUserLogin.id));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setChatList(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        userId: doc.data().userId2,
                    }))
                )
            })

            return unsuscribe;
        } catch (error) {
            console.error(error);
        }
    }

    function loadAnotherCanChat() {
        try {
            const collectionRef = collection(database, 'channels');
            const q = query(collectionRef, where("userId2", "==", localUserLogin.id));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setAnotherChatList(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        userId: doc.data().userId1,
                    }))
                )
            });

            return unsuscribe;
        } catch (error) {
            console.error(error);
        }
    }

    const loadUserData = async () => {
        try {
            const docRef = doc(database, "users", localUserLogin.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setSuggestionList(docSnap.data().noChats);
            } else {
                console.error("Sin conexion");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chats</Text>

            <Text style={styles.sub_title}>Mensajes</Text>

            {chatList.length == 0 && anotherChatList.length == 0 ?
                <View style={styles.empty_components}>
                    <MaterialCommunityIcons style={styles.empty_icon} name='chat-alert-outline' />
                    <Text style={styles.empty_Title}>Sin nadie con quien chatear</Text>
                    <Text style={styles.empty_subtitle}>Comience a seguir gente para chatear</Text>
                </View>
                :
                chatList.map((data, key) => (<UserChatList key={key} props={props} idUser={data.userId} isAdded={true} channelId={data.id} />))
            }
            {anotherChatList.length != 0 ?
                anotherChatList.map((data, key) => (<UserChatList key={key} props={props} idUser={data.userId} isAdded={true} channelId={data.id} />))
                :
                <View></View>
            }

            <Text style={styles.sub_title}>Sugerencias</Text>
            {suggestionList.map((following, key) => (<UserChatList key={key} props={props} idUser={following} isAdded={false} channelId={null} />))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016",
        padding: 15
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#ed007e",
    },
    sub_title: {
        marginVertical: 15,
        fontSize: 21,
        fontWeight: "bold",
        color: "white"
    },
    empty_icon: {
        color: "#a00055",
        fontSize: 80,
        marginBottom: 10
    },
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 250
    },
    empty_Title: {
        color: "#ed007e",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },
    empty_subtitle: {
        color: "#a00055",
        fontSize: 18,
        textAlign: "center",
    }
})