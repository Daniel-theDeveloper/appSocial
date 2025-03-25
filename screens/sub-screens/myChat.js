import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, Image, SafeAreaView, StyleSheet } from 'react-native';
import { collection, addDoc, orderBy, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';

import { database } from '../../utils/database';

import { localUserLogin } from '../../utils/localstorage';
import { GiftedChat, Send, InputToolbar, Composer, Bubble, Day } from 'react-native-gifted-chat';
import { convertUniversalDate } from '../../utils/convertDate';
import { sendNotification } from '../../utils/interations';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

// import Chat from '../components/chatComponent';

export default function MyChat(props) {
    const [messages, setMessages] = useState([]);
    const [deleteUser] = useState(props.route.params?.isDelete);

    const { colors } = useTheme();
    const { t } = useTranslation();

    var renderSend = function (props) {
        return (
            React.createElement(Send, Object.assign({}, props, { containerStyle: { justifyContent: 'center' } }),
                React.createElement(Ionicons, { size: 25, color: colors.primary, style: { marginLeft: 15, marginRight: 6 }, name: 'send' })
            )
        );
    };

    var renderInput = function (props) {
        return (
            React.createElement(InputToolbar, Object.assign({}, props, { containerStyle: { padding: 7, height: 60, backgroundColor: colors.primary_dark } }))
        );
    };

    var renderComposer = function (props) {
        if (deleteUser) {
            // Usuario eliminado o bloqueado
            return (
                React.createElement(Composer, Object.assign({}, props, { disableComposer: true, textInputAutoFocus: true, placeholder: t('noMoreChat'), placeholderTextColor: colors.primary, textInputStyle: { color: colors.text, backgroundColor: colors.background, borderRadius: 20, padding: 12 } }))
            );
        } else {
            // Usuario normal
            return (
                React.createElement(Composer, Object.assign({}, props, { textInputAutoFocus: true, placeholder: t('newMessage'), placeholderTextColor: colors.primary, textInputStyle: { color: colors.text, backgroundColor: colors.background, borderRadius: 20, padding: 12 } }))
            );
        }
    };

    var renderBubble = function (props) {
        return (
            React.createElement(Bubble, Object.assign({}, props, { wrapperStyle: { left: { padding: 3, backgroundColor: '#fff' }, right: { backgroundColor: colors.chat, padding: 3 } } }))
        );
    };

    var renderDay = function (props) {
        return (
            React.createElement(Day, Object.assign({}, props, { textStyle: { color: colors.primary, fontWeight: 'bold', fontSize: 14 } }))
        );
    };

    useLayoutEffect(() => {
        try {
            const collectionRef = collection(database, 'channels/' + props.route.params?.channelId + '/chats');
            const q = query(collectionRef, orderBy('createAt', 'desc'));

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                setMessages(
                    QuerySnapshot.docs.map(doc => ({
                        _id: doc.data()._id,
                        createdAt: convertUniversalDate(doc.data().createAt),
                        text: doc.data().text,
                        user: {
                            _id: localUserLogin.id === doc.data().userID ? undefined : doc.data().userID,
                            name: doc.data().name,
                            avatar: localUserLogin.id === doc.data().userID ? localUserLogin.avatar : props.route.params?.avatar
                        }
                    }))
                );
            });

            return unsubscribe;
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
        sendNotification('message', props.route.params?.userId, props.route.params?.channelId, messageToSend.text);

        addDoc(collection(database, 'channels/' + props.route.params?.channelId + '/chats'), messageToSend);
        setLastMessage(messages[0].text);
    }, []);

    const setLastMessage = async (lastMessage) => {
        try {
            const docRef = doc(database, "channels", props.route.params?.channelId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, { lastMessage: lastMessage });
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <SafeAreaView style={style.container}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: 58,
                padding: 8,
                backgroundColor: colors.primary_dark,
                alignItems: 'center'
            }}>
                <TouchableOpacity onPress={goBack}>
                    <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                </TouchableOpacity>

                {props.route.params?.isDelete ?
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{t('noUser')}</Text>
                    :
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{props.route.params?.userNickname}</Text>
                }

                <Image style={style.avatar} source={props.route.params?.avatar != null ? { uri: props.route.params?.avatar } : require('../../assets/avatar-default.png')} />
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
                    backgroundColor: colors.background,
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
    avatar: {
        height: 41,
        width: 41,
        borderRadius: 100
    }
})