import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { convertDate } from '../../utils/convertDate';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { replyComment_Array } from '../components/Comment_answer';
import { localUserLogin } from '../../utils/localstorage';

import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { database } from '../../utils/database';
import { sendNotification } from '../../utils/interations';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function ReplyScreen(props) {
    const [myComment, setMyComment] = useState("");
    const [loadingButton, setLoadingButton] = useState((false));

    const [avatarURL] = useState(props.route.params?.comment_Array.userAvatar);
    const [replyAvatarURL] = useState(replyComment_Array.userAvatar);
    const [myAvatarURL] = useState(localUserLogin.avatar);
    const [urlMedia, setUrlMedia] = useState(null);
    const [mediaName, setMediaName] = useState(null);

    const [showMediaComment, setShowMediaComment] = useState(true);
    const [loadingMedia, setLoadingMedia] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const comment_Array = props.route.params?.comment_Array;

    function goBackAgain() {
        props.navigation.goBack();
    }

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
            let commentAnswerArray = [];
            let myReplyComment = "";
            let pathImage = null;

            try {
                // const docRef = doc(database, "publications", props.route.params?.id);
                // const docSnap = await getDoc(docRef);

                // if (docSnap.exists()) {
                //     let commentsSnapshot = docSnap.data().comments_container

                //     if (props.route.params?.isPrincipalComment) {
                //         for (let i = 0; i < commentsSnapshot.length; i++) {
                //             if (commentsSnapshot[i].message === comment_Array.message) {
                //                 if (commentsSnapshot[i].comment_answers) {
                //                     commentsSnapshot[i].comment_answers.push(commentAnswerArray);
                //                     break;
                //                 }
                //             }
                //         }
                //     } else {
                //         for (let i = 0; i < commentsSnapshot.length; i++) {
                //             if (commentsSnapshot[i].message === replyComment_Array.principalMessage) {
                //                 if (commentsSnapshot[i].comment_answers) {
                //                     commentsSnapshot[i].comment_answers.push(commentAnswerArray);
                //                     break;
                //                 }
                //             }
                //         }
                //     }
                //     await updateDoc(docRef, { comments_container: commentsSnapshot });

                // } else {
                // setLoadingButton(false);
                // console.error("Datos inexistente")
                // }

                if (urlMedia != null) {
                    const url = localUserLogin.username + "/publicationImages/" + props.route.params?.id + "/imagesComment/" + mediaName;

                    const response = await fetch(urlMedia);
                    const blob = await response.blob();
                    const storage = getStorage();
                    const storageRef = ref(storage, url);

                    const snapshot = await uploadBytes(storageRef, blob);

                    pathImage = snapshot.ref.fullPath;
                }

                if (props.route.params?.isPrincipalComment) {
                    commentAnswerArray = {
                        body: myComment,
                        date: new Date(),
                        dislikes: [],
                        likes: [],
                        mediaURL: pathImage,
                        user: localUserLogin.id
                    }
                } else {
                    myReplyComment = "@" + props.route.params?.nameUserSend + ": " + myComment
                    commentAnswerArray = {
                        body: myReplyComment,
                        date: new Date(),
                        dislikes: [],
                        likes: [],
                        mediaURL: pathImage,
                        user: localUserLogin.id
                    }
                }

                const url = 'publications/' + props.route.params?.id + '/comments/' + props.route.params?.principalID + "/comment_answers";
                await addDoc(collection(database, url), commentAnswerArray);

                if (props.route.params?.userIdSend !== localUserLogin.id) {
                    await sendNotification('reply_c', props.route.params?.userIdSend, props.route.params?.id, myComment);
                }

                props.navigation.goBack();
                setLoadingButton(false);
            } catch (error) {
                setLoadingButton(false);
                console.error(error);
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
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
            {props.route.params?.isPrincipalComment ?
                <View style={{ backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20 }}>
                    {/* header */}
                    <View style={styles.perfil_header}>
                        <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                        <View style={styles.perfil_usernames_container}>
                            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.secondary }}>@{props.route.params?.nameUserSend}{t('commentedLabel')}</Text>
                            <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(comment_Array.date)}</Text>
                        </View>
                    </View>

                    {/* body */}
                    <Text style={{ fontSize: 18, marginBottom: 15, color: colors.text }}>{comment_Array.message}</Text>

                    {/* footer */}
                    <View style={styles.statistics}>
                        <View style={styles.statistics_block}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>2</Text>
                            <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{t('responses')}</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginHorizontal: 15, color: colors.primary }}>|</Text>
                        <View style={styles.statistics_block}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>{comment_Array.likes.length - comment_Array.dislikes.length}</Text>
                            <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{t('likes')}</Text>
                        </View>
                    </View>
                </View>
                :
                <View style={{ backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20 }}>
                    {/* header */}
                    <View style={styles.perfil_header}>
                        <Image style={styles.avatar} source={replyAvatarURL != null ? { uri: replyAvatarURL } : require('../../assets/avatar-default.png')} />
                        <View style={styles.perfil_usernames_container}>
                            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.secondary }}>{props.route.params?.nameUserSend}{t('replied')}</Text>
                            <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(replyComment_Array.date)}</Text>
                        </View>
                    </View>

                    {/* body */}
                    <Text style={{ fontSize: 18, marginBottom: 15, color: colors.text }}>{replyComment_Array.message}</Text>

                    {/* footer */}
                    <View style={styles.statistics}>
                        <View style={styles.statistics_block}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>{replyComment_Array.likes.length - replyComment_Array.dislikes.length}</Text>
                            <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{t('likes')}</Text>
                        </View>
                    </View>
                </View>
            }

            {comment_Array.isPrincipalComment ?
                <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 20, color: colors.primary }}>{t('reply')}</Text>
                :
                <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 20, color: colors.primary }}>{t('reeplyto')}{props.route.params?.nameUserSend}</Text>
            }

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
                        <View style={{ flexDirection: "row", padding: 10, borderRadius: 10, backgroundColor: colors.secondary_dark }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('publish')}</Text>
                        </View>
                        :
                        loadingButton ?
                            <View style={{ flexDirection: "row", padding: 10, borderRadius: 10, backgroundColor: colors.secondary_dark }}>
                                <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                                <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('publishing')}</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={sendMyComment}>
                                <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.secondary }}>
                                    <Text style={{ fontSize: 16, marginHorizontal: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('publish')}</Text>
                                </View>
                            </TouchableOpacity>
                    }
                </View>
            </View>

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