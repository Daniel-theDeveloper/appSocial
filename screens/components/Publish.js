import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasCommented, isWasInteractedByID, fetchImage, savePublish, isWasSaved, deleteSavePublish, likePublish, deleteLike } from '../../utils/interations';
import ReplyPublish from './replyPublish';

import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

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

    const { colors } = useTheme();

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
                setNickname(await docSnap.data().name);
                setUsername(await docSnap.data().username);
                setIsSaved(await isWasSaved(id));
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
            setIsLike(false);
            const res = await deleteLike(id);
            if (!res) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo mas tarde");
                setIsLike(true);
            }
        } else {
            setIsLike(true);
            const res = await likePublish(id);
            if (!res) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo mas tarde");
                setIsLike(false);
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
            setIsSaved(false);
            const res = await deleteSavePublish(id);
            if (res) {
                console.log("Publicacion eliminada exitosamente");
            } else {
                setIsSaved(true);
                Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
            }
        } else {
            setIsSaved(true);
            const res = await savePublish(id);
            if (res) {
                console.log("Publicacion guardada exitosamente");
            } else {
                setIsSaved(false);
                Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
            }
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
                                <Text style={{marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary}}>{nickname}</Text>
                                <Text style={{marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary}}>-</Text>
                                <Text style={{fontSize: 16, color: colors.tertiary_dark}}>@{username}</Text>
                            </View>
                            <Text style={{fontSize: 12, fontWeight: "bold", color: colors.tertiary_dark_alternative}}>{convertDate(date.seconds)}</Text>
                        </View>
                        :
                        <View style={styles.perfil_usernames_container}>
                            <View style={styles.perfil_usernames_block}>
                                <Text style={{marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary}}>{nickname}</Text>
                                <Text style={{marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary}}>-</Text>
                                <Text style={{fontSize: 16, color: colors.primary}}>@{username}</Text>
                            </View>
                            <Text style={{fontSize: 12, fontWeight: "bold", color: colors.secondary_dark}}>{convertDate(date.seconds)}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>

            <View style={{padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15, shadowColor: colors.shadow, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5}}>
                <TouchableOpacity onPress={goDetails}>
                    <Text style={{fontSize: 15, marginBottom: 15, color: colors.text}}>{body}</Text>
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
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.like}} name='heart' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.like}}>{allLikes}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='heart-outline' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative}}>{allLikes}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    {/* Area de comentarios */}
                    <TouchableOpacity onPress={setCommment}>
                        {isComment ?
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.comment}} name='message' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.comment}}>{allComments}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='message-outline' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative}}>{allComments}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    {/* Area de compartir */}
                    <TouchableOpacity onPress={setShared}>
                        {isShared ?
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.share}} name='repeat-variant' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.share}}>{shares.length}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='repeat-variant' />
                                <Text style={{fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative}}>{shares.length}</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={setSaved}>
                        {isSaved ?
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.save}} name='book' />
                            :
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='book-outline' />
                        }
                    </TouchableOpacity>
                    <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='share-variant' />
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
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
    }
});