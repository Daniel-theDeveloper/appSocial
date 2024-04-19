import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasCommented } from '../../utils/interations';

import { doc, getDocs, updateDoc, arrayUnion, collection } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

export let publicationData = {
    id: ""
}
export var userId = {
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
    shares,
    name
}) {
    const allLikes = likes.length
    const allComments = comments_container.length
    const [isLike, setIsLike] = useState(isWasInteracted(likes));
    const [isComment, setIsComment] = useState(isWasCommented(comments_container));
    const [isShared, setIsShared] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [imageURL, setImageURL] = useState(null);

    const [avatarURL, setAvatarURL] = useState(null);
    const [nickname, setNickname] = useState(null);

    useEffect(() => {
        loadUserData();
        fetchImage();
    }, [])

    const fetchImage = async () => {
        if (urlImage != null) {
            const storage = getStorage();
            const imageRef = ref(storage, urlImage);
            const getUrl = await getDownloadURL(imageRef);

            setImageURL(getUrl);
        }
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
                if (res.username === name) {
                    fetchImageAvatar(res.avatar);
                    setNickname(res.name);
                }
            })
        } catch (error) {
            console.error(error);
        }
    }

    function goDetails() {
        publicationData = {
            id: id,
            nickname: nickname,
            avatar: avatarURL
        }
        props.navigation.navigate('Details');
    }

    function goPerfil() {
        userId.id = name
        props.navigation.navigate('Perfil');
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
        if (isComment) {
            publicationData = {
                id: id,
                nickname: nickname,
                avatar: avatarURL
            }
            goDetails();
        } else {
            publication_selected = {
                body: body,
                avatar: avatarURL,
                comments_container: comments_container,
                date: date,
                likes: likes.length,
                user: nickname
            }
            publicationData = {
                id: id
            }
            props.navigation.navigate('FastComment');
        }
    }

    const setShared = async () => {
        if (isShared) {
            setIsShared(false)
        } else {
            setIsShared(true)
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
                    {name === localUserLogin.username ?
                        <View style={styles.perfil_usernames_container}>
                            <View style={styles.perfil_usernames_block}>
                                <Text style={styles.myUsername}>{nickname}</Text>
                                <Text style={styles.myUsername}>-</Text>
                                <Text style={styles.myGlobalUsername}>@{name}</Text>
                            </View>
                            <Text style={styles.myDate}>{convertDate(date.seconds)}</Text>
                        </View>
                        :
                        <View style={styles.perfil_usernames_container}>
                            <View style={styles.perfil_usernames_block}>
                                <Text style={styles.username}>{nickname}</Text>
                                <Text style={styles.username}>-</Text>
                                <Text style={styles.globalUsername}>@{name}</Text>
                            </View>
                            <Text style={styles.date}>{convertDate(date.seconds)}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>

            <View style={styles.publication_container}>
                <TouchableOpacity onPress={goDetails}>
                    <Text style={styles.publication_text}>{body}</Text>
                    {urlImage != null ?
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
                                <Text style={styles.interacted_shared_label}>{shares}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                                <Text style={styles.interact_label}>{shares}</Text>
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
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    globalUsername: {
        fontSize: 18,
        color: "#ff0070"
    },
    myGlobalUsername: {
        fontSize: 18,
        color: "#7e8d3d"
    },
    myUsername: {
        marginRight: 5,
        fontWeight: "bold",
        fontSize: 18,
        color: "#abf752"
    },
    date: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#235d6f"
    },
    myDate: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#7e8d3d"
    },
    publication_container: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
    },
    publication_text: {
        fontSize: 18,
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
        fontSize: 23,
        color: "#a6006a"
    },
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
    },
    interact_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#a6006a"
    },
    interacted_like_icon: {
        fontSize: 23,
        color: "#ffe400"
    },
    interacted_like_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#ffe400"
    },
    interacted_comment_icon: {
        fontSize: 23,
        color: "#46b0d5"
    },
    interacted_comment_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#46b0d5"
    },
    interacted_shared_icon: {
        fontSize: 23,
        color: "#afff53"
    },
    interacted_shared_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#afff53"
    },
    interacted_saved_icon: {
        fontSize: 23,
        color: "#ff6c00"
    },
})