import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
// import { publicationData } from './Publish';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import { useTheme } from '@react-navigation/native';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function ReplyPublish({ props, replyID }) {
    const [replyData, setReplyData] = useState({
        id: "",
        username: "",
        date: "",
        body: "",
        urlImages: null
    });
    const [isReplyDelete, setReplyDelete] = useState(false);
    const [replyImage, setReplyImage] = useState(null);
    const [replyAvatar, setReplyAvatar] = useState(null);
    const [replyNickname, setReplyNickname] = useState(null);
    const [replyUsername, setReplyUsername] = useState(null);
    const [replyFollows, setReplyFollows] = useState([]);
    const [onlyFollowers, setOnlyFollowers] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadReplyData();
    }, []);

    const loadReplyData = async () => {
        try {
            const docRef = doc(database, 'publications', replyID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (docSnap.data().status >= 3 && docSnap.data().status < 5) { // Carga si es publico o editado
                    setReplyData({
                        id: docSnap.id,
                        date: docSnap.data().date,
                        body: docSnap.data().body
                    });
                    await fetchImageReply(docSnap.data().urlImages);
                    await loadUserReplyData(docSnap.data().author);
                } else if (docSnap.data().status == 2) { // Verifica si es solo para seguidores
                    setOnlyFollowers(docSnap.data().userId === localUserLogin.id ? false : true); // Verifica si eres seguidor del autor
                    setReplyData({
                        id: docSnap.id,
                        date: docSnap.data().date,
                        body: docSnap.data().body
                    });
                    await fetchImageReply(docSnap.data().urlImages);
                    await loadUserReplyData(docSnap.data().author, docSnap.data().status);
                } else {
                    if (docSnap.data().userId === localUserLogin.id) { // Verifica si eres el dueño original
                        setReplyData({
                            id: docSnap.id,
                            date: docSnap.data().date,
                            body: docSnap.data().body
                        });
                        await fetchImageReply(docSnap.data().urlImages);
                        await loadUserReplyData(docSnap.data().author);
                    } else {
                        setReplyDelete(true);
                    }
                }
            } else {
                setReplyDelete(true);
            }
        } catch (error) {
            setReplyDelete(true);
            console.log(error);
        }
    }

    const fetchImageReply = async (url) => {
        if (url != null && url != undefined) {
            if (url.length != 0) {
                const storage = getStorage();
                const imageRef = ref(storage, url);
                const getUrl = await getDownloadURL(imageRef);
    
                setReplyImage(getUrl);
            }
        }
    }

    const fetchAvatarReply = async (url) => {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);

            setReplyAvatar(getUrl);
        }
    }

    const loadUserReplyData = async (author, status) => {
        try {
            const docSnap = await getDoc(author);

            if (docSnap.exists()) {
                setReplyNickname(docSnap.data().name);
                setReplyUsername(docSnap.data().username);
                setReplyFollows(docSnap.data().following);
                fetchAvatarReply(docSnap.data().avatar);
            } else {
                setReplyNickname('USUARIO ELIMINADO');
                setReplyFollows([]);
                fetchAvatarReply(null);
            }

            if (status == 2) {
                if (docSnap.data().following.includes(localUserLogin.id)) {
                    setOnlyFollowers(false);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    function goDetails() {
        props.navigation.navigate({ name: 'Details', params: { id: replyID, nickname: replyNickname, avatar: replyAvatar }, merge: true });
    }

    return (
        <View>
            {isReplyDelete ?
                <View style={{ padding: 10, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 4, }}>
                    <View style={styles.replyTitleBlock}>
                        <MaterialCommunityIcons style={{ marginRight: 10, color: colors.primary, fontSize: 24 }} name='alert-box-outline' />
                        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>{t('noPublishFound')}</Text>
                    </View>
                </View>
                :
                onlyFollowers ?
                    <View style={{ padding: 10, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 4, }}>
                        <View style={styles.replyTitleBlock}>
                            <MaterialCommunityIcons style={{ marginRight: 10, color: colors.primary, fontSize: 24 }} name='account-multiple-check-outline' />
                            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>{t('onlyFollowersPart1') + replyNickname + t('onlyFollowersPart2')}</Text>
                        </View>
                    </View>
                    :
                    <View style={{ padding: 10, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 4, }}>
                        <TouchableOpacity onPress={goDetails}>
                            {/* Reply header */}
                            <View style={styles.replyTitleBlock}>
                                <MaterialCommunityIcons style={{ marginRight: 10, color: colors.primary, fontSize: 24 }} name='reply-outline' />
                                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>{t('respondingTo')}</Text>
                            </View>

                            {/* Reply body header */}
                            {replyData.username === localUserLogin.username ?
                                <View style={styles.reply_usernames_container}>
                                    <View style={styles.perfil_usernames_block}>
                                        <Text style={{ marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary }}>{replyNickname}</Text>
                                        <Text style={{ marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary }}>-</Text>
                                        <Text style={{ fontSize: 16, color: colors.tertiary_dark }}>@{replyData.username}</Text>
                                    </View>
                                    <Text style={{ fontSize: 12, fontWeight: "bold", color: "#7e8d3d" }}>{convertDate(replyData.date)}</Text>
                                </View>
                                :
                                <View style={styles.reply_usernames_container}>
                                    <View style={styles.perfil_usernames_block}>
                                        <Text style={{ marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary }}>{replyNickname}</Text>
                                        <Text style={{ marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary }}>-</Text>
                                        <Text style={{ fontSize: 16, color: colors.primary }}>@{replyUsername}</Text>
                                    </View>
                                    <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(replyData.date)}</Text>
                                </View>
                            }

                            {/* Reply body */}
                            <Text style={{ fontSize: 15, marginBottom: 15, color: colors.text }}>{replyData.body}</Text>
                            {replyImage != null ?
                                <Image style={styles.publication_image} source={{ uri: replyImage }} />
                                :
                                <View></View>
                            }
                        </TouchableOpacity>

                    </View>
            }
        </View>
    );
}


const styles = StyleSheet.create({
    replyTitleBlock: {
        flexDirection: "row",
        alignItems: "center"
    },
    reply_usernames_container: {
        flexDirection: "column"
    },
    perfil_usernames_block: {
        flexDirection: "row",
    },
    publication_image: {
        height: 200,
        width: "100%",
        marginBottom: 15,
        borderRadius: 15
    }

});