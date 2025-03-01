import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasSaved, isWasInteractedByID, sendNotification, likePublish, deleteLike, savePublish, deleteSavePublish, fetchImage } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';
import Comment, { comment_Array } from '../components/Comment';
import ReplyPublish from '../components/replyPublish';
import { useTheme } from '@react-navigation/native';
// import { compareDesc } from "date-fns";

import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from 'react-native-modalbox';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Details(props) {
    const [publicationArray, setPublicationArray] = useState({
        id: props.route.params?.id,
        body: "",
        urlImages: null,
        replyId: null,
        comments_container: [],
        date: "",
        likes: [],
        shares: 0,
        userId: ""
    });
    const [CommentsArray, setCommentsArray] = useState([]);
    const [loadingButton, setLoadingButton] = useState((false));

    const [allLikes, setAllLikes] = useState(0)
    const [allComments, setAllComments] = useState(0);

    const [replyId, setReplyId] = useState(null);
    const [isLike, setIsLike] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [imageURL, setImageURL] = useState([]);
    const [avatarURL, setAvatarURL] = useState(null);
    const [myAvatar, setMyAvatar] = useState(null);

    const [myComment, setMyCommnent] = useState("");

    const [imagesModal, setImagesModal] = useState(false);
    const [imagesSelect, setImagesSelect] = useState(0);

    const { colors } = useTheme();
    const { t } = useTranslation();

    // Función con fallos cuando el usuario crea un nuevo comentario:
    // const orderComments = publicationArray.comments_container.sort(function(a, b) {
    //     return compareDesc(a.date, b.date);
    // })

    useEffect(() => {
        // let data = []
        // let getData = []
        // const collectionRef = collection(database, 'publications');
        // const q = query(collectionRef);

        // const unsuscribe = onSnapshot(q, QuerySnapshot => {
        //     QuerySnapshot.docs.map(doc => {
        //         data.push({ id: doc.id, data: doc.data() });
        //     })
        //     data.find(function (res) {
        //         if (res.id === props.route.params?.id) {
        //             getData = {
        //                 id: res.id,
        //                 body: res.data['body'],
        //                 userId: res.data['userId'],
        //                 urlImages: res.data['urlImages'],
        //                 replyId: res.data['replyID'],
        //                 comments: res.data['comments'],
        //                 comments_container: res.data['comments_container'],
        //                 date: res.data['date'],
        //                 likes: res.data['likes'],
        //                 shares: res.data['shares']
        //             }
        //         }
        //     });

        //     if (getData.length != 0) {
        //         if (getData.urlImages != null) {
        //             loadPhoto(getData.urlImages);
        //         }

        //         if (props.route.params?.avatar != null) {
        //             setAvatarURL(props.route.params?.avatar);
        //         }

        //         setMyAvatar(localUserLogin.avatar);
        //         setReplyId(getData.replyId);
        //         setAllLikes(getData.likes.length);
        //         setAllComments(getData.comments_container.length);
        //         setIsLike(isWasInteracted(getData.likes));
        //         setIsShared(isWasInteractedByID(getData.shares));
        //         setPublicationArray(getData);
        //         promiseSaved();
        //     } else {
        //         props.navigation.goBack();
        //         Alert.alert(t('noPublishFound'));
        //     }

        // })
        // return unsuscribe;
        loadPublish();
        loadComments();
    }, []);

    const loadPublish = async () => {
        try {
            const docRef = doc(database, 'publications', props.route.params?.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const publication = {
                    id: props.route.params?.id,
                    body: docSnap.data().body,
                    urlImages: docSnap.data().urlImages,
                    replyId: docSnap.data().replyID,
                    date: docSnap.data().date,
                    likes: docSnap.data().likes,
                    shares: docSnap.data().shares,
                    userId: docSnap.data().userId,
                    // A desaparecer
                    comments_container: [],
                }

                if (docSnap.data().urlImages != null) {
                    loadPhoto(docSnap.data().urlImages);
                }
                if (props.route.params?.avatar != null) {
                    setAvatarURL(props.route.params?.avatar);
                }

                setMyAvatar(localUserLogin.avatar);
                setReplyId(docSnap.data().replyId);
                setAllLikes(docSnap.data().likes.length);
                // setAllComments(docSnap.data().comments_container.length);
                setIsLike(isWasInteracted(docSnap.data().likes));
                setIsShared(isWasInteractedByID(docSnap.data().shares));
                setPublicationArray(publication);
                promiseSaved();
            } else {
                props.navigation.goBack();
                Alert.alert(t('noPublishFound'));
            }

        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            props.navigation.goBack()
        }
    }

    function loadComments() {
        try {
            const url = 'publications/' + props.route.params?.id + '/comments';
            const collectionRef = collection(database, url);
            const q = query(collectionRef, orderBy('date', 'desc'));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setAllComments(QuerySnapshot.docs.length);
                setCommentsArray(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        date: doc.data().date,
                        dislikes: doc.data().dislikes,
                        likes: doc.data().likes,
                        mediaURL: doc.data().mediaURL,
                        message: doc.data().message,
                        user: doc.data().user
                    }))
                )
            });
            return unsuscribe;

        } catch (error) {
            console.error(error);
        }
    }

    const loadPhoto = async (urlImages) => {
        let loadURLImages = [];
        if (urlImages != null) {
            for (let x = 0; x < urlImages.length; x++) {
                loadURLImages.push(await fetchImage(urlImages[x]))
            }
            setImageURL(loadURLImages);
        }
    }

    function goBackAgain() {
        props.navigation.goBack()
    }

    const promiseSaved = async () => {
        const x = await isWasSaved(props.route.params?.id);
        setIsSaved(x);
    }

    const setLike = async () => {
        if (isLike) {
            setIsLike(false);
            const res = await deleteLike(publicationArray.id);
            if (!res) {
                Alert.alert(t('errorTitle'), t('error'));
                setIsLike(true);
            }
        } else {
            setIsLike(true);
            const res = await likePublish(publicationArray.id);
            if (!res) {
                Alert.alert(t('errorTitle'), t('error'));
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
                // comment_answers: [],
                date: new Date(),
                dislikes: [],
                likes: [],
                mediaURL: null,
                message: myComment,
                user: localUserLogin.id
            }
            try {
                // const docRef = doc(database, 'publications', publicationArray.id);
                // await updateDoc(docRef, {
                //     comments_container: arrayUnion(commentArray)
                // });
                // if (publicationArray.userId !== localUserLogin.id) {
                //     await sendNotification('comment', publicationArray.userId, publicationArray.id, myComment);
                // }
                const url = "publications/" + publicationArray.id + "/comments";
                const res = await addDoc(collection(database, url), commentArray);
                
                setMyCommnent("");
                setLoadingButton(false);
            } catch (error) {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            Alert.alert(t('emptyPublishTitle'), t('emptyPublish'));
        }
    }

    const saveThisPublish = async () => {
        if (isSaved) {
            setIsSaved(false);
            const res = await deleteSavePublish(props.route.params?.id);
            if (res) {
                Alert.alert(t('deletePublish'));
            } else {
                setIsSaved(true);
                Alert.alert(t('errorTitle'), t('error'));
            }
        } else {
            setIsSaved(true);
            const res = await savePublish(props.route.params?.id);
            if (res) {
                Alert.alert(t('savePublish'));
            } else {
                setIsSaved(false);
                Alert.alert(t('errorTitle'), t('error'));
            }
        }
    }

    function openModalOptions() {
        if (imagesModal) {
            setImagesModal(false);
        } else {
            setImagesModal(true);
        }
    }

    function changeImageNext() {
        const maxImages = imageURL.length - 1
        if (imagesSelect < maxImages) {
            setImagesSelect(imagesSelect + 1);
        }
    }

    function changeImagePrevios() {
        if (imagesSelect > 0) {
            setImagesSelect(imagesSelect - 1);
        }
    }

    return (
        <View style={{ backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={true}>
                <View style={styles.container}>
                    <TouchableOpacity onPress={goBackAgain}>
                        <View style={styles.back_block}>
                            <MaterialCommunityIcons style={{ fontSize: 49, color: colors.secondary }} name='chevron-left' />
                            <Text style={{ fontSize: 21, fontWeight: "bold", color: colors.secondary }}>{t('return')}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ backgroundColor: colors.primary_dark, padding: 18, borderRadius: 20, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5 }}>
                        {/* Encabezado de la publicación */}
                        <View style={styles.perfil_header}>
                            <View style={styles.perfil_user}>
                                <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                                <View style={styles.perfil_usernames_container}>
                                    <Text style={{ fontSize: 17, fontWeight: "bold", color: colors.secondary }}>{props.route.params?.nickname}{t('publishedLabel')}</Text>
                                    <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(publicationArray.date)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Cuerpo de la publicación */}
                        <Text style={{ fontSize: 17, marginBottom: 15, color: colors.text }}>{publicationArray.body}</Text>
                        {replyId != null || replyId != undefined ?
                            <ReplyPublish props={props} replyID={replyId} />
                            :
                            imageURL != null ?
                                imageURL.length === 1 ?
                                    <Image style={{ height: 200, width: "100%", marginBottom: 15, borderRadius: 15 }} source={{ uri: imageURL[0] }} />
                                    :
                                    imageURL.length === 2 ?
                                        <TouchableOpacity onPress={openModalOptions} style={styles.images_container}>
                                            <Image style={{ marginRight: 3, height: 200, width: "49%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                            <Image style={{ marginLeft: 3, height: 200, width: "49%", borderTopRightRadius: 15, borderBottomRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                        </TouchableOpacity>
                                        :
                                        imageURL.length === 3 ?
                                            <TouchableOpacity onPress={openModalOptions} style={styles.images_container}>
                                                <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                                <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                    <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                                    <Image style={{ marginTop: 3, height: "48.5%", borderBottomRightRadius: 15 }} source={{ uri: imageURL[2] }} />
                                                </View>
                                            </TouchableOpacity>
                                            :
                                            imageURL.length > 3 ?
                                                <TouchableOpacity onPress={openModalOptions} style={styles.images_container}>
                                                    <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                                    <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                        <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                                        <ImageBackground source={{ uri: imageURL[2] }} imageStyle={{ opacity: 0.5, resizeMode: "cover", height: "100%", borderBottomRightRadius: 15 }} style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, height: "48.5%", borderBottomRightRadius: 15, backgroundColor: "#1f1f1f" }}>
                                                            <Text style={{ color: "white", fontSize: 36, }}>+{imageURL.length - 3}</Text>
                                                        </ImageBackground>
                                                    </View>
                                                </TouchableOpacity>
                                                :
                                                <View></View>
                                :
                                <View></View>
                        }

                        {/* Zona de estadísticas */}
                        <View style={styles.statistics}>
                            <View style={styles.statistics_block}>
                                <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.primary }}>{allComments}</Text>
                                <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('comments')}</Text>
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 15, color: colors.primary }}>|</Text>
                            <View style={styles.statistics_block}>
                                <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.primary }}>{allLikes}</Text>
                                <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('likes')}</Text>
                            </View>
                        </View>
                        {/* Zona de interacción */}
                        <View style={styles.interact_container}>
                            <TouchableOpacity onPress={setLike}>
                                {isLike ?
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.like }} name='heart' />
                                    :
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='heart-outline' />
                                }
                            </TouchableOpacity>

                            <TouchableOpacity onPress={setShared}>
                                {isShared ?
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.share }} name='repeat-variant' />
                                    :
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='repeat-variant' />
                                }
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveThisPublish}>
                                {isSaved ?
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.save }} name='book' />
                                    :
                                    <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='book-outline' />
                                }
                            </TouchableOpacity>


                            <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='share-variant' />
                            <MaterialCommunityIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='chevron-down' />
                        </View>
                    </View>

                    {/* Zona de comentarios */}
                    <Text style={{ fontSize: 19, fontWeight: "bold", marginVertical: 20, color: colors.primary }}>{t('comments')}</Text>

                    <View style={{ backgroundColor: colors.primary_dark, padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5 }}>
                        <View style={styles.new_comment_header}>
                            <Image style={styles.comment_avatar} source={myAvatar != null ? { uri: myAvatar } : require('../../assets/avatar-default.png')} />
                            <View style={{ backgroundColor: colors.background, minHeight: 50, maxHeight: 300, width: "85%", borderRadius: 10, padding: 5 }}>
                                <TextInput
                                    style={{ fontSize: 15, color: colors.text }}
                                    placeholder={t('createComment')}
                                    placeholderTextColor={colors.holderText}
                                    multiline={true}
                                    onChangeText={(text) => setMyCommnent(text)}
                                    maxLength={500} />
                            </View>
                        </View>

                        {loadingButton ?
                            <View style={{ flexDirection: "row", justifyContent: "center", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark }}>
                                <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                                <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sending')}</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={sendMyComment}>
                                <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.quartet }}>
                                    <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sendComment')}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>

                    {CommentsArray.length > 0 ?
                        CommentsArray.map((comment, key) => (<Comment key={key} props={props} publicationId={publicationArray.id} {...comment} />))
                        :
                        <View></View>}
                </View>

                <Modal style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: 'flex-end', padding: 15, backgroundColor: colors.modalColor }} position={"center"} isOpen={imagesModal} coverScreen={true} swipeToClose={false}>
                    {/* El ScrollView no funciona en el componente Modal */}
                    {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ display: "flex", flexDirection: "row", alignContent: "center" }}>
                        {imageURL.map((key, x) => (<Image key={key} style={{ width: 400, maxHeight: 230, marginRight: 60 }} source={{ uri: imageURL[x] }} ></Image>))}
                    </ScrollView> */}
                    <TouchableOpacity onPress={openModalOptions}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.primary_dark_alternative }} name='close' />
                    </TouchableOpacity>
                    <View style={{ display: 'flex', alignItems: 'flex-start', marginTop: 35, marginBottom: 20, width: "100%" }}>
                        <View style={styles.perfil_header}>
                            <View style={styles.perfil_user}>
                                <Image style={styles.avatar} source={avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                                <View style={styles.perfil_usernames_container}>
                                    <Text style={{ fontSize: 17, fontWeight: "bold", color: colors.secondary }}>{props.route.params?.nickname}{t('publishedLabel')}</Text>
                                    <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(publicationArray.date)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Image style={{ width: "100%", height: 250, marginBottom: 35 }} source={{ uri: imageURL[imagesSelect] }}></Image>

                    <View style={{ display: 'flex', alignItems: 'center', width: "100%" }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={changeImagePrevios}>
                                <MaterialCommunityIcons style={{ fontSize: 50, color: colors.primary_dark_alternative }} name='menu-left' />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 22, color: colors.text }}>{imagesSelect + 1} / {imageURL.length}</Text>
                            <TouchableOpacity onPress={changeImageNext}>
                                <MaterialCommunityIcons style={{ fontSize: 50, color: colors.primary_dark_alternative }} name='menu-right' />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 18, color: colors.text }}>{publicationArray.body}</Text>
                    </View>
                </Modal>
            </ScrollView>
        </View>
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
    images_container: {
        display: "flex",
        flexDirection: "row",
        maxHeight: 210,
        marginBottom: 15
    }
})