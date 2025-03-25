import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Comment_answer from './Comment_answer';
import { localUserLogin } from '../../utils/localstorage';
import { isWasInteracted, fetchImage } from '../../utils/interations';

import { doc, updateDoc, getDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Comment({
    publicationId,
    id,
    // comment_answers,
    date,
    dislikes,
    likes,
    mediaURL,
    message,
    user,
    props
}) {
    const [isAvailable, setIsAvailable] = useState(true);

    const [isLike, setIsLike] = useState((isWasInteracted(likes)));
    const [isDislike, setIsDislike] = useState((isWasInteracted(dislikes)));
    const [showAnswers, setShowAnswers] = useState(false);
    const [avatarURL, setAvatarURL] = useState(null);
    const [userId, setUserId] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [loadingMedia, setLoadingMedia] = useState(true);
    const [urlImage, setUrlImage] = useState(null);

    const [comment_answers, set_comment_answers] = useState([]);

    // const allAnswers = comment_answers.length
    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        const isBlock = localUserLogin.blackList.includes(user) || localUserLogin.blockUsers.includes(user);

        if (!isBlock) {
            loadUserData();
            loadImage();
            loadCommentsAnswers();
        } else {
            setIsAvailable(false);
        }
    }, [])

    function replyComment() {
        comment_Array = {
            // comment_answers: comment_answers,
            date: date,
            likes: likes,
            dislikes: dislikes,
            message: message,
            mediaURL: mediaURL,
            user: user,
            userAvatar: avatarURL
        }
        props.navigation.navigate({ name: 'ReplyScreen', params: { id: publicationId, userIdSend: userId, nameUserSend: nickname, principalID: id, isPrincipalComment: true, comment_Array: comment_Array }, merge: true });
    }

    function show() {
        if (showAnswers) {
            setShowAnswers(false)
        } else {
            setShowAnswers(true)
        }
    }

    const loadUserData = async () => {
        try {
            const docRef = doc(database, 'users', user);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserId(user);
                setAvatarURL(await fetchImage(docSnap.data().avatar));
                setNickname(docSnap.data().name);
            } else {
                setIsAvailable(false);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const loadImage = async () => {
        if (mediaURL != null) {
            setUrlImage(await fetchImage(mediaURL));
            setLoadingMedia(false);
        }
    }

    function loadCommentsAnswers() {
        try {
            const url = 'publications/' + publicationId + '/comments/' + id + "/comment_answers";
            const collectionRef = collection(database, url);
            const q = query(collectionRef, orderBy('date', 'asc'));

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                set_comment_answers(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        body: doc.data().body,
                        date: doc.data().date,
                        dislikes: doc.data().dislikes,
                        likes: doc.data().likes,
                        mediaURL: doc.data().mediaURL,
                        user: doc.data().user
                    }))
                )
            });
            return unsubscribe;
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
                    const url = "publications/" + publicationId + "/comments";
                    const docRef = doc(database, url, id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // let commentsSnapshot = docSnap.data().comments_container
                        let likesContainer = docSnap.data().likes;

                        // for (let i = 0; i < commentsSnapshot.length; i++) {
                        //     if (commentsSnapshot[i].message === message) {
                        //         if (commentsSnapshot[i].likes) {
                        //             commentsSnapshot[i].likes.push(localUserLogin.username);
                        //             break;
                        //         }
                        //     }
                        // }
                        likesContainer.push(localUserLogin.id);
                        // await updateDoc(docRef, { comments_container: commentsSnapshot });
                        await updateDoc(docRef, { likes: likesContainer });
                    } else {
                        setIsLike(false);
                        Alert.alert(t('errorTitle'), t('error'));
                        console.error("Datos inexistente")
                    }
                } catch (error) {
                    Alert.alert(t('errorTitle'), t('error'));
                    setIsLike(false);
                    console.error(error);
                }
            }
        } else {
            setIsDislike(false)
            setIsLike(true);
            try {
                // const docRef = doc(database, "publications", publicationId)
                const url = "publications/" + publicationId + "/comments";
                const docRef = doc(database, url, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // let commentsSnapshot = docSnap.data().comments_container
                    let likesContainer = docSnap.data().likes;
                    let dislikesContainer = docSnap.data().dislikes;

                    // for (let i = 0; i < commentsSnapshot.length; i++) {
                    //     if (commentsSnapshot[i].message === message) {
                    //         if (commentsSnapshot[i].dislikes) {
                    //             for (let y = 0; y < commentsSnapshot[i].dislikes.length; y++) {
                    //                 if (commentsSnapshot[i].dislikes[y] === localUserLogin.username) {
                    //                     commentsSnapshot[i].dislikes.splice(y, 1);
                    //                     break;
                    //                 }
                    //             }
                    //             commentsSnapshot[i].likes.push(localUserLogin.username);
                    //             break;
                    //         }
                    //     }
                    // }

                    // Eliminando el dislike
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
                    setIsDislike(true);
                    setIsLike(false);
                    Alert.alert(t('errorTitle'), t('error'));
                    console.error("Datos inexistente");
                }
            } catch (error) {
                setIsDislike(true);
                setIsLike(false);
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
            }
        }
    }

    const setDislikeComment = async () => {
        if (!isLike) {
            if (!isDislike) {
                setIsDislike(true)
                try {
                    // const docRef = doc(database, "publications", publicationId)
                    const url = "publications/" + publicationId + "/comments";
                    const docRef = doc(database, url, id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        // let commentsSnapshot = docSnap.data().comments_container
                        let dislikesContainer = docSnap.data().dislikes;

                        // for (let i = 0; i < commentsSnapshot.length; i++) {
                        //     if (commentsSnapshot[i].message === message) {
                        //         if (commentsSnapshot[i].dislikes) {
                        //             commentsSnapshot[i].dislikes.push(localUserLogin.username);
                        //             break;
                        //         }
                        //     }
                        // }

                        dislikesContainer.push(localUserLogin.id);

                        // await updateDoc(docRef, { comments_container: commentsSnapshot });
                        await updateDoc(docRef, { dislikes: dislikesContainer });
                    } else {
                        setIsDislike(false)
                        Alert.alert(t('errorTitle'), t('error'));
                        console.error("Datos inexistente")
                    }
                } catch (error) {
                    setIsDislike(false)
                    Alert.alert(t('errorTitle'), t('error'));
                    console.error(error);
                }
            }
        } else {
            setIsLike(false)
            setIsDislike(true)
            try {
                // const docRef = doc(database, "publications", publicationId)
                const url = "publications/" + publicationId + "/comments";
                const docRef = doc(database, url, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // let commentsSnapshot = docSnap.data().comments_container
                    let likesContainer = docSnap.data().likes;
                    let dislikesContainer = docSnap.data().dislikes;

                    // for (let i = 0; i < commentsSnapshot.length; i++) {
                    //     if (commentsSnapshot[i].message === message) {
                    //         if (commentsSnapshot[i].likes) {
                    //             for (let y = 0; y < commentsSnapshot[i].likes.length; y++) {
                    //                 if (commentsSnapshot[i].likes[y] === localUserLogin.username) {
                    //                     commentsSnapshot[i].likes.splice(y, 1);
                    //                     break;
                    //                 }
                    //             }
                    //             commentsSnapshot[i].dislikes.push(localUserLogin.username);
                    //             break;
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
                    setIsDislike(false)
                    setIsLike(true)
                    Alert.alert(t('errorTitle'), t('error'));
                    console.error("Datos inexistente")
                }
            } catch (error) {
                setIsDislike(false)
                setIsLike(true)
                Alert.alert(t('errorTitle'), t('error'));
                console.error(error);
            }
        }
    }

    return (
        <View>
            {isAvailable ?
                <View style={{ backgroundColor: colors.primary_dark, padding: 12, flexDirection: "column", borderRadius: 20, marginBottom: 15, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5 }}>
                    {/* Comentario principal */}
                    <View style={styles.comment_view}>

                        <TouchableOpacity style={styles.comment_left} onPress={goPerfil}>
                            <Image style={styles.comment_avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                        </TouchableOpacity>

                        <View style={styles.comment_right}>

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
                                <Text style={{ fontSize: 15, marginVertical: 8, color: colors.text }}>{message}</Text>
                                {mediaURL != null ?
                                    loadingMedia ?
                                        <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 150, backgroundColor: colors.primary_dark_alternative, borderRadius: 10 }}>
                                            <ActivityIndicator size={'large'} color={colors.secondary} />
                                        </View>
                                        :
                                        <Image style={{ width: 200, height: 150, borderRadius: 10 }} source={{ uri: urlImage }} />
                                    :
                                    <View></View>
                                }
                            </View>

                            <View style={styles.comment_footer}>
                                <View style={styles.comment_likes_block}>
                                    {/* like comment */}
                                    {isLike ?
                                        <MaterialCommunityIcons style={{ fontSize: 19, color: colors.like_comment }} name='thumb-up' />
                                        :
                                        <TouchableOpacity onPress={setLikeComment}>
                                            <MaterialCommunityIcons style={{ fontSize: 19, color: colors.primary_dark_alternative }} name='thumb-up' />
                                        </TouchableOpacity>
                                    }

                                    {/* counter */}
                                    <Text style={{ fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary }}>{likesTotal}</Text>

                                    {/* dislike comment */}
                                    {isDislike ?
                                        <MaterialCommunityIcons style={{ fontSize: 19, color: colors.dislike_comment }} name='thumb-down' />
                                        :
                                        <TouchableOpacity onPress={setDislikeComment}>
                                            <MaterialCommunityIcons style={{ fontSize: 19, color: colors.primary_dark_alternative }} name='thumb-down' />
                                        </TouchableOpacity>
                                    }




                                </View>
                                <View style={styles.comment_responses_block}>
                                    <MaterialCommunityIcons style={{ fontSize: 19, color: colors.primary_dark_alternative }} name='message-processing' />
                                    <Text style={{ fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary }}>{comment_answers.length}</Text>
                                </View>
                                <TouchableOpacity onPress={replyComment}>
                                    <Text style={{ color: colors.primary, fontSize: 15, fontWeight: "bold", marginLeft: 10 }}>Responder</Text>
                                </TouchableOpacity>
                            </View>

                            {comment_answers.length > 0 ?
                                <TouchableOpacity onPress={show}>
                                    {showAnswers ?
                                        <View style={styles.comment_show_responses}>
                                            <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='chevron-up' />
                                            <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.primary }}>Ocultar comentarios</Text>
                                        </View>
                                        :
                                        <View style={styles.comment_show_responses}>
                                            <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='chevron-down' />
                                            <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.primary }}>Cargar comentarios</Text>
                                        </View>
                                    }
                                </TouchableOpacity>
                                :
                                <View></View>
                            }

                        </View>
                    </View>
                    {/* Area de respuestas */}
                    {showAnswers ?
                        comment_answers.map((comment, key) => (<Comment_answer key={key} props={props} comment_answers={comment_answers} principalMessage={message} principalID={id} publicationId={publicationId} {...comment} />))
                        :
                        <View></View>
                    }
                </View>
                :
                <View></View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    comment_avatar: {
        height: 44,
        width: 44,
        borderRadius: 100
    },
    comment_view: {
        flexDirection: "row"
    },
    comment_left: {
        width: "15%",
        marginTop: 5,
        display: "flex",
        justifyContent: "top",
        alignItems: "center",
    },
    comment_right: {
        width: "85%",
        marginLeft: 10
    },
    comment_header: {
        flexDirection: "row"
    },
    comment_footer: {
        flexDirection: "row",
        marginVertical: 5,
    },
    comment_likes_block: {
        flexDirection: "row"
    },
    comment_show_responses: {
        flexDirection: "row",
        marginTop: 10
    },
    comment_responses_block: {
        flexDirection: "row",
        marginLeft: 30,
    }
})