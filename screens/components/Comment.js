import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Comment_answer from './Comment_answer';
import { localUserLogin } from '../../utils/localstorage';
import { publicationData } from '../components/Publish';
import { isWasInteracted } from '../../utils/interations';

import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';
import { globals } from '../../utils/globalVars';
import { useTheme } from '@react-navigation/native';

export let comment_Array = [];

export default function Comment({
    publicationId,
    comment_answers,
    date,
    dislikes,
    likes,
    message,
    user,
    props
}) {
    const [isLike, setIsLike] = useState((isWasInteracted(likes)));
    const [isDislike, setIsDislike] = useState((isWasInteracted(dislikes)));
    const [showAnswers, setShowAnswers] = React.useState(false);
    const [avatarURL, setAvatarURL] = useState(null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const [nickname, setNickname] = useState(null);

    const allAnswers = comment_answers.length
    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    const { colors } = useTheme();

    useEffect(() => {
        loadUserData();
    }, [])

    function replyComment() {
        comment_Array = {
            comment_answers: comment_answers,
            date: date,
            likes: likes,
            dislikes: dislikes,
            message: message,
            user: user,
            userAvatar: avatarURL
        }
        globals.isPrincipalComment = true;
        props.navigation.navigate({ name: 'ReplyScreen', params: { id: publicationId, userIdSend: userId }, merge: true });
    }

    function show() {
        if (showAnswers) {
            setShowAnswers(false)
        } else {
            setShowAnswers(true)
        }
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
                            if (commentsSnapshot[i].message === message) {
                                if (commentsSnapshot[i].likes) {
                                    commentsSnapshot[i].likes.push(localUserLogin.username);
                                    break;
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
                        if (commentsSnapshot[i].message === message) {
                            if (commentsSnapshot[i].dislikes) {
                                for (let y = 0; y < commentsSnapshot[i].dislikes.length; y++) {
                                    if (commentsSnapshot[i].dislikes[y] === localUserLogin.username) {
                                        commentsSnapshot[i].dislikes.splice(y, 1);
                                        break;
                                    }
                                }
                                commentsSnapshot[i].likes.push(localUserLogin.username);
                                break;
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

    const setDisikeComment = async () => {
        if (isLike != true) {
            if (isDislike != true) {
                setIsDislike(true)
                try {
                    const docRef = doc(database, "publications", publicationId)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === message) {
                                if (commentsSnapshot[i].dislikes) {
                                    commentsSnapshot[i].dislikes.push(localUserLogin.username);
                                    break;
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
                    setIsDislike(false)
                    Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
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
                        if (commentsSnapshot[i].message === message) {
                            if (commentsSnapshot[i].likes) {
                                for (let y = 0; y < commentsSnapshot[i].likes.length; y++) {
                                    if (commentsSnapshot[i].likes[y] === localUserLogin.username) {
                                        commentsSnapshot[i].likes.splice(y, 1);
                                        break;
                                    }
                                }
                                commentsSnapshot[i].dislikes.push(localUserLogin.username);
                                break;
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
        <View style={{backgroundColor: colors.primary_dark, padding: 12, flexDirection: "column", borderRadius: 20, marginBottom: 15, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5}}>
            {/* Comentario principal */}
            <View style={styles.comment_view}>

                <TouchableOpacity style={styles.comment_left} onPress={goPerfil}>
                    <Image style={styles.comment_avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                </TouchableOpacity>

                <View style={styles.comment_right}>

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
                        <Text style={{fontSize: 15, marginVertical: 8, color: colors.text}}>{message}</Text>
                    </View>

                    <View style={styles.comment_footer}>
                        <View style={styles.comment_likes_block}>
                            {/* like comment */}
                            {isLike ?
                                <MaterialCommunityIcons style={{fontSize: 19, color: colors.like_comment}} name='thumb-up' />
                                :
                                <TouchableOpacity onPress={setLikeComment}>
                                    <MaterialCommunityIcons style={{fontSize: 19, color: colors.primary_dark_alternative}} name='thumb-up' />
                                </TouchableOpacity>
                            }

                            {/* counter */}
                            <Text style={{fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary}}>{likesTotal}</Text>

                            {/* dislike comment */}
                            {isDislike ?
                                <MaterialCommunityIcons style={{fontSize: 19, color: colors.dislike_comment}} name='thumb-down' />
                                :
                                <TouchableOpacity onPress={setDisikeComment}>
                                    <MaterialCommunityIcons style={{fontSize: 19, color: colors.primary_dark_alternative}} name='thumb-down' />
                                </TouchableOpacity>
                            }




                        </View>
                        <View style={styles.comment_responces_block}>
                            <MaterialCommunityIcons style={{fontSize: 19, color: colors.primary_dark_alternative}} name='message-processing' />
                            <Text style={{fontSize: 14, fontWeight: "bold", marginHorizontal: 8, color: colors.primary}}>{allAnswers}</Text>
                        </View>
                        <TouchableOpacity onPress={replyComment}>
                            <Text style={{color: colors.primary, fontSize: 15, fontWeight: "bold", marginLeft: 10}}>Responder</Text>
                        </TouchableOpacity>
                    </View>

                    {allAnswers > 0 ?
                        <TouchableOpacity onPress={show}>
                            {showAnswers ?
                                <View style={styles.comment_show_responces}>
                                    <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='chevron-up' />
                                    <Text style={{fontSize: 15, fontWeight: "bold", color: colors.primary}}>Ocultar comentarios</Text>
                                </View>
                                :
                                <View style={styles.comment_show_responces}>
                                    <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='chevron-down' />
                                    <Text style={{fontSize: 15, fontWeight: "bold", color: colors.primary}}>Cargar comentarios</Text>
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
                comment_answers.map((comment, key) => (<Comment_answer key={key} props={props} comment_answers={comment_answers} principalMessage={message} publicationId={publicationId} {...comment} />))
                :
                <View></View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    comment_avatar: {
        height: 42,
        width: 42,
        margin: 6,
        borderRadius: 100
    },
    comment_view: {
        flexDirection: "row"
    },
    comment_left: {
        width: "15%"
    },
    comment_right: {
        width: "85%"
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
    comment_show_responces: {
        flexDirection: "row",
        marginTop: 10
    },
    comment_responces_block: {
        flexDirection: "row",
        marginLeft: 30,
    }
})