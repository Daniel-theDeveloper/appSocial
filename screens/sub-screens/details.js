import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasInteractedByID } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';
import { publicationData } from '../components/Publish';
import Comment from '../components/Comment';
import ReplyPublish from '../components/replyPublish';
// import { compareDesc } from "date-fns";

import { doc, updateDoc, arrayUnion, collection, onSnapshot, query } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function Details(props) {
    const [publicationArray, setPublicationArray] = useState({
        id: "",
        body: "",
        name: "",
        nickname: "",
        urlImage: null,
        replyId: null,
        comments: "",
        comments_container: [],
        date: "",
        likes: [],
        shares: 0
    });
    const [loadingButton, setLoadingButton] = useState((false));

    const [allLikes, setAllLikes] = useState(0)
    const [allComments, setAllComments] = useState(0);

    const [replyId, setReplyId] = useState(null);
    const [isLike, setIsLike] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [avatarURL, setAvatarURL] = useState(null);
    const [myAvatar, setMyAvatar] = useState(null);

    const [myComment, setMyCommnent] = useState("");

    // const orderComments = publicationArray.comments_container.sort(function(a, b) {
    //     return compareDesc(a.date, b.date);
    // })

    useEffect(() => {
        let data = []
        let getData = []
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef);

        const fetchImage = async (urlImage) => {
            const storage = getStorage();
            const imageRef = ref(storage, urlImage);
            const url = await getDownloadURL(imageRef);

            setImageURL(url);
        }

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            QuerySnapshot.docs.map(doc => {
                data.push({ id: doc.id, data: doc.data() });
            })
            data.find(function (res) {
                if (res.id === publicationData.id) {
                    getData = {
                        id: res.id,
                        body: res.data['body'],
                        name: res.data['user'],
                        urlImage: res.data['urlImage'],
                        replyId: res.data['replyID'],
                        comments: res.data['comments'],
                        comments_container: res.data['comments_container'],
                        date: res.data['date'],
                        likes: res.data['likes'],
                        shares: res.data['shares']
                    }
                }
            });

            if (getData.urlImage != null) {
                fetchImage(getData.urlImage);
            }

            if (publicationData.avatar != null) {
                setAvatarURL(publicationData.avatar);
            }

            setMyAvatar(localUserLogin.avatar);
            setReplyId(getData.replyId);
            setAllLikes(getData.likes.length);
            setAllComments(getData.comments_container.length);
            setIsLike(isWasInteracted(getData.likes));
            setIsShared(isWasInteractedByID(getData.shares));
            setPublicationArray(getData);
        })
        return unsuscribe;
    }, []);

    function goBackAgain() {
        props.navigation.goBack()
    }

    const setLike = async () => {
        if (isLike) {
            // Show a list like person
        } else {
            try {
                const docRef = doc(database, 'publications', publicationArray.id);
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

    const setShared = async () => {
        if (isShared) {
            setIsShared(false)
        } else {
            setIsShared(true)
        }
    }

    const sendMyComment = async () => {
        if (myComment !== "") {
            setLoadingButton(true);
            const commentArray = {
                comment_answers: [],
                date: new Date(),
                dislikes: [],
                likes: [],
                message: myComment,
                user: localUserLogin.username
            }
            try {
                const docRef = doc(database, 'publications', publicationArray.id);
                await updateDoc(docRef, {
                    comments_container: arrayUnion(commentArray)
                });
                setMyCommnent("");
                setLoadingButton(false);
            } catch (error) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            console.log("Escribe algo")
        }
    }

    const saveThisPublish = async () => {
        if (isSaved) {
            // Delete this publish
            setIsSaved(false);
        } else {
            // Save this publish
            setIsSaved(true);
        }
    }

    return (
        <ScrollView style={styles.father} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <TouchableOpacity onPress={goBackAgain}>
                    <View style={styles.back_block}>
                        <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                        <Text style={styles.back_label}>Regresar</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.publication}>
                    {/* Encabezado de la publicacion */}
                    <View style={styles.perfil_header}>
                        <View style={styles.perfil_user}>
                            <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                            <View style={styles.perfil_usernames_container}>
                                <Text style={styles.username}>{publicationData.nickname} publicó</Text>
                                <Text style={styles.date}>{convertDate(publicationArray.date)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Cuerpo de la publicacion */}
                    <Text style={styles.publication_text}>{publicationArray.body}</Text>
                    {replyId != null || replyId != undefined ?
                        <ReplyPublish  props={props} replyID={replyId} />
                        :
                        imageURL != null ?
                            <Image style={styles.publication_image} source={{ uri: imageURL }} />
                            :
                            <View></View>
                    }

                    {/* Zona de estadisticas */}
                    <View style={styles.statistics}>
                        <View style={styles.statistics_block}>
                            <Text style={styles.statistics_num}>{allComments}</Text>
                            <Text style={styles.statistics_label}>Comentarios</Text>
                        </View>
                        <Text style={styles.statistics_separator}>|</Text>
                        <View style={styles.statistics_block}>
                            <Text style={styles.statistics_num}>{allLikes}</Text>
                            <Text style={styles.statistics_label}>Likes</Text>
                        </View>
                    </View>
                    {/* Zona de interaccion */}
                    <View style={styles.interact_container}>
                        <TouchableOpacity onPress={setLike}>
                            {isLike ?
                                <MaterialCommunityIcons style={styles.interacted_icon_like} name='star' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='star-outline' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={setShared}>
                            {isShared ?
                                <MaterialCommunityIcons style={styles.interacted_icon_shared} name='repeat-variant' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={saveThisPublish}>
                            {isSaved ?
                                <MaterialCommunityIcons style={styles.interacted_icon_shared} name='book' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='book-outline' />
                            }
                        </TouchableOpacity>


                        <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                        <MaterialCommunityIcons style={styles.interact_icon} name='chevron-down' />
                    </View>
                </View>

                {/* Zona de comentarios */}
                <Text style={styles.comment_principal_title}>Comentarios</Text>

                <View style={styles.new_comment_container}>
                    <View style={styles.new_comment_header}>
                        <Image style={styles.comment_avatar} source={myAvatar != null ? { uri: myAvatar } : require('../../assets/avatar-default.png')} />
                        <View style={styles.new_comment_input_block}>
                            <TextInput
                                style={styles.new_comment_input}
                                placeholder='Escribe un comentario'
                                placeholderTextColor="#ed007e"
                                multiline={true}
                                onChangeText={(text) => setMyCommnent(text)}
                                maxLength={500} />
                        </View>
                    </View>

                    {loadingButton ?
                        <View style={styles.loading_comment_button}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.loading_comment_label}>Publicando</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sendMyComment}>
                            <View style={styles.new_comment_button}>
                                <Text style={styles.new_comment_label}>Publicar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                {publicationArray.comments_container.map((comment, key) => (<Comment key={key} props={props} {...comment} />))}
                {/* {orderComments.map((comment, key) => (<Comment key={key} props={props} {...comment} />))} */}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    father: {
        backgroundColor: "#210016"
    },
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016",
        paddingBottom: 40,
        paddingHorizontal: 12
    },
    back_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    back_label: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    back_button: {
        fontSize: 49,
        color: "#4CC9F0"
    },
    publication: {
        backgroundColor: "#550038",
        padding: 18,
        borderRadius: 20
    },
    perfil_header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    perfil_user: {
        flexDirection: "row",
        alignItems: "center"
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    username: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    date: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#235d6f"
    },
    follow_button: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: "#4CC9F0",
        outlineStyle: "solid",
        outlineWidth: 4,
    },
    follow_label: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    followed: {
        flexDirection: "row",
        marginVertical: 10
    },
    followedIcon: {
        color: "#abf752",
        fontSize: 23,
        marginRight: 10
    },
    followedLabel: {
        color: "#abf752",
        fontSize: 15,
        fontWeight: "bold"
    },
    publication_text: {
        fontSize: 17,
        marginBottom: 15,
        color: "white"
    },
    publication_image: {
        minHeight: 200,
        maxHeight: 400,
        width: "100%",
        marginBottom: 15,
        borderRadius: 15
    },
    statistics: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statistics_block: {
        flexDirection: "row"
    },
    statistics_num: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#ed007e"
    },
    statistics_label: {
        fontSize: 15,
        marginLeft: 5,
        color: "#ed007e"
    },
    statistics_separator: {
        fontSize: 17,
        fontWeight: "bold",
        marginHorizontal: 15,
        color: "#ed007e"
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    interact_icon: {
        fontSize: 25,
        color: "#a6006a"
    },
    interacted_icon_like: {
        fontSize: 25,
        color: "#ffe400"
    },
    interacted_icon_shared: {
        fontSize: 25,
        color: "#afff53"
    },
    interact_icon_saved: {
        fontSize: 25,
        color: "#ff6c00"
    },
    comment_principal_title: {
        fontSize: 19,
        fontWeight: "bold",
        marginVertical: 20,
        color: "#ed007e"
    },
    new_comment_container: {
        backgroundColor: "#550038",
        padding: 15,
        borderRadius: 20,
        marginBottom: 15
    },
    new_comment_header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    new_comment_input_block: {
        backgroundColor: "#220014",
        minHeight: 50,
        maxHeight: 300,
        width: "85%",
        borderRadius: 10,
        padding: 5
    },
    new_comment_input: {
        fontSize: 15,
        color: "white"
    },
    new_comment_button: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#2f8dff"
    },
    new_comment_label: {
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loading_comment_button: {
        flexDirection: "row",
        justifyContent: "center",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#16457e"
    },
    loading_comment_label: {
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loadingSpinner: {
        marginRight: 10
    },
    comment_avatar: {
        height: 42,
        width: 42,
        borderRadius: 100
    },
})