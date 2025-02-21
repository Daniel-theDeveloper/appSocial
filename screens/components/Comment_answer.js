import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { isWasInteracted } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';

import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

export var replyComment_Array = []

export default function Comment_answer({
    props,
    comment_answers,
    principalMessage,
    publicationId,
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
    const [username, setUsername] = useState(null);
    const [nickname, setNickname] = useState(null);

    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    const { colors } = useTheme();

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
        props.navigation.navigate({ name: 'ReplyScreen', params: { id: publicationId, userIdSend: userId, isPrincipalComment: false }, merge: true })
    }

    const fetchImage = async (url) => {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);
            
            setAvatarURL(getUrl);
        }
    }

    const loadUserData = async () => {
        let userData = [];
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                userData.push({id: doc.id, data: doc.data()});
            });
            userData.find(function (res) {
                if (res.data.username === user) {
                    setUserId(res.id);
                    fetchImage(res.data.avatar);
                    setUsername(res.data.username);
                    setNickname(res.data.name);
                }
            })
        } catch (error) {
            console.error(error);
        }
    }

    function goPerfil() {
        props.navigation.navigate({ name: 'Perfil', params: { userId: userId }, merge: true });
    }

    const setLikeComment = async () => {
        if (isDislike != true) {
            if (isLike != true) {
                setIsLike(true);
                try {
                    const docRef = doc(database, "publications", publicationId)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === principalMessage) {
                                for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                    if (commentsSnapshot[i].comment_answers[x].body === body) {
                                        if (commentsSnapshot[i].comment_answers[x].likes) {
                                            commentsSnapshot[i].comment_answers[x].likes.push(localUserLogin.username);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        await updateDoc(docRef, { comments_container: commentsSnapshot });
                    } else {
                        setIsLike(false);
                        Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                        console.error("Datos inexistente")
                    }
                } catch (error) {
                    Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                    setIsLike(false);
                    console.error(error);
                }
            }
        } else {
            setIsDislike(false)
            setIsLike(true);
            try {
                const docRef = doc(database, "publications", publicationId)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === principalMessage) {
                            for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                if (commentsSnapshot[i].comment_answers[x].body === body) {
                                    for (let y = 0; y < commentsSnapshot[i].comment_answers[x].dislikes.length; y++) {
                                        if (commentsSnapshot[i].comment_answers[x].dislikes[y] === localUserLogin.username) {
                                            commentsSnapshot[i].comment_answers[x].dislikes.splice(y, 1);
                                            break;
                                        }
                                    }
                                    commentsSnapshot[i].comment_answers[x].likes.push(localUserLogin.username);
                                    break;
                                }
                            }
                        }
                    }
                    await updateDoc(docRef, { comments_container: commentsSnapshot });
                } else {
                    setIsDislike(true)
                    setIsLike(false)
                    Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                    console.error("Datos inexistente")
                }
            } catch (error) {
                setIsDislike(true)
                setIsLike(false)
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
            }
        }
    }

    const setDislikeComment = async () => {
        if (isLike != true) {
            if (isDislike != true) {
                setIsDislike(true)
                try {
                    const docRef = doc(database, "publications", publicationId)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === principalMessage) {
                                for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                    if (commentsSnapshot[i].comment_answers[x].body === body) {
                                        if (commentsSnapshot[i].comment_answers[x].dislikes) {
                                            commentsSnapshot[i].comment_answers[x].dislikes.push(localUserLogin.username);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        await updateDoc(docRef, { comments_container: commentsSnapshot });
                    } else {
                        setIsDislike(false)
                        Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                        console.error("Datos inexistente")
                    }
                } catch (error) {
                    Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                    setIsDislike(false)
                    console.error(error);
                }
            }
        } else {
            setIsLike(false)
            setIsDislike(true)
            try {
                const docRef = doc(database, "publications", publicationId)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === principalMessage) {
                            for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                if (commentsSnapshot[i].comment_answers[x].body === body) {
                                    for (let y = 0; y < commentsSnapshot[i].comment_answers[x].likes.length; y++) {
                                        if (commentsSnapshot[i].comment_answers[x].likes[y] === localUserLogin.username) {
                                            commentsSnapshot[i].comment_answers[x].likes.splice(y, 1);
                                            break;
                                        }
                                    }
                                    commentsSnapshot[i].comment_answers[x].dislikes.push(localUserLogin.username);
                                    break;
                                }
                            }
                        }
                    }
                    await updateDoc(docRef, { comments_container: commentsSnapshot });
                } else {
                    setIsDislike(false)
                    setIsLike(true)
                    Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                    console.error("Datos inexistente")
                }
            } catch (error) {
                setIsDislike(false)
                setIsLike(true)
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
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
                    {user == localUserLogin.username ?
                        <Text style={{fontWeight: "bold", fontSize: 16, color: colors.tertiary}}>{nickname}</Text>
                        :
                        <Text style={{fontWeight: "bold", fontSize: 16, color: colors.secondary}}>{nickname}</Text>
                    }
                    <Text style={{fontWeight: "bold", marginHorizontal: 5, fontSize: 16, color: colors.secondary}}>-</Text>
                    <Text style={{fontSize: 16, color: colors.secondary}}>{convertDate(date)}</Text>
                </TouchableOpacity>

                <View>
                    <Text style={{fontSize: 15, marginVertical: 8, color: colors.text}}>{body}</Text>
                </View>

                <View style={styles.comment_footer}>
                    <View style={styles.comment_likes_block}>
                        {isLike ?
                            <MaterialCommunityIcons style={{fontSize: 19, color: colors.like_comment}} name='thumb-up' />
                            :
                            <TouchableOpacity onPress={setLikeComment}>
                                <MaterialCommunityIcons style={{fontSize: 19, color: colors.primary_dark_alternative}} name='thumb-up' />
                            </TouchableOpacity>
                        }
                        <Text style={{fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary}}>{likesTotal}</Text>
                        {isDislike ?
                            <MaterialCommunityIcons style={{fontSize: 19, color: colors.dislike_comment}} name='thumb-down' />
                            :
                            <TouchableOpacity onPress={setDislikeComment}>
                                <MaterialCommunityIcons style={{fontSize: 19, color: colors.primary_dark_alternative}} name='thumb-down' />
                            </TouchableOpacity>
                        }
                    </View>
                    <TouchableOpacity onPress={replyComment}>
                        <Text style={{color: colors.primary, fontSize: 15, fontWeight: "bold", marginLeft: 10}}>Responder</Text>
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