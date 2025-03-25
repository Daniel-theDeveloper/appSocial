import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { localUserLogin } from '../../utils/localstorage';
import { sendNotification } from '../../utils/interations';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import Modal from 'react-native-modalbox';
// import EmojiSelector from 'react-native-emoji-selector';

import { addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { database } from '../../utils/database';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function FastComment(props) {
    const [avatarURL] = useState(props.route.params?.publish.avatar);
    const [myAvatarURL] = useState(localUserLogin.avatar);

    const [urlMedia, setUrlMedia] = useState(null);
    const [mediaName, setMediaName] = useState(null);

    const [showMediaComment, setShowMediaComment] = useState(true);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const [myComment, setMyComment] = useState("");
    const [loadingButton, setLoadingButton] = useState(false);
    // const [emojiModal, setEmojiModal] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const publicationData = props.route.params?.publish;

    const submitImageComment = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            setLoadingMedia(true);
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: false,
                allowsEditing: true,
                quality: 0.1,
                aspect: [4, 3],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            if (image.canceled) {
                setLoadingMedia(false);
            } else {
                setUrlMedia(image.assets[0].uri);
                setMediaName(image.assets[0].fileName);
                setLoadingMedia(false);
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    const pickPhotoComment = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();

        if (granted) {
            setLoadingMedia(true);
            const image = await ImagePicker.launchCameraAsync({
                allowsMultipleSelection: false,
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 0.1,
            });

            if (image.canceled) {
                setLoadingMedia(false);
            } else {
                setUrlMedia(image.assets[0].uri);
                setMediaName(image.assets[0].fileName);
                setLoadingMedia(false);
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    function deleteImageComment() {
        setUrlMedia(null);
        setLoadingMedia(false);
        setShowMediaComment(true);
    }

    const sendMyComment = async () => {
        if (myComment !== "") {
            setLoadingButton(true);
            let pathImage = null;

            try {
                if (urlMedia != null) {
                    const url = localUserLogin.username + "/publicationImages/" + publicationData.id + "/imagesComment/" + mediaName;

                    const response = await fetch(urlMedia);
                    const blob = await response.blob();
                    const storage = getStorage();
                    const storageRef = ref(storage, url);

                    const snapshot = await uploadBytes(storageRef, blob);

                    pathImage = snapshot.ref.fullPath;
                }

                const commentArray = {
                    // comment_answers: [],
                    date: new Date(),
                    dislikes: [],
                    likes: [],
                    mediaURL: pathImage,
                    message: myComment,
                    user: localUserLogin.id
                }

                // const docRef = doc(database, 'publications', publicationData.id);
                // await updateDoc(docRef, {
                //     comments_container: arrayUnion(commentArray)
                // });
                // if (publicationData.userId !== localUserLogin.id) {
                //     await sendNotification('comment', publicationData.userId, publicationData.id, myComment);
                // }
                const url = "publications/" + publicationData.id + "/comments";
                await addDoc(collection(database, url), commentArray);

                await sendNotification('comment', publicationData.userId, publicationData.id, myComment);

                setLoadingButton(false);
                props.navigation.goBack();
            } catch (error) {
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            Alert.alert(t('emptyPublishTitle'), t('emptyPublish'));
        }
    }

    function goBackAgain() {
        props.navigation.goBack();
    }

    // function openEmojiModal() {
    //     if (emojiModal) {
    //         setEmojiModal(false);
    //     } else {
    //         setEmojiModal(true);
    //     }
    // }

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
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.secondary }}>{publicationData.user}{t('commentedLabel')}</Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(publicationData.date)}</Text>
                    </View>
                </View>

                {/* body */}
                <Text style={{ fontSize: 18, marginBottom: 15, color: colors.text }}>{publicationData.body}</Text>

                {/* footer */}
                <View style={styles.statistics}>
                    <View style={styles.statistics_block}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>{publicationData.likes}</Text>
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
                        style={{ fontSize: 17, color: colors.text }}
                        placeholder={t('createComment')}
                        placeholderTextColor={colors.holderText}
                        multiline={true}
                        autoFocus={true}
                        onChangeText={(text) => setMyComment(text)}
                        value={myComment}
                        maxLength={200} />

                    {urlMedia != null ?
                        !loadingMedia ?
                            <View style={{ width: 200, height: 150 }}>
                                <Image style={{ width: 200, height: 150, borderRadius: 10 }} source={{ uri: urlMedia }} />
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, padding: 3, borderRadius: 20, backgroundColor: "black" }} onPress={deleteImageComment}>
                                    <MaterialCommunityIcons style={{ color: "white", fontSize: 24 }} name='close' />
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 150, backgroundColor: colors.primary_dark_alternative, borderRadius: 10 }}>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, padding: 3, borderRadius: 20, backgroundColor: "black" }} onPress={deleteImageComment}>
                                    <MaterialCommunityIcons style={{ color: "white", fontSize: 24 }} name='close' />
                                </TouchableOpacity>
                                <ActivityIndicator size={'large'} color={colors.secondary} />
                            </View>
                        :
                        <View></View>}

                </View>

                <View style={styles.reply_row2}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{myComment.length} / 200</Text>
                        {/* <TouchableOpacity onPress={openEmojiModal}>
                            <MaterialCommunityIcons style={{ marginLeft: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='emoticon-happy-outline' />
                        </TouchableOpacity> */}
                        {showMediaComment ?
                            urlMedia == null ?
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={pickPhotoComment}>
                                        <MaterialCommunityIcons style={{ fontSize: 24, color: colors.primary, marginVertical: 10, marginLeft: 10 }} name='camera-plus-outline' />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={submitImageComment}>
                                        <MaterialCommunityIcons style={{ fontSize: 24, color: colors.primary, marginVertical: 10, marginLeft: 10 }} name='file-image-plus-outline' />
                                    </TouchableOpacity>
                                </View>
                                :
                                <View></View>
                            :
                            <View></View>
                        }
                    </View>
                    {myComment.length == 0 || loadingMedia ?
                        <View style={{ flexDirection: "row", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sendComment')}</Text>
                        </View>
                        :
                        loadingButton ?
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

            {/* <Modal style={{ alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark }} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{ height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary }}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setMyComment( myComment + emoji )} />
            </Modal> */}
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