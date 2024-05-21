import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
// import { publicationData } from './Publish';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, getDoc, getDocs, collection } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

export default function ReplyPublish({ props, replyID }) {
    const [replyData, setReplyData] = useState({
        id: "",
        username: "",
        date: "",
        body: "",
        urlImage: null
    });
    const [isReplyDelete, setReplyDelete] = useState(false);
    const [replyImage, setReplyImage] = useState(null);
    const [replyAvatar, setReplyAvatar] = useState(null);
    const [replyNickname, setReplyNickname] = useState(null);
    const [replyFollows, setReplyFollows] = useState([]);

    useEffect(() => {
        loadReplyData();
    }, []);

    const loadReplyData = async () => {
        try {
            const docRef = doc(database, 'publications', replyID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setReplyData({
                    id: docSnap.id,
                    date: docSnap.data().date,
                    body: docSnap.data().body
                });
                await fetchImageReply(docSnap.data().urlImage);
                await loadUserReplyData(docSnap.data().userId);
            } else {
                setReplyDelete(true);
            }
        } catch (error) {
            setReplyDelete(true);
            console.log(error);
        }
    }

    const fetchImageReply = async (url) => {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);

            setReplyImage(getUrl);
        }
    }

    const fetchAvatarReply = async (url) => {
        if (url != null) {
            const storage = getStorage();
            const imageRef = ref(storage, url);
            const getUrl = await getDownloadURL(imageRef);

            setReplyAvatar(getUrl);
        }
    }

    const loadUserReplyData = async (userId) => {
        try {
            const docRef = doc(database, "users", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setReplyNickname(docSnap.data().name);
                setReplyFollows(docSnap.data().following);
                fetchAvatarReply(docSnap.data().avatar);
            } else {
                setReplyNickname('USUARIO ELIMINADO');
                setReplyFollows([]);
                fetchAvatarReply(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function goDetails() {
        props.navigation.navigate({ name: 'Details', params: { id: replyID, nickname: replyNickname, avatar: replyAvatar }, merge: true });
    }

    return (
        <View>
            {isReplyDelete ?
                <View style={styles.replyContainer}>
                    <View style={styles.replyTitleBlock}>
                        <MaterialCommunityIcons style={styles.replyTitleIcon} name='alert-box-outline' />
                        <Text style={styles.replyTitleLabel}>Esta publicacion se ha eliminado.</Text>
                    </View>
                </View>
                :
                <View style={styles.replyContainer}>
                    <TouchableOpacity onPress={goDetails}>
                        {/* Reply header */}
                        <View style={styles.replyTitleBlock}>
                            <MaterialCommunityIcons style={styles.replyTitleIcon} name='reply-outline' />
                            <Text style={styles.replyTitleLabel}>Respondiendo a:</Text>
                        </View>

                        {/* Reply body header */}
                        {replyData.username === localUserLogin.username ?
                            <View style={styles.reply_usernames_container}>
                                <View style={styles.perfil_usernames_block}>
                                    <Text style={styles.myUsername}>{replyNickname}</Text>
                                    <Text style={styles.myUsername}>-</Text>
                                    <Text style={styles.myGlobalUsername}>@{replyData.username}</Text>
                                </View>
                                <Text style={styles.myDate}>{convertDate(replyData.date)}</Text>
                            </View>
                            :
                            <View style={styles.reply_usernames_container}>
                                <View style={styles.perfil_usernames_block}>
                                    <Text style={styles.username}>{replyNickname}</Text>
                                    <Text style={styles.username}>-</Text>
                                    <Text style={styles.globalUsername}>@{replyData.username}</Text>
                                </View>
                                <Text style={styles.date}>{convertDate(replyData.date)}</Text>
                            </View>
                        }

                        {/* Reply body */}
                        <Text style={styles.publication_text}>{replyData.body}</Text>
                        {replyImage != null ?
                            <Image style={styles.publication_image} source={{ uri: replyImage }} />
                            :
                            <View></View>
                        }
                    </TouchableOpacity>

                </View>}
        </View>
    );
}


const styles = StyleSheet.create({
    replyTitleBlock: {
        flexDirection: "row",
        alignItems: "center"
    },
    replyTitleIcon: {
        marginRight: 10,
        color: "#ff0070",
        fontSize: 24
    },
    replyTitleLabel: {
        color: "#ff0070",
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "italic"
    },
    replyContainer: {
        padding: 10,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 4,
    },
    reply_usernames_container: {
        flexDirection: "column"
    },
    perfil_usernames_block: {
        flexDirection: "row",
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
    }

});