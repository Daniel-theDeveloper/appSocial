import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { fetchImage } from '../../utils/interations';
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
    const [replyImage, setReplyImage] = useState([]);
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

            if (!docSnap.exists()) {
                setReplyDelete(true);
                return;
            }

            const data = docSnap.data();
            const isBlock = localUserLogin.blackList.includes(data.userId) || localUserLogin.blockUsers.includes(data.userId);

            if (!isBlock) {
                const isOwner = data.userId === localUserLogin.id;
                const isPublicOrEdited = data.status >= 3 && data.status < 5;
                const isFollowersOnly = data.status === 2;

                if (isPublicOrEdited || (isFollowersOnly && isOwner)) {
                    setReplyData({
                        id: docSnap.id,
                        date: data.date,
                        body: data.body
                    });

                    if (data.urlImages != null) {
                        await fetchImageReply(data.urlImages);
                    }

                    await loadUserReplyData(data.author, data.status);
                    setOnlyFollowers(isFollowersOnly && !data.following.includes(localUserLogin.id));
                } else if (isOwner) {
                    setReplyData({
                        id: docSnap.id,
                        date: data.date,
                        body: data.body
                    });

                    if (data.urlImages != null) {
                        await fetchImageReply(data.urlImages);
                    }

                    await loadUserReplyData(data.author);
                } else {
                    setReplyDelete(true);
                }
            } else {
                setReplyDelete(true);
            }

        } catch (error) {
            setReplyDelete(true);
            console.error(error);
        }
    }

    const fetchImageReply = async (url) => {
        if (url != null && url != undefined) {
            // if (url.length != 0) {
            //     const storage = getStorage();
            //     const imageRef = ref(storage, url);
            //     const getUrl = await getDownloadURL(imageRef);

            //     setReplyImage(getUrl);
            // }
            let loadURLImages = [];

            for (let x = 0; x < url.length; x++) {
                loadURLImages.push(await fetchImage(url[x]));
            }
            setReplyImage(loadURLImages);
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
                        <View style={{ width: "80%" }}>
                            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>{t('noPublishFound')}</Text>
                        </View>
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
                                <View style={{ width: "80%" }}>
                                    <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>{t('respondingTo')}</Text>
                                </View>
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
                            {/* {replyImage != null ?
                                <Image style={styles.publication_image} source={{ uri: replyImage }} />
                                :
                                <View></View>
                            } */}
                            {replyImage != null ?
                                replyImage.length === 1 ?
                                    <Image style={{ height: 200, width: "100%", marginBottom: 15, borderRadius: 15 }} source={{ uri: replyImage[0] }} />
                                    :
                                    replyImage.length === 2 ?
                                        <View style={styles.images_container}>
                                            <Image style={{ marginRight: 3, height: 200, width: "49%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: replyImage[0] }} />
                                            <Image style={{ marginLeft: 3, height: 200, width: "49%", borderTopRightRadius: 15, borderBottomRightRadius: 15 }} source={{ uri: replyImage[1] }} />
                                        </View>
                                        :
                                        replyImage.length === 3 ?
                                            <View style={styles.images_container}>
                                                <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: replyImage[0] }} />
                                                <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                    <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: replyImage[1] }} />
                                                    <Image style={{ marginTop: 3, height: "48.5%", borderBottomRightRadius: 15 }} source={{ uri: replyImage[2] }} />
                                                </View>
                                            </View>
                                            :
                                            replyImage.length > 3 ?
                                                <View style={styles.images_container}>
                                                    <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: replyImage[0] }} />
                                                    <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                        <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: replyImage[1] }} />
                                                        <ImageBackground source={{ uri: replyImage[2] }} imageStyle={{ opacity: 0.5, resizeMode: "cover", height: "100%", borderBottomRightRadius: 15 }} style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, height: "48.5%", borderBottomRightRadius: 15, backgroundColor: "#1f1f1f" }}>
                                                            <Text style={{ color: "white", fontSize: 36, }}>+{replyImage.length - 3}</Text>
                                                        </ImageBackground>
                                                    </View>
                                                </View>
                                                :
                                                <View></View>
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
    images_container: {
        display: "flex",
        flexDirection: "row",
        maxHeight: 210,
        marginBottom: 15
    }
});