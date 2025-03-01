import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { isWasInteracted } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export var replyComment_Array = []

export default function Comment_answer({
    props,
    comment_answers,
    principalID,
    principalMessage,
    publicationId,
    id,
    body,
    date,
    dislikes,
    likes,
    user
}) {
    const [isLike, setIsLike] = useState((isWasInteracted(likes)));
    const [isDislike, setIsDislike] = useState((isWasInteracted(dislikes)));
    const [avatarURL, setAvatarURL] = useState(null);
    const [userId, setUserId] = useState(null);
    const [nickname, setNickname] = useState(null);

    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadUserData();
    }, [])

    function replyComment() {
        replyComment_Array = {
            principalMessage: principalMessage,
            comment_answers: comment_answers,
            date: date,
            likes: likes,
            dislikes: dislikes,
            message: body,
            user: user,
            userAvatar: avatarURL
        }
        props.navigation.navigate({ name: 'ReplyScreen', params: { id: publicationId, userIdSend: userId, nameUserSend: nickname, principalID: principalID, isPrincipalComment: false, comment_Array: replyComment_Array }, merge: true });
    }

    // Usar la función de la clase "interations" no funciona
    const fetchImage = async (url) => {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);

            setAvatarURL(getUrl);
        }
    }

    const loadUserData = async () => {
        try {
            const docRef = doc(database, 'users', user);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserId(user);
                // Usar la función de la clase "interations" no funciona:
                // setAvatarURL(await fetchImage(res.data.avatar))
                fetchImage(docSnap.data().avatar);
                setNickname(docSnap.data().name);
            } else {
                setNickname("BANNED");
            }
        } catch (error) {
            console.error(error);
        }
    }

    function goPerfil() {
        props.navigation.navigate({ name: 'Perfil', params: { userId: userId }, merge: true });
    }

    const setLikeComment = async () => {
        if (!isDislike) {
            if (!isLike) {
                setIsLike(true);
                try {
                    // const docRef = doc(database, "publications", publicationId)
                    const url = "publications/" + publicationId + "/comments/" + principalID + "/comment_answers";
                    const docRef = doc(database, url, id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // let commentsSnapshot = docSnap.data().comments_container
                        let likesContainer = docSnap.data().likes;

                        // for (let i = 0; i < commentsSnapshot.length; i++) {
                        //     if (commentsSnapshot[i].message === principalMessage) {
                        //         for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                        //             if (commentsSnapshot[i].comment_answers[x].body === body) {
                        //                 if (commentsSnapshot[i].comment_answers[x].likes) {
                        //                     commentsSnapshot[i].comment_answers[x].likes.push(localUserLogin.username);
                        //                     break;
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                        likesContainer.push(localUserLogin.id);

                        // await updateDoc(docRef, { comments_container: commentsSnapshot });
                        await updateDoc(docRef, { likes: likesContainer });
                    } else {
                        setIsLike(false);
                        Alert.alert(t('errorTitle'), t('error'));
                        console.error("Datos inexistente");
                    }
                } catch (error) {
                    Alert.alert(t('errorTitle'), t('error'));
                    setIsLike(false);
                    console.error(error);
                }
            }
        } else {
            setIsDislike(false);
            setIsLike(true);
            try {
                // const docRef = doc(database, "publications", publicationId)
                const url = "publications/" + publicationId + "/comments/" + principalID + "/comment_answers";
                const docRef = doc(database, url, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // let commentsSnapshot = docSnap.data().comments_container
                    let likesContainer = docSnap.data().likes;
                    let dislikesContainer = docSnap.data().dislikes;

                    // for (let i = 0; i < commentsSnapshot.length; i++) {
                    //     if (commentsSnapshot[i].message === principalMessage) {
                    //         for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                    //             if (commentsSnapshot[i].comment_answers[x].body === body) {
                    //                 for (let y = 0; y < commentsSnapshot[i].comment_answers[x].dislikes.length; y++) {
                    //                     if (commentsSnapshot[i].comment_answers[x].dislikes[y] === localUserLogin.username) {
                    //                         commentsSnapshot[i].comment_answers[x].dislikes.splice(y, 1);
                    //                         break;
                    //                     }
                    //                 }
                    //                 commentsSnapshot[i].comment_answers[x].likes.push(localUserLogin.username);
                    //                 break;
                    //             }
                    //         }
                    //     }
                    // }

                    for (let i = 0; i < dislikesContainer.length; i++) {
                        if (dislikesContainer[i] === localUserLogin.id) {
                            dislikesContainer.splice(i, 1);
                            break;
                        }
                    }
                    likesContainer.push(localUserLogin.id);

                    // await updateDoc(docRef, { comments_container: commentsSnapshot });
                    await updateDoc(docRef, { likes: likesContainer, dislikes: dislikesContainer });
                } else {
                    setIsDislike(true)
                    setIsLike(false)
                    Alert.alert(t('errorTitle'), t('error'));
                    console.error("Datos inexistente")
                }
            } catch (error) {
                setIsDislike(true)
                setIsLike(false)
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
            }
        }
    }

    const setDislikeComment = async () => {
        if (!isLike) {
            if (!isDislike) {
                setIsDislike(true);
                try {
                    // const docRef = doc(database, "publications", publicationId)
                    const url = "publications/" + publicationId + "/comments/" + principalID + "/comment_answers";
                    const docRef = doc(database, url, id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // let commentsSnapshot = docSnap.data().comments_container
                        let dislikesContainer = docSnap.data().dislikes;

                        // for (let i = 0; i < commentsSnapshot.length; i++) {
                        //     if (commentsSnapshot[i].message === principalMessage) {
                        //         for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                        //             if (commentsSnapshot[i].comment_answers[x].body === body) {
                        //                 if (commentsSnapshot[i].comment_answers[x].dislikes) {
                        //                     commentsSnapshot[i].comment_answers[x].dislikes.push(localUserLogin.username);
                        //                     break;
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                        dislikesContainer.push(localUserLogin.id);

                        // await updateDoc(docRef, { comments_container: commentsSnapshot });
                        await updateDoc(docRef, { dislikes: dislikesContainer });
                    } else {
                        setIsDislike(false);
                        Alert.alert(t('errorTitle'), t('error'));
                        console.error("Datos inexistente");
                    }
                } catch (error) {
                    Alert.alert(t('errorTitle'), t('error'));
                    setIsDislike(false);
                    console.error(error);
                }
            }
        } else {
            setIsLike(false);
            setIsDislike(true);
            try {
                // const docRef = doc(database, "publications", publicationId)
                const url = "publications/" + publicationId + "/comments/" + principalID + "/comment_answers";
                const docRef = doc(database, url, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // let commentsSnapshot = docSnap.data().comments_container
                    let likesContainer = docSnap.data().likes;
                    let dislikesContainer = docSnap.data().dislikes;

                    // for (let i = 0; i < commentsSnapshot.length; i++) {
                    //     if (commentsSnapshot[i].message === principalMessage) {
                    //         for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                    //             if (commentsSnapshot[i].comment_answers[x].body === body) {
                    //                 for (let y = 0; y < commentsSnapshot[i].comment_answers[x].likes.length; y++) {
                    //                     if (commentsSnapshot[i].comment_answers[x].likes[y] === localUserLogin.username) {
                    //                         commentsSnapshot[i].comment_answers[x].likes.splice(y, 1);
                    //                         break;
                    //                     }
                    //                 }
                    //                 commentsSnapshot[i].comment_answers[x].dislikes.push(localUserLogin.username);
                    //                 break;
                    //             }
                    //         }
                    //     }
                    // }
                    for (let i = 0; i < likesContainer.length; i++) {
                        if (likesContainer[i] === localUserLogin.id) {
                            likesContainer.splice(i, 1);
                            break;
                        }
                    }
                    dislikesContainer.push(localUserLogin.id);

                    // await updateDoc(docRef, { comments_container: commentsSnapshot });
                    await updateDoc(docRef, { likes: likesContainer, dislikes: dislikesContainer });
                } else {
                    setIsDislike(false);
                    setIsLike(true);
                    Alert.alert(t('errorTitle'), t('error'));
                    console.error("Datos inexistente");
                }
            } catch (error) {
                setIsDislike(false);
                setIsLike(true);
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
            }
        }
    }

    return (
        <View style={styles.comment_responces}>
            <TouchableOpacity style={styles.comment_responces_left} onPress={goPerfil}>
                <Image style={styles.comment_avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
            </TouchableOpacity>

            <View style={styles.comment_responces_right}>

                <TouchableOpacity style={styles.comment_header} onPress={goPerfil}>
                    {user == localUserLogin.id ?
                        <Text style={{ fontWeight: "bold", fontSize: 16, color: colors.tertiary }}>{nickname}</Text>
                        :
                        <Text style={{ fontWeight: "bold", fontSize: 16, color: colors.secondary }}>{nickname}</Text>
                    }
                    <Text style={{ fontWeight: "bold", marginHorizontal: 5, fontSize: 16, color: colors.secondary }}>-</Text>
                    <Text style={{ fontSize: 16, color: colors.secondary }}>{convertDate(date)}</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 15, marginVertical: 8, color: colors.text }}>{body}</Text>
                </View>

                <View style={styles.comment_footer}>
                    <View style={styles.comment_likes_block}>
                        {isLike ?
                            <MaterialCommunityIcons style={{ fontSize: 19, color: colors.like_comment }} name='thumb-up' />
                            :
                            <TouchableOpacity onPress={setLikeComment}>
                                <MaterialCommunityIcons style={{ fontSize: 19, color: colors.primary_dark_alternative }} name='thumb-up' />
                            </TouchableOpacity>
                        }
                        <Text style={{ fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary }}>{likesTotal}</Text>
                        {isDislike ?
                            <MaterialCommunityIcons style={{ fontSize: 19, color: colors.dislike_comment }} name='thumb-down' />
                            :
                            <TouchableOpacity onPress={setDislikeComment}>
                                <MaterialCommunityIcons style={{ fontSize: 19, color: colors.primary_dark_alternative }} name='thumb-down' />
                            </TouchableOpacity>
                        }
                    </View>
                    <TouchableOpacity onPress={replyComment}>
                        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", marginLeft: 10 }}>Responder</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    comment_avatar: {
        height: 36,
        width: 36,
        borderRadius: 100
    },
    comment_header: {
        flexDirection: "row"
    },
    comment_footer: {
        flexDirection: "row",
        marginTop: 5,
        marginBottom: 20
    },
    comment_likes_block: {
        flexDirection: "row"
    },
    comment_responces: {
        flexDirection: "row"
    },
    comment_responces_left: {
        width: "20%",
        alignItems: "center",
        justifyContent: "center"
    },
    comment_responces_right: {
        width: "80%",
    }
})