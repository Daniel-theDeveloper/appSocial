import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Alert, ImageBackground, ToastAndroid } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted, isWasSaved, isWasInteractedByID, likePublish, deleteLike, savePublish, deleteSavePublish, fetchImage, deletePublishAction, sendNotification } from '../../utils/interations';
import { localUserLogin } from '../../utils/localstorage';
import Report_publish from '../components/Report_publish';
import Comment from '../components/Comment';
import ReplyPublish from '../components/replyPublish';
import { useTheme } from '@react-navigation/native';
// import { compareDesc } from "date-fns";

import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { database } from '../../utils/database';
import * as ImagePicker from 'expo-image-picker';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Octicons from "react-native-vector-icons/Octicons";
import Ionicons from 'react-native-vector-icons/Ionicons';

import Modal from 'react-native-modalbox';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Details(props) {
    const [publicationArray, setPublicationArray] = useState({
        id: props.route.params?.id,
        body: "",
        urlImages: null,
        replyId: null,
        status: null,
        // comments_container: [],
        date: "",
        likes: [],
        shares: 0,
        author: null,
        userId: null
    });

    const [isAvailable, setIsAvailable] = useState(true);

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
    const [urlMedia, setUrlMedia] = useState(null);
    const [mediaName, setMediaName] = useState(null);
    const [showMediaComment, setShowMediaComment] = useState(false);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [modalOptions, setModalOptions] = useState(false);
    const [reportModal, setReportModal] = useState(false);

    const [myComment, setMyComment] = useState("");

    const [imagesModal, setImagesModal] = useState(false);
    const [imagesSelect, setImagesSelect] = useState(0);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const showRemoveAlert = () =>
        Alert.alert(
            t('deleteTitle'),
            t('deleteAsk'),
            [
                {
                    text: t('no'),
                },
                {
                    text: t('yes'),
                    onPress: () => deletePublish(),
                    style: 'cancel',
                },
            ],
        );

    const savePublishToast = () => {
        ToastAndroid.show(t('savePublish'), ToastAndroid.SHORT);
    }

    const deleteSavePublishToast = () => {
        ToastAndroid.show(t('deletePublish'), ToastAndroid.SHORT);
    }

    // Función con fallos cuando el usuario crea un nuevo comentario:
    // const orderComments = publicationArray.comments_container.sort(function(a, b) {
    //     return compareDesc(a.date, b.date);
    // })

    useEffect(() => {
        // let data = []
        // let getData = []
        // const collectionRef = collection(database, 'publications');
        // const q = query(collectionRef);

        // const unsubscribe = onSnapshot(q, QuerySnapshot => {
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
        // return unsubscribe;
        loadPublish();
        loadComments();
    }, []);

    const loadPublish = async () => {
        try {
            const docRef = doc(database, 'publications', props.route.params?.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (docSnap.data().status < 5) {
                    const isBlock = localUserLogin.blackList.includes(docSnap.data().userId) || localUserLogin.blockUsers.includes(docSnap.data().userId);
                    if (!isBlock) {
                        const publication = {
                            id: props.route.params?.id,
                            body: docSnap.data().body,
                            urlImages: docSnap.data().urlImages,
                            replyId: docSnap.data().replyID,
                            status: docSnap.data().status,
                            date: docSnap.data().date,
                            likes: docSnap.data().likes,
                            shares: docSnap.data().shares,
                            author: docSnap.data().author,
                            userId: docSnap.data().userId
                        }

                        if (docSnap.data().urlImages != null) {
                            loadPhoto(docSnap.data().urlImages);
                        }
                        if (props.route.params?.avatar != null) {
                            setAvatarURL(props.route.params?.avatar);
                        }

                        setMyAvatar(localUserLogin.avatar);
                        setReplyId(docSnap.data().replyID);
                        setAllLikes(docSnap.data().likes.length);
                        // setAllComments(docSnap.data().comments_container.length);
                        setIsLike(isWasInteracted(docSnap.data().likes));
                        setIsShared(isWasInteractedByID(docSnap.data().shares));
                        setPublicationArray(publication);
                        promiseSaved();
                    } else {
                        setIsAvailable(false);
                    }
                } else {
                    setIsAvailable(false);
                }
            } else {
                props.navigation.goBack();
                setIsAvailable(false);
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

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
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
            return unsubscribe;

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

    const submitImageComment = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            setLoadingMedia(true);
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: false,
                allowsEditing: true,
                quality: 0.1,
                aspect: [4, 3],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

            if (image.canceled) {
                setLoadingMedia(false);
            } else {
                setUrlMedia(image.assets[0].uri);
                setMediaName(image.assets[0].fileName);
                setLoadingMedia(false);
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    const pickPhotoComment = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();

        if (granted) {
            setLoadingMedia(true);
            const image = await ImagePicker.launchCameraAsync({
                allowsMultipleSelection: false,
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 0.1,
            });

            if (image.canceled) {
                setLoadingMedia(false);
            } else {
                setUrlMedia(image.assets[0].uri);
                setMediaName(image.assets[0].fileName);
                setLoadingMedia(false);
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    function deleteImageComment() {
        setUrlMedia(null);
        setLoadingMedia(false);
        setShowMediaComment(true);
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
            let pathImage = null;
            try {
                // const docRef = doc(database, 'publications', publicationArray.id);
                // await updateDoc(docRef, {
                //     comments_container: arrayUnion(commentArray)
                // });
                // if (publicationArray.userId !== localUserLogin.id) {
                //     await sendNotification('comment', publicationArray.userId, publicationArray.id, myComment);
                // }

                if (urlMedia != null) {
                    const url = localUserLogin.username + "/publicationImages/" + props.route.params?.id + "/imagesComment/" + mediaName;

                    const response = await fetch(urlMedia);
                    const blob = await response.blob();
                    const storage = getStorage();
                    const storageRef = ref(storage, url);

                    const snapshot = await uploadBytes(storageRef, blob);

                    pathImage = snapshot.ref.fullPath;
                }

                const commentArray = {
                    // comment_answers: [],
                    date: new Date(),
                    dislikes: [],
                    likes: [],
                    mediaURL: pathImage,
                    message: myComment,
                    user: localUserLogin.id
                }

                const url = "publications/" + publicationArray.id + "/comments";
                await addDoc(collection(database, url), commentArray);

                await sendNotification('comment', publicationArray.userId, publicationArray.id, myComment);

                setMyComment("");
                setLoadingButton(false);
                deleteImageComment();
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
                deleteSavePublishToast()
            } else {
                setIsSaved(true);
                Alert.alert(t('errorTitle'), t('error'));
            }
        } else {
            setIsSaved(true);
            const res = await savePublish(props.route.params?.id);
            if (res) {
                savePublishToast();
            } else {
                setIsSaved(false);
                Alert.alert(t('errorTitle'), t('error'));
            }
        }
    }

    function editPublish() {
        if (localUserLogin.id != undefined && localUserLogin.id != null) {
            if (publicationArray.userId === localUserLogin.id) {
                const myPublish = {
                    id: publicationArray.id,
                    body: publicationArray.body,
                    urlImages: publicationArray.urlImages,
                    date: publicationArray.date,
                    replyID: publicationArray.replyId,
                    status: publicationArray.status,
                    author: publicationArray.author
                }

                setModalOptions[false];
                props.navigation.navigate({ name: 'NewPublication', params: { isEdit: true, publishToEdit: myPublish }, merge: true });
            } else {
                // console.log("No eres el usuario creador de la publicación");
            }
        } else {
            Alert.alert(t('internetErrorTitle'), t('internetError'));
        }
    }

    const deletePublish = async () => {
        const res = await deletePublishAction(props.route.params?.id);

        if (res) {
            Alert.alert("Eliminado correctamente");
        } else {
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    function openModalOptions() {
        if (imagesModal) {
            setImagesModal(false);
        } else {
            setImagesModal(true);
        }
    }

    function selectShowMediaComment() {
        if (showMediaComment) {
            setShowMediaComment(false);
        } else {
            setShowMediaComment(true);
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

    function openModalConfig() {
        if (modalOptions) {
            setModalOptions(false);
        } else {
            setModalOptions(true);
        }
    }

    function openModalReport() {
        if (reportModal) {
            setReportModal(false);
        } else {
            setModalOptions(false);
            setReportModal(true);
        }
    }

    return (
        <View style={{ backgroundColor: colors.background }}>
            {isAvailable ?
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
                                <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 10, color: colors.primary }}>|</Text>
                                <View style={styles.statistics_block}>
                                    <Text style={{ fontSize: 15, fontWeight: "bold", color: colors.primary }}>{allLikes}</Text>
                                    <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('likes')}</Text>
                                </View>
                                <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 10, color: colors.primary }}>|</Text>
                                {publicationArray.status == undefined || publicationArray.status == null ?
                                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
                                        <ActivityIndicator size={'small'} color={colors.primary} />
                                        <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('loading')}</Text>
                                    </View>
                                    :
                                    publicationArray.status == 0 ?
                                        <View style={{ flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 7, backgroundColor: colors.error_dark }}>
                                            <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.text_error }} name='warning' />
                                            <Text style={{ fontSize: 14, marginLeft: 5, color: colors.text_error }}>{t('banned')}</Text>
                                        </View>
                                        :
                                        publicationArray.status == 1 ?
                                            <View style={{ flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 7, backgroundColor: colors.error_dark }}>
                                                <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.text_error }} name='eye-off' />
                                                <Text style={{ fontSize: 14, marginLeft: 5, color: colors.text_error }}>{t('private')}</Text>
                                            </View>
                                            :
                                            publicationArray.status == 2 ?
                                                <View style={{ flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 7, backgroundColor: colors.quartet_dark_alternative }}>
                                                    <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.quartet }} name='people' />
                                                    <Text style={{ fontSize: 14, marginLeft: 5, color: colors.quartet }}>{t('privateFollowers')}</Text>
                                                </View>
                                                :
                                                publicationArray.status == 3 ?
                                                    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
                                                        <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }} name='earth' />
                                                        <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('public')}</Text>
                                                    </View>
                                                    :
                                                    publicationArray.status == 4 ?
                                                        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
                                                            <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }} name='pencil' />
                                                            <Text style={{ fontSize: 15, marginLeft: 5, color: colors.primary }}>{t('editStatus')}</Text>
                                                        </View>
                                                        :
                                                        <View style={{ flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 7, backgroundColor: colors.error_dark }}>
                                                            <Ionicons style={{ fontSize: 18, fontWeight: "bold", color: colors.text_error }} name='alert-sharp' />
                                                            <Text style={{ fontSize: 14, marginLeft: 5, color: colors.text_error }}>{t('serverErrorTitle')}</Text>
                                                        </View>
                                }
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

                                <TouchableOpacity onPress={openModalConfig}>
                                    <SimpleLineIcons style={{ fontSize: 25, color: colors.primary_dark_alternative }} name='options-vertical' />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Zona de comentarios */}
                        <Text style={{ fontSize: 19, fontWeight: "bold", marginVertical: 20, color: colors.primary }}>{t('comments')}</Text>

                        <View style={{ backgroundColor: colors.primary_dark, padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: colors.shadow, shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5 }}>
                            <View style={styles.new_comment_header}>
                                <Image style={styles.comment_avatar} source={myAvatar != null ? { uri: myAvatar } : require('../../assets/avatar-default.png')} />
                                <View style={{ alignContent: 'center', backgroundColor: colors.background, minHeight: 50, maxHeight: 300, width: "85%", borderRadius: 10, padding: 5 }}>
                                    <TextInput
                                        style={{ fontSize: 15, color: colors.text }}
                                        placeholder={t('createComment')}
                                        placeholderTextColor={colors.holderText}
                                        multiline={true}
                                        onChangeText={(text) => setMyComment(text)}
                                        onFocus={selectShowMediaComment}
                                        maxLength={500} />

                                    {urlMedia != null ?
                                        !loadingMedia ?
                                            <View style={{ width: 200, height: 150, borderRadius: 10 }}>
                                                <Image style={{ width: 200, height: 150 }} source={{ uri: urlMedia }} />
                                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, padding: 3, borderRadius: 20, backgroundColor: "black" }} onPress={deleteImageComment}>
                                                    <MaterialCommunityIcons style={{ color: "white", fontSize: 24 }} name='close' />
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 150, backgroundColor: colors.primary_dark_alternative, borderRadius: 10 }}>
                                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, padding: 3, borderRadius: 20, backgroundColor: "black" }} onPress={deleteImageComment}>
                                                    <MaterialCommunityIcons style={{ color: "white", fontSize: 24 }} name='close' />
                                                </TouchableOpacity>
                                                <ActivityIndicator size={'large'} color={colors.secondary} />
                                            </View>
                                        :
                                        <View></View>}

                                    {showMediaComment ?
                                        urlMedia == null ?
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity>
                                                    <MaterialCommunityIcons style={{ fontSize: 24, color: colors.primary, marginVertical: 10, marginLeft: 10 }} onPress={pickPhotoComment} name='camera-plus-outline' />
                                                </TouchableOpacity>
                                                <TouchableOpacity>
                                                    <MaterialCommunityIcons style={{ fontSize: 24, color: colors.primary, marginVertical: 10, marginLeft: 10 }} onPress={submitImageComment} name='file-image-plus-outline' />
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <View></View>
                                        :
                                        <View></View>
                                    }
                                </View>
                            </View>

                            {loadingButton ?
                                <View style={{ flexDirection: "row", justifyContent: "center", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark }}>
                                    <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                                    <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sending')}</Text>
                                </View>
                                :
                                loadingMedia || myComment.length == 0 ?
                                    <View style={{ flexDirection: "row", justifyContent: "center", padding: 10, borderRadius: 10, backgroundColor: colors.quartet_dark }}>
                                        <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", color: colors.text }}>{t('sendComment')}</Text>
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
                :
                <View>
                    <TouchableOpacity onPress={goBackAgain}>
                        <View style={styles.back_block}>
                            <MaterialCommunityIcons style={{ fontSize: 49, color: colors.secondary }} name='chevron-left' />
                            <Text style={{ fontSize: 21, fontWeight: "bold", color: colors.secondary }}>{t('return')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 80, marginBottom: 10 }} name='exclamation' />
                        <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('noPublishFound')}</Text>
                    </View>
                </View>
            }

            {/* Opciones del post */}
            <Modal style={{
                padding: 20,
                maxHeight: 105,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.primary_dark,
                alignItems: 'flex-start'
            }} position='bottom' isOpen={modalOptions} coverScreen={true}>
                {publicationArray.userId === localUserLogin.id ?
                    <View>
                        {publicationArray.status != 0 ?
                            <TouchableOpacity style={styles.modalOption} onPress={editPublish}>
                                <Feather style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='edit-3' />
                                <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('edit')}</Text>
                            </TouchableOpacity>
                            :
                            <View></View>
                        }
                        <TouchableOpacity style={styles.modalOption} onPress={showRemoveAlert}>
                            <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text_error, marginRight: 10 }} name='delete-outline' />
                            <Text style={{ fontSize: 18, color: colors.text_error, fontWeight: 'bold' }}>{t('delete')}</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View>
                        <TouchableOpacity style={styles.modalOption}>
                            <FontAwesome5 style={{ fontSize: 22, color: colors.text, marginRight: 10 }} name='user-slash' />
                            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('blockUser')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={openModalReport}>
                            <Octicons style={{ fontSize: 28, color: colors.text_error, marginRight: 10 }} name='report' />
                            <Text style={{ fontSize: 18, color: colors.text_error, fontWeight: 'bold' }}>{t('report')}</Text>
                        </TouchableOpacity>
                    </View>
                }
            </Modal>

            {/* Reportar publicación */}
            <Modal style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                alignItems: 'flex-start',
                padding: 15,
                backgroundColor: colors.background
            }} position={"center"} isOpen={reportModal} coverScreen={true} swipeToClose={false}>
                <ScrollView style={{ width: "100%" }}>
                    <TouchableOpacity onPress={openModalReport}>
                        <MaterialCommunityIcons style={{ fontSize: 38, color: colors.text }} name="close" />
                    </TouchableOpacity>
                    <Report_publish publishId={props.route.params?.id} userId={publicationArray.userId} />
                </ScrollView>
            </Modal>
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
        alignItems: 'center'
    },
    statistics_block: {
        flexDirection: "row",
        alignItems: "center"
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
    },
    modalOption: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    }
})