import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ImageBackground, ScrollView } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Octicons from "react-native-vector-icons/Octicons";
import { localUserLogin } from '../../utils/localstorage';
import { convertDate } from '../../utils/convertDate';
import { fetchImage, savePublish, deleteSavePublish, likePublish, deleteLike, isWasCommented, deletePublishAction, youAreFollower } from '../../utils/interations';
import ReplyPublish from './replyPublish';
import Report_publish from './Report_publish';

import { getDoc, collection, onSnapshot } from 'firebase/firestore';
import { database } from '../../utils/database';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modalbox';

export let publicationData = {
    id: ""
}
export let publication_selected = []

export default function Publication({
    props,
    isLike,
    // isComment,
    isShared,
    wasSaved,
    id,
    body,
    urlImages,
    // comments_container,
    date,
    likes,
    replyID,
    status,     // 0: oculto por moderación, 1: privado, 2: solo seguidores, 3: publico, 4: publico editado.
    shares,
    userId,
    author
}) {
    const allLikes = likes.length;
    // const allComments = comments_container.length;

    const [unavailable, setUnavailable] = useState(false);

    const [isSaved, setIsSaved] = useState(false);
    const [imageURL, setImageURL] = useState([]);

    const [isComment, setIsComment] = useState(false);

    const [avatarURL, setAvatarURL] = useState(null);
    const [username, setUsername] = useState('');
    const [nickname, setNickname] = useState(null);
    const [commentsArray, setCommentsArray] = useState([]);

    const [modalOptions, setModalOptions] = useState(false);
    const [reportModal, setReportModal] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        if (author != undefined && author != null) {    // Publicación con el autor cargado correctamente.
            if (userId === localUserLogin.id) {     // Autor original
                loadComments();
                loadUserData();
                loadFoto();
                promiseSaved();
            } else if (status < 2) {   // Reportado o privado
                setUnavailable(true);
            } else if (status == 2) {   // Solo seguidores
                youAreFollower(author).then((res) => {  // Verificando si eres seguidor
                    if (res) {
                        loadComments();
                        loadUserData();
                        loadFoto();
                        promiseSaved();
                    } else {
                        console.log("Solo seguidores");
                        setUnavailable(true);
                    }
                });
            } else if (status > 2 && status < 5) {  // Publico
                loadComments();
                loadUserData();
                loadFoto();
                promiseSaved();
            } else {
                setUnavailable(true);
            }
        } else {
            console.log("Autor desconocido")
            setUnavailable(true);
        }
    }, []);

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

    const promiseSaved = async () => {
        setIsSaved(await wasSaved);
    }

    const loadFoto = async () => {
        let loadURLImages = [];
        if (urlImages != null) {
            for (let x = 0; x < urlImages.length; x++) {
                loadURLImages.push(await fetchImage(urlImages[x]))
            }
            setImageURL(loadURLImages);
        }
    }

    const loadUserData = async () => {
        try {
            const docSnap = await getDoc(author);

            if (docSnap.exists()) {
                setAvatarURL(await fetchImage(docSnap.data().avatar));
                setNickname(await docSnap.data().name);
                setUsername(await docSnap.data().username);
            } else {
                console.error("Sin conexión");
            }
        } catch (error) {
            console.error(error);
        }
    }

    function loadComments() {
        try {
            const url = 'publications/' + id + '/comments';
            const collectionRef = collection(database, url);

            const unsuscribe = onSnapshot(collectionRef, QuerySnapshot => {
                setCommentsArray(
                    QuerySnapshot.docs.map(doc => ({
                        user: doc.data().user
                    }))
                );
                setIsComment(isWasCommented(QuerySnapshot.docs));
            });
            return unsuscribe;
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
            isLike = false;
            const res = await deleteLike(id);
            if (!res) {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
                isLike = true;
            }
        } else {
            isLike = true;
            const res = await likePublish(id);
            if (!res) {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
                isLike = false;
            }
        }
    }

    function setComment() {
        const publish = {
            id: id,
            body: body,
            avatar: avatarURL,
            // comments_container: comments_container,
            date: date,
            likes: likes.length,
            user: nickname,
            author: author
        }
        props.navigation.navigate({ name: 'FastComment', params: { publish: publish }, merge: true });
    }

    const setShared = async () => {
        props.navigation.navigate({ name: 'ReplyPublishScreen', params: { id: id, userIdSend: userId }, merge: true });
    }

    const setSaved = async () => {
        if (isSaved) {
            setIsSaved(false);
            const res = await deleteSavePublish(id);
            if (res) {
                Alert.alert(t('deletePublish'));
            } else {
                setIsSaved(true);
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
        } else {
            setIsSaved(true);
            const res = await savePublish(id);
            if (res) {
                Alert.alert(t('savePublish'));
            } else {
                setIsSaved(false);
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
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

    function editPublish() {
        if (localUserLogin.id != undefined && localUserLogin.id != null) {
            if (userId === localUserLogin.id) {
                const myPublish = {
                    id: id,
                    body: body,
                    urlImages: urlImages,
                    date: date,
                    replyID: replyID,
                    status: status,
                    author: author
                }

                setModalOptions[false];
                props.navigation.navigate({ name: 'NewPublication', params: { isEdit: true, publishToEdit: myPublish }, merge: true });
            } else {
                console.log("No eres el usuario creador de la publicación");
            }
        } else {
            Alert.alert(t('internetErrorTitle'), t('internetError'));
        }
    }

    const deletePublish = async () => {
        const res = await deletePublishAction(id);

        if (res) {
            Alert.alert("Eliminado correctamente");
        } else {
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    return (
        <View>
            {!unavailable ?
                <View style={styles.container}>
                    <TouchableOpacity onPress={goPerfil}>
                        <View style={styles.perfil_header}>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                {avatarURL != null ?
                                    <Image style={styles.avatar} source={{ uri: avatarURL }} />
                                    :
                                    <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                                }
                                {username === localUserLogin.username ?
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={styles.perfil_usernames_container}>
                                            <View style={styles.perfil_usernames_block}>
                                                <Text style={{ marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary }}>{nickname}</Text>
                                                <Text style={{ marginRight: 5, fontWeight: "bold", fontSize: 16, color: colors.tertiary }}>-</Text>
                                                <Text style={{ fontSize: 16, color: colors.tertiary_dark }}>@{username}</Text>
                                            </View>
                                            <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.tertiary_dark_alternative }}>{convertDate(date.seconds)}</Text>
                                        </View>
                                    </View>
                                    :
                                    <View style={styles.perfil_usernames_container}>
                                        <View style={styles.perfil_usernames_block}>
                                            <Text style={{ marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary }}>{nickname}</Text>
                                            <Text style={{ marginRight: 5, fontSize: 16, fontWeight: "bold", color: colors.secondary }}>-</Text>
                                            <Text style={{ fontSize: 16, color: colors.primary }}>@{username}</Text>
                                        </View>
                                        <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.secondary_dark }}>{convertDate(date.seconds)}</Text>
                                    </View>
                                }
                            </View>
                            {status < 2 ?
                                <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error_dark, padding: 5, borderRadius: 10 }}>
                                    <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text_error }} name='eye-off-outline' />
                                </View>
                                :
                                status == 2 ?
                                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: colors.quartet_dark_alternative, padding: 5, borderRadius: 10 }}>
                                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.quartet }} name='account-multiple-check-outline' />
                                    </View>
                                    :
                                    <View></View>
                            }
                        </View>
                    </TouchableOpacity>

                    <View style={{ padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15, shadowColor: colors.shadow, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.55, shadowRadius: 4, elevation: 5 }}>
                        <TouchableOpacity onPress={goDetails}>
                            <Text style={{ fontSize: 15, marginBottom: 15, color: colors.text }}>{body}</Text>
                            {replyID != null || replyID != undefined ?
                                <ReplyPublish props={props} replyID={replyID} />
                                :
                                urlImages != null ?
                                    urlImages.length === 1 ?
                                        <Image style={{ height: 200, width: "100%", marginBottom: 15, borderRadius: 15 }} source={{ uri: imageURL[0] }} />
                                        :
                                        urlImages.length === 2 ?
                                            <View style={styles.images_container}>
                                                <Image style={{ marginRight: 3, height: 200, width: "49%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                                <Image style={{ marginLeft: 3, height: 200, width: "49%", borderTopRightRadius: 15, borderBottomRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                            </View>
                                            :
                                            urlImages.length === 3 ?
                                                <View style={styles.images_container}>
                                                    <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                                    <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                        <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                                        <Image style={{ marginTop: 3, height: "48.5%", borderBottomRightRadius: 15 }} source={{ uri: imageURL[2] }} />
                                                    </View>
                                                </View>
                                                :
                                                urlImages.length > 3 ?
                                                    <View style={styles.images_container}>
                                                        <Image style={{ marginRight: 3, width: "63%", borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }} source={{ uri: imageURL[0] }} />
                                                        <View style={{ marginLeft: 3, display: "flex", flexDirection: "column", width: "35%" }}>
                                                            <Image style={{ marginBottom: 3, height: "48.5%", borderTopRightRadius: 15 }} source={{ uri: imageURL[1] }} />
                                                            <ImageBackground source={{ uri: imageURL[2] }} imageStyle={{ opacity: 0.5, resizeMode: "cover", height: "100%", borderBottomRightRadius: 15 }} style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 3, height: "48.5%", borderBottomRightRadius: 15, backgroundColor: "#1f1f1f" }}>
                                                                <Text style={{ color: "white", fontSize: 36, }}>+{urlImages.length - 3}</Text>
                                                            </ImageBackground>
                                                        </View>
                                                    </View>
                                                    :
                                                    <View></View>
                                    :
                                    <View></View>
                            }
                        </TouchableOpacity>

                        <View style={styles.interact_container}>

                            {/* Area de likes */}
                            <TouchableOpacity onPress={setLike}>
                                {isLike ?
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.like }} name='heart' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.like }}>{allLikes}</Text>
                                    </View>
                                    :
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.primary_dark_alternative }} name='heart-outline' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative }}>{allLikes}</Text>
                                    </View>
                                }
                            </TouchableOpacity>

                            {/* Area de comentarios */}
                            <TouchableOpacity onPress={setComment}>
                                {isComment ?
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.comment }} name='message' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.comment }}>{commentsArray.length}</Text>
                                    </View>
                                    :
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.primary_dark_alternative }} name='message-outline' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative }}>{commentsArray.length}</Text>
                                    </View>
                                }
                            </TouchableOpacity>

                            {/* Area de compartir */}
                            <TouchableOpacity onPress={setShared}>
                                {isShared ?
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.share }} name='repeat-variant' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.share }}>{shares.length}</Text>
                                    </View>
                                    :
                                    <View style={styles.interact_block}>
                                        <MaterialCommunityIcons style={{ fontSize: 22, color: colors.primary_dark_alternative }} name='repeat-variant' />
                                        <Text style={{ fontSize: 13, marginLeft: 5, fontWeight: "bold", color: colors.primary_dark_alternative }}>{shares.length}</Text>
                                    </View>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity onPress={setSaved}>
                                {isSaved ?
                                    <MaterialCommunityIcons style={{ fontSize: 22, color: colors.save }} name='book' />
                                    :
                                    <MaterialCommunityIcons style={{ fontSize: 22, color: colors.primary_dark_alternative }} name='book-outline' />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={openModalConfig}>
                                <SimpleLineIcons style={{ fontSize: 22, color: colors.primary_dark_alternative }} name='options-vertical' />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Opciones del post */}
                    <Modal style={{
                        padding: 20,
                        maxHeight: 105,
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20,
                        backgroundColor: colors.primary_dark,
                        alignItems: 'flex-start'
                    }} position='bottom' isOpen={modalOptions} coverScreen={true}>
                        {userId === localUserLogin.id ?
                            <View>
                                {status != 0 ?
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
                            <Report_publish publishId={id} userId={userId} />
                        </ScrollView>
                    </Modal>
                </View>
                :
                <View></View>
            }
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
        marginBottom: 10,
        justifyContent: 'space-between'
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    perfil_usernames_block: {
        flexDirection: "row",
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
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
});