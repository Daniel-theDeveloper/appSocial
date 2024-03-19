import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { globalUsername } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { isWasLiked } from '../../utils/interations';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { database } from '../../utils/database';

export let publicationArray = {
    id: "",
    body: "",
    comments: 0,
    date: "",
    likes: [],
    shares: 0,
    name: "",
}

export default function Publication({
    props,
    id,
    body,
    comments,
    date,
    likes,
    shares,
    name,
}) {
    const allLikes = likes.length
    const [isLike, setIsLike] = useState((isWasLiked(likes)));
    const [isComment, setIsComment] = useState((false));
    const [isShared, setIsShared] = useState((false));
    const [isSaved, setIsSaved] = useState((false));

    function goDetails() {
        publicationArray = {
            id: id,
            body: body,
            comments: comments,
            date: date,
            likes: likes,
            shares: shares,
            name: name,
        }
        props.navigation.navigate('Details')
    }

    const setLike = async () => {
        if (isLike) {
            // Show a list like person
        } else {
            try {
                const docRef = doc(database, 'publications', id);
                await updateDoc(docRef, {
                    likes: arrayUnion(globalUsername)
                });
                setIsLike(true);
            } catch (error) {
                console.error(error);
            }
        }
    }

    const setCommment = async () => {
        if (isComment) {
            setIsComment(false)
        } else {
            setIsComment(true)
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
            <View style={styles.perfil_header}>
                <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                <View style={styles.perfil_usernames_container}>
                    <Text style={styles.username}>{name}</Text>
                    <Text style={styles.date}>{convertDate(date.seconds)}</Text>
                </View>
            </View>

            <View style={styles.publication_container}>
                <TouchableOpacity onPress={goDetails}>
                    <Text style={styles.publication_text}>{body}</Text>
                    {/* <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} /> */}
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
                                <Text style={styles.interacted_comment_label}>{comments}</Text>
                            </View>
                            :
                            <View style={styles.interact_block}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='message-outline' />
                                <Text style={styles.interact_label}>{comments}</Text>
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
        margin: 15
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
    username: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    date: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#235d6f"
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
        height: 400,
        width: "100%",
        marginBottom: 15
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