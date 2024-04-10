import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { publicationData } from '../components/Publish';
import { isWasInteracted } from '../../utils/interations';
import { globalUsername } from '../../utils/localstorage';
import { globals } from '../../utils/globalVars';

import { doc, updateDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

export var replyComment_Array = []

export default function Comment_answer({
    props,
    comment_answers,
    principalMessage,
    body,
    date,
    dislikes,
    likes,
    user
}) {
    const [isLike, setIsLike] = useState((isWasInteracted(likes)));
    const [isDislike, setIsDislike] = useState((isWasInteracted(dislikes)));
    const [avatarURL, setAvatarURL] = useState(null);
    const [nickname, setNickname] = useState(null);

    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    useEffect(() => {
        loadUserData();
    }, [])

    function replyComment() {
        globals.isPrincipalComment = false;
        replyComment_Array = {
            comment_answers: comment_answers,
            date: date,
            likes: likes,
            dislikes: dislikes,
            message: body,
            user: user,
        }
        props.navigation.navigate('ReplyScreen')
    }

    const fetchImageAvatar = async (url) => {
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
                userData.push(doc.data());
            });
            userData.find(function (res) {
                if (res.username === user) {
                    fetchImageAvatar(res.avatar);
                    setNickname(res.name);
                }
            })
        } catch (error) {
            console.error(error);
        }
    }

    const setLikeComment = async () => {
        if (isDislike != true) {
            if (isLike != true) {
                setIsLike(true);
                try {
                    const docRef = doc(database, "publications", publicationData.id)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === principalMessage) {
                                for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                    if (commentsSnapshot[i].comment_answers[x].body === body) {
                                        if (commentsSnapshot[i].comment_answers[x].likes) {
                                            commentsSnapshot[i].comment_answers[x].likes.push(globalUsername);
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
                const docRef = doc(database, "publications", publicationData.id)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === principalMessage) {
                            for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                if (commentsSnapshot[i].comment_answers[x].body === body) {
                                    for (let y = 0; y < commentsSnapshot[i].comment_answers[x].dislikes.length; y++) {
                                        if (commentsSnapshot[i].comment_answers[x].dislikes[y] === globalUsername) {
                                            commentsSnapshot[i].comment_answers[x].dislikes.splice(y, 1);
                                            break;
                                        }
                                    }
                                    commentsSnapshot[i].comment_answers[x].likes.push(globalUsername);
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
                    const docRef = doc(database, "publications", publicationData.id)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === principalMessage) {
                                for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                    if (commentsSnapshot[i].comment_answers[x].body === body) {
                                        if (commentsSnapshot[i].comment_answers[x].dislikes) {
                                            commentsSnapshot[i].comment_answers[x].dislikes.push(globalUsername);
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
                const docRef = doc(database, "publications", publicationData.id)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === principalMessage) {
                            for (let x = 0; x < commentsSnapshot[i].comment_answers.length; x++) {
                                if (commentsSnapshot[i].comment_answers[x].body === body) {
                                    for (let y = 0; y < commentsSnapshot[i].comment_answers[x].likes.length; y++) {
                                        if (commentsSnapshot[i].comment_answers[x].likes[y] === globalUsername) {
                                            commentsSnapshot[i].comment_answers[x].likes.splice(y, 1);
                                            break;
                                        }
                                    }
                                    commentsSnapshot[i].comment_answers[x].dislikes.push(globalUsername);
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
            <View style={styles.comment_responces_left}>
                <Image style={styles.comment_avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
            </View>

            <View style={styles.comment_responces_right}>

                <View style={styles.comment_header}>
                    {user == globalUsername ?
                        <Text style={styles.comment_myUsername}>{nickname}</Text>
                        :
                        <Text style={styles.comment_username}>{nickname}</Text>
                    }
                    <Text style={styles.comment_separator}>-</Text>
                    <Text style={styles.comment_date}>{convertDate(date)}</Text>
                </View>

                <View>
                    <Text style={styles.comment}>{body}</Text>
                </View>

                <View style={styles.comment_footer}>
                    <View style={styles.comment_likes_block}>
                        {isLike ?
                            <MaterialCommunityIcons style={styles.comment_liked_buttons} name='thumb-up' />
                            :
                            <TouchableOpacity onPress={setLikeComment}>
                                <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-up' />
                            </TouchableOpacity>
                        }
                        <Text style={styles.comment_counter}>{likesTotal}</Text>
                        {isDislike ?
                            <MaterialCommunityIcons style={styles.comment_disliked_buttons} name='thumb-down' />
                            :
                            <TouchableOpacity onPress={setDislikeComment}>
                                <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-down' />
                            </TouchableOpacity>
                        }
                    </View>
                    <TouchableOpacity onPress={replyComment}>
                        <Text style={styles.reply_button}>Responder</Text>
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
    comment_username: {
        fontWeight: "bold",
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment_myUsername: {
        fontWeight: "bold",
        fontSize: 17,
        color: "#abf752"
    },
    comment_separator: {
        fontWeight: "bold",
        marginHorizontal: 5,
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment_date: {
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment: {
        fontSize: 16,
        marginVertical: 8,
        color: 'white'
    },
    comment_footer: {
        flexDirection: "row",
        marginTop: 5,
        marginBottom: 20
    },
    comment_buttons: {
        fontSize: 20,
        color: "#a6006a"
    },
    comment_counter: {
        fontSize: 15,
        fontWeight: "bold",
        marginHorizontal: 8,
        color: "#e8007c"
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
    },
    reply_button: {
        color: "#e8007c",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10
    },
    comment_liked_buttons: {
        fontSize: 20,
        color: "#abf752"
    },
    comment_disliked_buttons: {
        fontSize: 20,
        color: "#994cf0"
    }
})