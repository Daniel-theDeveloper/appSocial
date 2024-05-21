import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, Image, SafeAreaView, StyleSheet } from 'react-native';
import { collection, addDoc, orderBy, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { database } from '../../utils/database';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { localUserLogin } from '../../utils/localstorage';
import { GiftedChat, Send, InputToolbar, Composer, Bubble, Day } from 'react-native-gifted-chat';
import { convertUniversalDate } from '../../utils/convertDate';
import { sendNotification } from '../../utils/interations';

export let params = {
    channelId: "",
    userId: "",
    userNickname: "Chat",
    avatar: null
}

export default function MyChat(props) {
    const [messages, setMessages] = useState([]);

    var renderSend = function (props) {
        return (
            React.createElement(Send, Object.assign({}, props, { containerStyle: { justifyContent: 'center' } }),
                React.createElement(Ionicons, { size: 25, color: '#ff0070', style: { marginLeft: 15, marginRight: 6 }, name: 'send' })
            )
        );
    };

    var renderInput = function (props) {
        return (
            React.createElement(InputToolbar, Object.assign({}, props, { containerStyle: { padding: 7, height: 60, backgroundColor: '#48002a' } }))
        );
    };

    var renderComposer = function (props) {
        return (
            React.createElement(Composer, Object.assign({}, props, { textInputAutoFocus: true, placeholder: "Escribe tu mensaje", placeholderTextColor: "#ff0070", textInputStyle: { color: 'white', backgroundColor: '#220014', borderRadius: 20, padding: 12 } }))
        );
    };

    var renderBubble = function (props) {
        return (
            React.createElement(Bubble, Object.assign({}, props, { wrapperStyle: { left: { padding: 3 }, right: { backgroundColor: '#ff0070', padding: 3 } } }))
        );
    };

    var renderDay = function (props) {
        return (
            React.createElement(Day, Object.assign({}, props, { textStyle: { color: '#ff0070', fontWeight: 'bold', fontSize: 14 } }))
        );
    };

    useLayoutEffect(() => {
        try {
            const collectionRef = collection(database, 'channels/' + params.channelId + '/chats');
            const q = query(collectionRef, orderBy('createAt', 'desc'));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setMessages(
                    QuerySnapshot.docs.map(doc => ({
                        _id: doc.data()._id,
                        createdAt: convertUniversalDate(doc.data().createAt),
                        text: doc.data().text,
                        user: {
                            _id: localUserLogin.id === doc.data().userID ? undefined : doc.data().userID,
                            name: doc.data().name,
                            avatar: localUserLogin.id === doc.data().userID ? localUserLogin.avatar : params.avatar
                        }
                    }))
                );
            });

            return unsuscribe;
        } catch (error) {
            console.error(error);
            goBack();
        }
    }, []);

    const goBack = () => {
        props.navigation.goBack()
    }

    const onSend = useCallback((messages = []) => {
        setMessages(previusMessage => GiftedChat.append(previusMessage, messages));

        const messageToSend = {
            _id: messages[0]._id,
            createAt: new Date(),
            text: messages[0].text,
            userID: localUserLogin.id,
            name: localUserLogin.username
        };
        sendNotification('message', params.userId, params.channelId, messageToSend.text);

        addDoc(collection(database, 'channels/' + params.channelId + '/chats'), messageToSend);
        setLastMessage(messages[0].text);
    }, []);

    const setLastMessage = async (lastMessage) => {
        try {
            const docRef = doc(database, "channels", params.channelId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { lastMessage: lastMessage });
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <SafeAreaView style={style.container}>
            <View style={style.headerChat}>
                <TouchableOpacity onPress={goBack}>
                    <MaterialCommunityIcons style={style.exitIcon} name='chevron-left' />
                </TouchableOpacity>

                <Text style={style.nickname}>{params.nickname}</Text>

                <Image style={style.avatar} source={params.avatar != null ? { uri: params.avatar } : require('../../assets/avatar-default.png')} />
            </View>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    id: localUserLogin.id,
                    name: localUserLogin.username,
                    avatar: localUserLogin.avatar
                }}
                scrollToBottom={true}
                renderSend={renderSend}
                renderInputToolbar={renderInput}
                renderComposer={renderComposer}
                renderBubble={renderBubble}
                renderDay={renderDay}
                messagesContainerStyle={{
                    backgroundColor: "#210016",
                    paddingBottom: 10
                }}
                timeTextStyle={{
                    left: { fontWeight: 'bold' },
                    right: { fontWeight: 'bold' }
                }}
                showAvatarForEveryMessage={false}
                showUserAvatar={false}
            />
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1
    },
    headerChat: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 58,
        padding: 8,
        backgroundColor: "#48002b",
        alignItems: 'center'
    },
    exitIcon: {
        fontSize: 45,
        color: 'white'
    },
    exitLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    nickname: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    avatar: {
        height: 41,
        width: 41,
        borderRadius: 100
    }
})