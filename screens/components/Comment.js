import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Comment_answer from './Comment_answer';
import { globalUsername } from '../../utils/localstorage';
import { publicationId } from '../components/Publish';
import { isWasInteracted } from '../../utils/interations';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

export var comment_Array = []

export default function Comment({
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

    const allAnswers = comment_answers.length
    const likesCount = likes.length
    const dislikesCount = dislikes.length
    const likesTotal = likesCount - dislikesCount;

    function replyComment() {
        comment_Array = {
            comment_answers: comment_answers,
            date: date,
            likes: likes,
            dislikes: dislikes,
            message: message,
            user: user,
            isPrincipalComment: true
        }
        props.navigation.navigate('ReplyScreen')
    }

    function show() {
        if (showAnswers) {
            setShowAnswers(false)
        } else {
            setShowAnswers(true)
        }
    }

    const setLikeComment = async () => {
        if (isDislike != true) {
            if (isLike != true) {
                setIsLike(true);
                try {
                    const docRef = doc(database, "publications", publicationId.id)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === message) {
                                if (commentsSnapshot[i].likes) {
                                    commentsSnapshot[i].likes.push(globalUsername);
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
                const docRef = doc(database, "publications", publicationId.id)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === message) {
                            if (commentsSnapshot[i].dislikes) {
                                for (let y = 0; y < commentsSnapshot[i].dislikes.length; y++) {
                                    if (commentsSnapshot[i].dislikes[y] === globalUsername) {
                                        commentsSnapshot[i].dislikes.splice(y, 1);
                                        break;
                                    }
                                }
                                commentsSnapshot[i].likes.push(globalUsername);
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
                    const docRef = doc(database, "publications", publicationId.id)
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        let commentsSnapshot = docSnap.data().comments_container

                        for (let i = 0; i < commentsSnapshot.length; i++) {
                            if (commentsSnapshot[i].message === message) {
                                if (commentsSnapshot[i].dislikes) {
                                    commentsSnapshot[i].dislikes.push(globalUsername);
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
                const docRef = doc(database, "publications", publicationId.id)
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    let commentsSnapshot = docSnap.data().comments_container

                    for (let i = 0; i < commentsSnapshot.length; i++) {
                        if (commentsSnapshot[i].message === message) {
                            if (commentsSnapshot[i].likes) {
                                for (let y = 0; y < commentsSnapshot[i].likes.length; y++) {
                                    if (commentsSnapshot[i].likes[y] === globalUsername) {
                                        commentsSnapshot[i].likes.splice(y, 1);
                                        break;
                                    }
                                }
                                commentsSnapshot[i].dislikes.push(globalUsername);
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
        <View style={styles.comment_container}>
            {/* Comentario principal */}
            <View style={styles.comment_view}>

                <View style={styles.comment_left}>
                    <Image style={styles.comment_avatar} source={require('../../assets/avatar-default.png')} />
                </View>

                <View style={styles.comment_right}>

                    <View style={styles.comment_header}>
                        {user == globalUsername ?
                            <Text style={styles.comment_myUsername}>{user}</Text>
                            :
                            <Text style={styles.comment_username}>{user}</Text>
                        }
                        <Text style={styles.comment_separator}>-</Text>
                        <Text style={styles.comment_date}>{convertDate(date)}</Text>
                    </View>

                    <View>
                        <Text style={styles.comment}>{message}</Text>
                    </View>

                    <View style={styles.comment_footer}>
                        <View style={styles.comment_likes_block}>
                            {/* like comment */}
                            {isLike ?
                                <MaterialCommunityIcons style={styles.comment_liked_buttons} name='thumb-up' />
                                :
                                <TouchableOpacity onPress={setLikeComment}>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-up' />
                                </TouchableOpacity>
                            }

                            {/* counter */}
                            <Text style={styles.comment_counter}>{likesTotal}</Text>

                            {/* dislike comment */}
                            {isDislike ?
                                <MaterialCommunityIcons style={styles.comment_disliked_buttons} name='thumb-down' />
                                :
                                <TouchableOpacity onPress={setDisikeComment}>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-down' />
                                </TouchableOpacity>
                            }




                        </View>
                        <View style={styles.comment_responces_block}>
                            <MaterialCommunityIcons style={styles.comment_buttons} name='message-processing' />
                            <Text style={styles.comment_counter}>{allAnswers}</Text>
                        </View>
                        <TouchableOpacity onPress={replyComment}>
                            <Text style={styles.reply_button}>Responder</Text>
                        </TouchableOpacity>
                    </View>

                    {allAnswers > 0 ?
                        <TouchableOpacity onPress={show}>
                            {showAnswers ?
                                <View style={styles.comment_show_responces}>
                                    <MaterialCommunityIcons style={styles.interact_icon} name='chevron-up' />
                                    <Text style={styles.load_comments_label}>Ocultar comentarios</Text>
                                </View>
                                :
                                <View style={styles.comment_show_responces}>
                                    <MaterialCommunityIcons style={styles.interact_icon} name='chevron-down' />
                                    <Text style={styles.load_comments_label}>Cargar comentarios</Text>
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
                comment_answers.map((comment, key) => (<Comment_answer key={key} props={props} comment_answers={comment_answers} principalMessage={message} {...comment} />))
                :
                <View></View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    comment_container: {
        backgroundColor: "#550038",
        padding: 15,
        flexDirection: "column",
        borderRadius: 20,
        marginBottom: 15
    },
    comment_avatar: {
        height: 42,
        width: 42,
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
        marginVertical: 5,
    },
    comment_buttons: {
        fontSize: 20,
        color: "#a6006a"
    },
    comment_liked_buttons: {
        fontSize: 20,
        color: "#abf752"
    },
    comment_disliked_buttons: {
        fontSize: 20,
        color: "#994cf0"
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
    load_comments_label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#e8007c"
    },
    interact_icon: {
        fontSize: 26,
        color: "#a6006a"
    },
    comment_show_responces: {
        flexDirection: "row",
        marginVertical: 10
    },
    comment_responces_block: {
        flexDirection: "row",
        marginLeft: 30,
    },
    reply_button: {
        color: "#e8007c",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10
    }
})