import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasCommented, isWasInteractedByID, fetchImage } from '../../utils/interations';
import ReplyPublish from './replyPublish';

import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

export let publicationData = {
    id: ""
}
export let publication_selected = []

export default function Publication({
    props,
    id,
    body,
    urlImage,
    comments_container,
    date,
    likes,
    replyID,
    shares,
    userId
}) {
    const allLikes = likes.length;
    const allComments = comments_container.length;

    const [isLike, setIsLike] = useState(isWasInteracted(likes));
    const [isComment, setIsComment] = useState(isWasCommented(comments_container));
    const [isShared, setIsShared] = useState(isWasInteractedByID(shares));
    const [isSaved, setIsSaved] = useState(false);
    const [imageURL, setImageURL] = useState(null);

    const [avatarURL, setAvatarURL] = useState(null);
    const [username, setUsername] = useState('');
    const [nickname, setNickname] = useState(null);

    useEffect(() => {
        loadUserData();
        loadFhoto();
    }, []);

    const loadFhoto = async () => {
        setImageURL(await fetchImage(urlImage));
    }

    const loadUserData = async () => {
        try {
            const docRef = doc(database, "users", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setAvatarURL(await fetchImage(docSnap.data().avatar));
                setNickname(docSnap.data().name);
                setUsername(docSnap.data().username)
            } else {
                console.error("Sin conexion");
            }
        } catch (error) {
            console.error(error);
        }
    }

    function goDetails() {
        props.navigation.navigate({ name: 'Details', params: { id: id, nickname: nickname, avatar: avatarURL }, merge: true });
    }

    function goPerfil() {
        props.navigation.navigate({ name: 'Perfil', params: { userId: userId }, merge: true });
    }

    const setLike = async () => {
        if (isLike) {
            // Show a list like person
        } else {
            try {
                const docRef = doc(database, 'publications', id);
                await updateDoc(docRef, {
                    likes: arrayUnion(localUserLogin.username)
                });
                setIsLike(true);
            } catch (error) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
            }
        }
    }

    function setCommment() {
        publication_selected = {
            body: body,
            avatar: avatarURL,
            comments_container: comments_container,
            date: date,
            likes: likes.length,
            user: nickname,
            userId: userId
        }
        publicationData = {
            id: id
        }
        props.navigation.navigate('FastComment');
    }

    const setShared = async () => {
        if (isShared) {
            // Show My Reply
        } else {
            props.navigation.navigate({ name: 'ReplyPublishScreen', params: { id: id, userIdSend: userId }, merge: true });
        }
    }

    const setSaved = async () => {
        if (isSaved) {
            setIsSaved(false)
        } else {
            setIsSaved(true)
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goPerfil}>
                <View style={styles.perfil_header}>
                    {avatarURL != null ?
                        <Image style={styles.avatar} source={{ uri: avatarURL }} />
                        :
                        <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                    }
                    {username === localUserLogin.username ?
                        <View style={styles.perfil_usernames_container}>
                            <View style={styles.perfil_usernames_block}>
                                <Text style={styles.myUsername}>{nickname}</Text>
                                <Text style={styles.myUsername}>-</Text>
                                <Text style={styles.myGlobalUsername}>@{username}</Text>
                            </View>
                            <Text style={styles.myDate}>{convertDate(date.seconds)}</Text>
                        </View>
                        :
                        <View style={styles.perfil_usernames_container}>
                            <View style={styles.perfil_usernames_block}>
                                <Text style={styles.username}>{nickname}</Text>
                                <Text style={styles.username}>-</Text>
                                <Text style={styles.globalUsername}>@{username}</Text>
                            </View>
                            <Text style={styles.date}>{convertDate(date.seconds)}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>

            <View style={styles.publication_container}>
                <TouchableOpacity onPress={goDetails}>
                    <Text style={styles.publication_text}>{body}</Text>
                    {replyID != null || replyID != undefined ?
                        <ReplyPublish props={props} replyID={replyID} />
                        :
                        urlImage != null ?
                            <Image style={styles.publication_image} source={{ uri: imageURL }} />
                            :
                            <View></View>
                    }
                </TouchableOpacity>

                <View style={styles.interact_container}>

                    {/* Area de likes */}
                    <TouchableOpacity onPress={setLike}>
                        {isLike ?
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interacted_like_icon} name='star' />
                                <Text style={styles.interacted_like_label}>{allLikes}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='star-outline' />
                                <Text style={styles.interact_label}>{allLikes}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    {/* Area de comentarios */}
                    <TouchableOpacity onPress={setCommment}>
                        {isComment ?
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interacted_comment_icon} name='message' />
                                <Text style={styles.interacted_comment_label}>{allComments}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='message-outline' />
                                <Text style={styles.interact_label}>{allComments}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    {/* Area de compartir */}
                    <TouchableOpacity onPress={setShared}>
                        {isShared ?
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interacted_shared_icon} name='repeat-variant' />
                                <Text style={styles.interacted_shared_label}>{shares.length}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                                <Text style={styles.interact_label}>{shares.length}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={setSaved}>
                        {isSaved ?
                            <MaterialCommunityIcons style={styles.interacted_saved_icon} name='book' />
                            :
                            <MaterialCommunityIcons style={styles.interact_icon} name='book-outline' />
                        }
                    </TouchableOpacity>
                    <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 15
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
    perfil_usernames_block: {
        flexDirection: "row",
    },
    username: {
        marginRight: 5,
        fontSize: 17,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    globalUsername: {
        fontSize: 17,
        color: "#ff0070"
    },
    myGlobalUsername: {
        fontSize: 17,
        color: "#7e8d3d"
    },
    myUsername: {
        marginRight: 5,
        fontWeight: "bold",
        fontSize: 17,
        color: "#abf752"
    },
    date: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#235d6f"
    },
    myDate: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#7e8d3d"
    },
    publication_container: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
    },
    publication_text: {
        fontSize: 17,
        marginBottom: 15,
        color: "white"
    },
    publication_image: {
        height: 200,
        width: "100%",
        marginBottom: 15,
        borderRadius: 15
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    interact_icon: {
        fontSize: 22,
        color: "#a6006a"
    },
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
    },
    interact_label: {
        fontSize: 13,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#a6006a"
    },
    interacted_like_icon: {
        fontSize: 22,
        color: "#ffe400"
    },
    interacted_like_label: {
        fontSize: 13,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#ffe400"
    },
    interacted_comment_icon: {
        fontSize: 22,
        color: "#46b0d5"
    },
    interacted_comment_label: {
        fontSize: 13,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#46b0d5"
    },
    interacted_shared_icon: {
        fontSize: 22,
        color: "#afff53"
    },
    interacted_shared_label: {
        fontSize: 13,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#afff53"
    },
    interacted_saved_icon: {
        fontSize: 22,
        color: "#ff6c00"
    },
});