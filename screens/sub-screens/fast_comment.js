import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { publication_selected } from '../components/Publish';
import { localUserLogin } from '../../utils/localstorage';
import { publicationData } from '../components/Publish';
import { sendNotification } from '../../utils/interations';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from 'react-native-modalbox';
import EmojiSelector from 'react-native-emoji-selector';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function FastComment(props) {
    const [avatarURL] = useState(publication_selected.avatar);
    const [myAvatarURL] = useState(localUserLogin.avatar);

    const [myComment, setMyComment] = useState("");
    const [loadingButton, setLoadingButton] = useState(false);
    const [emojiModal, setEmojiModal] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const sendMyComment = async () => {
        if (myComment !== "") {
            setLoadingButton(true);
            const commentArray = {
                comment_answers: [],
                date: new Date(),
                dislikes: [],
                likes: [],
                message: myComment,
                user: localUserLogin.username
            }
            try {
                const docRef = doc(database, 'publications', publicationData.id);
                await updateDoc(docRef, {
                    comments_container: arrayUnion(commentArray)
                });
                if (publicationData.userId !== localUserLogin.id) {
                    await sendNotification('comment', publication_selected.userId, publicationData.id, myComment);
                }
                setLoadingButton(false);
                props.navigation.goBack();
            } catch (error) {
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            console.log("Escribe algo")
        }
    }

    function goBackAgain() {
        props.navigation.goBack();
    }

    function openEmojiModal() {
        if (emojiModal) {
            setEmojiModal(false);
        } else {
            setEmojiModal(true);
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background, paddingBottom: 40, paddingHorizontal: 12 }}>
            <TouchableOpacity onPress={goBackAgain}>
                <View style={styles.back_block}>
                    <MaterialCommunityIcons style={{ fontSize: 50, color: colors.secondary }} name='chevron-left' />
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.secondary }}>{t('return')}</Text>
                </View>
            </TouchableOpacity>
            <View style={{ backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20 }}>
                {/* header */}
                <View style={styles.perfil_header}>
                    <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                    <View style={styles.perfil_usernames_container}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.secondary }}>{publication_selected.user}{t('commentedLabel')}</Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(publication_selected.date)}</Text>
                    </View>
                </View>

                {/* body */}
                <Text style={{ fontSize: 18, marginBottom: 15, color: colors.text }}>{publication_selected.body}</Text>

                {/* footer */}
                <View style={styles.statistics}>
                    <View style={styles.statistics_block}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>{publication_selected.likes}</Text>
                        <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{t('likes')}</Text>
                    </View>
                </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 20, color: colors.primary }}>{t('commentLabel')}</Text>

            <View style={{ backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20 }}>
                <View style={styles.reply_row}>
                    <Image style={styles.avatar} source={myAvatarURL != null ? { uri: myAvatarURL } : require('../../assets/avatar-default.png')} />
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: "bold", color: colors.secondary }}>{localUserLogin.nickname}</Text>
                </View>

                <View style={{
                    backgroundColor: colors.background,
                    marginVertical: 10,
                    minHeight: 100,
                    maxHeight: 300,
                    borderRadius: 10,
                    padding: 5
                }}>
                    <TextInput
                        style={{fontSize: 17, color: colors.text}}
                        placeholder={t('createComment')}
                        placeholderTextColor={colors.holderText}
                        multiline={true}
                        autoFocus={true}
                        onChangeText={(text) => setMyComment(text)}
                        value={myComment}
                        maxLength={200} />
                </View>

                <View style={styles.reply_row2}>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{myComment.length} / 200</Text>
                        <TouchableOpacity onPress={openEmojiModal}>
                            <MaterialCommunityIcons style={{ marginLeft: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='emoticon-happy-outline' />
                        </TouchableOpacity>
                    </View>
                    {loadingButton ?
                        <View style={{ flexDirection: "row", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sending')}</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sendMyComment}>
                            <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.quartet }}>
                                <Text style={{ fontSize: 16, marginHorizontal: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sendComment')}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
            </View>

            <Modal style={{ alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark }} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{ height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary }}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setMyComment( myComment + emoji )} />
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    back_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
    },
    perfil_header: {
        flexDirection: "row",
        marginBottom: 10
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    statistics: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statistics_block: {
        flexDirection: "row"
    },
    reply_row: {
        flexDirection: "row"
    },
    reply_row2: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    loadingSpinner: {
        marginRight: 10
    },
})