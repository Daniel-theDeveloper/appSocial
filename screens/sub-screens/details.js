import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasInteractedByID, sendNotification, likePublish } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';
import Comment from '../components/Comment';
import ReplyPublish from '../components/replyPublish';
import { useTheme } from '@react-navigation/native';
// import { compareDesc } from "date-fns";

import { doc, updateDoc, arrayUnion, collection, onSnapshot, query } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function Details(props) {
    const [publicationArray, setPublicationArray] = useState({
        id: "",
        body: "",
        nickname: "",
        urlImage: null,
        replyId: null,
        comments: "",
        comments_container: [],
        date: "",
        likes: [],
        shares: 0,
        userId: ""
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

    const { colors } = useTheme();

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
                if (res.id === props.route.params?.id) {
                    getData = {
                        id: res.id,
                        body: res.data['body'],
                        userId: res.data['userId'],
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

            if (props.route.params?.avatar != null) {
                setAvatarURL(props.route.params?.avatar);
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
            setIsLike(true);
            const res = await likePublish(id);
            if (!res) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo mas tarde");
                setIsLike(false);
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
                if (publicationArray.userId !== localUserLogin.id) {
                    await sendNotification('comment', publicationArray.userId, publicationArray.id, myComment);
                }
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
        <ScrollView style={{backgroundColor: colors.background}} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <TouchableOpacity onPress={goBackAgain}>
                    <View style={styles.back_block}>
                        <MaterialCommunityIcons style={{fontSize: 49, color: colors.secondary}} name='chevron-left' />
                        <Text style={{fontSize: 21, fontWeight: "bold", color: colors.secondary}}>Regresar</Text>
                    </View>
                </TouchableOpacity>
                <View style={{backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5}}>
                    {/* Encabezado de la publicacion */}
                    <View style={styles.perfil_header}>
                        <View style={styles.perfil_user}>
                            <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                            <View style={styles.perfil_usernames_container}>
                                <Text style={{fontSize: 17, fontWeight: "bold", color: colors.secondary}}>{props.route.params?.nickname} publicó</Text>
                                <Text style={{fontSize: 15, fontWeight: "bold", color: colors.secondary_dark}}>{convertDate(publicationArray.date)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Cuerpo de la publicacion */}
                    <Text style={{fontSize: 17, marginBottom: 15, color: colors.text}}>{publicationArray.body}</Text>
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
                            <Text style={{fontSize: 15, fontWeight: "bold", color: colors.primary}}>{allComments}</Text>
                            <Text style={{fontSize: 15, marginLeft: 5, color: colors.primary}}>Comentarios</Text>
                        </View>
                        <Text style={{fontSize: 17, fontWeight: "bold", marginHorizontal: 15, color: colors.primary}}>|</Text>
                        <View style={styles.statistics_block}>
                            <Text style={{fontSize: 15, fontWeight: "bold", color: colors.primary}}>{allLikes}</Text>
                            <Text style={{fontSize: 15, marginLeft: 5, color: colors.primary}}>Likes</Text>
                        </View>
                    </View>
                    {/* Zona de interaccion */}
                    <View style={styles.interact_container}>
                        <TouchableOpacity onPress={setLike}>
                            {isLike ?
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.like}} name='heart' />
                                :
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='heart-outline' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={setShared}>
                            {isShared ?
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.share}} name='repeat-variant' />
                                :
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='repeat-variant' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={saveThisPublish}>
                            {isSaved ?
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.save}} name='book' />
                                :
                                <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='book-outline' />
                            }
                        </TouchableOpacity>


                        <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='share-variant' />
                        <MaterialCommunityIcons style={{fontSize: 25, color: colors.primary_dark_alternative}} name='chevron-down' />
                    </View>
                </View>

                {/* Zona de comentarios */}
                <Text style={{fontSize: 19, fontWeight: "bold", marginVertical: 20, color: colors.primary}}>Comentarios</Text>

                <View style={{backgroundColor: colors.primary_dark, padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5}}>
                    <View style={styles.new_comment_header}>
                        <Image style={styles.comment_avatar} source={myAvatar != null ? { uri: myAvatar } : require('../../assets/avatar-default.png')} />
                        <View style={{backgroundColor: colors.background, minHeight: 50, maxHeight: 300, width: "85%", borderRadius: 10, padding: 5}}>
                            <TextInput
                                style={{fontSize: 15, color: colors.text}}
                                placeholder='Escribe un comentario'
                                placeholderTextColor={colors.holderText}
                                multiline={true}
                                onChangeText={(text) => setMyCommnent(text)}
                                maxLength={500} />
                        </View>
                    </View>

                    {loadingButton ?
                        <View style={{flexDirection: "row", justifyContent: "center", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark}}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text}}>Publicando</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sendMyComment}>
                            <View style={{padding: 10, borderRadius: 10, backgroundColor: colors.quartet}}>
                                <Text style={{fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text}}>Publicar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                {publicationArray.comments_container.map((comment, key) => (<Comment key={key} props={props} publicationId={props.route.params?.id} {...comment} />))}
                {/* {orderComments.map((comment, key) => (<Comment key={key} props={props} {...comment} />))} */}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        paddingBottom: 40,
        paddingHorizontal: 12,
    },
    back_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
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
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    new_comment_header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
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