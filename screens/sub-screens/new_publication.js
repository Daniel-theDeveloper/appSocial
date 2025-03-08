import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { database } from '../../utils/database';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { localUserLogin } from '../../utils/localstorage';
import { getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import Modal from 'react-native-modalbox';
import RadioGroup from 'react-native-radio-buttons-group';

import * as ImagePicker from 'expo-image-picker';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from 'react-native-vector-icons/Ionicons';
// import Modal from 'react-native-modalbox';
// import EmojiSelector from 'react-native-emoji-selector';
import { useTheme } from '@react-navigation/native';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import { fetchImage } from '../../utils/interations';

export default function New_publication(props) {
    const [newPublication, setNewPublication] = useState({
        body: '',
        urlImages: [],
        replyID: null,
        date: new Date(),
        likes: [],
        shares: [],
        status: 3,
        author: null,
        userId: localUserLogin.id
    })
    const [userImage, setUserImage] = useState([]);
    const [userImageName, setUserImageName] = useState([]);
    const [isUploadImage, setIsUploadImage] = useState(false);
    const [loading_Button, setLoading_Button] = useState(false);

    const [statusModal, setStatusModal] = useState(false);
    // const [emojiModal, setEmojiModal] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: t('private'),
            value: 1,
            color: colors.primary
        },
        {
            id: 2,
            label: t('privateFollowers'),
            value: 2,
            color: colors.primary
        },
        {
            id: 3,
            label: t('public'),
            value: 3,
            color: colors.primary
        }
    ]), []);

    const radioButtonsEditPublish = useMemo(() => ([
        {
            id: 1,
            label: t('private'),
            value: 1,
            color: colors.primary
        },
        {
            id: 2,
            label: t('privateFollowers'),
            value: 2,
            color: colors.primary
        },
        {
            id: 4,
            label: t('public'),
            value: 4,
            color: colors.primary
        }
    ]), []);

    useEffect(() => {
        try {
            const userRef = doc(database, 'users', localUserLogin.id);
            setNewPublication({...newPublication, author: userRef});
    
            if (props.route.params?.isEdit) {
                const oldPublish = props.route.params?.publishToEdit;
    
                if (oldPublish.urlImages != undefined) {
                    if (oldPublish.urlImages.length > 0) {
                        loadPhotos(oldPublish.urlImages);
                    }
                }
    
                setNewPublication({
                    body: oldPublish.body,
                    urlImages: oldPublish.urlImages,
                    replyID: oldPublish.replyID,
                    date: oldPublish.date,
                    likes: [],
                    shares: [],
                    status: oldPublish.status == 3 ? 4 : oldPublish.status,
                    author: oldPublish.author,
                    userId: localUserLogin.id
                });
            } else {
                if (props.route.params?.photo != undefined || props.route.params?.photo != null) {
                    let loadedImages = [];
                    let loadedImagesName = [];
                    const image = props.route.params?.photo;
    
                    for (let x = 0; x < image.assets.length; x++) {
                        loadedImages.push(image.assets[x].uri);
                        loadedImagesName.push(image.assets[x].fileName);
                    }
    
                    setUserImage(loadedImages);
                    setUserImageName(loadedImagesName);
                    setIsUploadImage(true);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            props.navigation.goBack();
        }
    }, []);

    const UploadImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        let loadedImages = [];
        let loadedImagesName = [];

        if (granted) {
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                selectionLimit: 10
            });
            if (image.canceled) {
                // Nothing
            } else {
                for (let x = 0; x < image.assets.length; x++) {
                    loadedImages.push(image.assets[x].uri);
                    loadedImagesName.push(image.assets[x].fileName);
                }

                setUserImage(loadedImages);
                setUserImageName(loadedImagesName);

                setIsUploadImage(true);
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    const loadPhotos = async (urlImages) => {
        try {
            let loadedImages = [];
            let loadedImagesName = [];

            for (let x = 0; x < urlImages.length; x++) {
                loadedImages.push(await fetchImage(urlImages[x]));
                const urlCrude = urlImages[x].split("/");
                loadedImagesName.push(urlCrude[3]);
            }

            setUserImage(loadedImages);
            setUserImageName(loadedImagesName);
            setIsUploadImage(true);
        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            props.navigation.goBack();
        }
    }

    const pickPhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        let loadedImages = userImage;
        let loadedImagesName = userImageName;

        if (granted) {
            const image = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 0.8,
                selectionLimit: 10
            });
            if (image.canceled) {
                // Nothing
            } else {
                for (let x = 0; x < image.assets.length; x++) {
                    loadedImages.push(image.assets[x].uri);
                    loadedImagesName.push(image.assets[x].fileName);
                }

                setUserImage(loadedImages);
                setUserImageName(loadedImagesName);
                setIsUploadImage(true);
            }

        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('photoDenied'));
        }
    }

    function removeImage() {
        setUserImage([]);
        setUserImageName([]);
        setIsUploadImage(false);
    }

    const showAlert = () =>
        Alert.alert(
            t('exitNewPublishTitle'),
            t('exitNewPublish'),
            [
                {
                    text: t('continueCreating'),
                },
                {
                    text: t('exitButton'),
                    onPress: () => goBackAgain(),
                    style: 'cancel',
                },
            ],
        );

    const alertRemoveImage = () =>
        Alert.alert(
            t('deleteImageTitle'),
            t('deleteImage'),
            [
                {
                    text: t('no'),
                },
                {
                    text: t('yes'),
                    onPress: () => removeImage(),
                    style: 'cancel',
                },
            ],
        );

    function goBackAgain() {
        props.navigation.goBack();
    }

    const sharePublish = async () => {
        setLoading_Button(true);
        try {
            if (newPublication.body != '' && newPublication.author != null) {
                if (!props.route.params?.isEdit) {
                    // Proceso de publicación
                    const res = await addDoc(collection(database, 'publications'), newPublication);
                    const id_new = res._key.path.segments[1];

                    // Proceso de publicación de las imágenes
                    if (userImage.length != 0) {
                        let urlList = [];
                        for (let i = 0; i < userImage.length; i++) {
                            const url = localUserLogin.username + "/publicationImages/" + id_new + "/" + userImageName[i];

                            const response = await fetch(userImage[i]);
                            const blob = await response.blob();
                            const storage = getStorage();
                            const storageRef = ref(storage, url);

                            const snapshot = await uploadBytes(storageRef, blob);
                            urlList.push(snapshot.ref.fullPath);
                        }
                        const docRef = doc(database, 'publications', id_new);
                        await updateDoc(docRef, {
                            urlImages: urlList
                        });
                        // newPublication.urlImages = snapshot.ref.fullPath;
                    }
                } else {
                    // Proceso de edición
                    const oldPublish = props.route.params?.publishToEdit;
                    let urlList = [];

                    // Verificando si la publicación tenia imágenes o no
                    if (props.route.params?.publishToEdit.urlImages != null || props.route.params?.publishToEdit.urlImages != undefined) {

                        // Verificando si se cambiaron las imágenes
                        if (oldPublish.urlImages != userImageName) {
                            // Eliminando las antiguas imágenes
                            if (oldPublish.urlImages.length > 0) {
                                for (let i = 0; i < oldPublish.urlImages.length; i++) {
                                    const storage = getStorage();
                                    const storageRef = ref(storage, oldPublish.urlImages[i]);
                                    await deleteObject(storageRef);
                                }
                            }

                            // Subiendo las nuevas imágenes
                            if (userImage.length != 0) {
                                for (let i = 0; i < userImage.length; i++) {
                                    const url = localUserLogin.username + "/publicationImages/" + oldPublish.id + "/" + userImageName[i];

                                    const response = await fetch(userImage[i]);
                                    const blob = await response.blob();
                                    const storage = getStorage();
                                    const storageRef = ref(storage, url);

                                    const snapshot = await uploadBytes(storageRef, blob);
                                    urlList.push(snapshot.ref.fullPath);
                                }
                            }
                        }
                    }

                    const docRef = doc(database, 'publications', oldPublish.id);
                    await updateDoc(docRef, {
                        body: newPublication.body,
                        urlImages: urlList,
                        status: newPublication.status,
                        wasEdit: true
                    });
                }

                setLoading_Button(false);
                goBackAgain();
            } else {
                setLoading_Button(false);
                Alert.alert(t('emptyPublishTitle'), t('emptyPublish'));
            }
        } catch (error) {
            setLoading_Button(false);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            console.error(error);
        }
    }

    function openStatusModal() {
        if (statusModal) {
            setStatusModal(false);
        } else {
            setStatusModal(true);
        }
    }

    function setSelectStatus(e) {
        setNewPublication({ ...newPublication, status: e });
    }

    // No actualiza el array useImages:
    // function deleteSelectedImage(x) {
    //     setIsUploadImage(false);
    //     let newImages = userImage;
    //     let newImagesName = userImageName;

    //     setUserImage([]);
    //     setUserImageName([]);

    //     newImages.splice(x, 1);
    //     newImagesName.splice(x, 1);

    //     setUserImage(newImages);
    //     setUserImageName(newImagesName);

    //     if (userImage.length > 0) {
    //         setIsUploadImage(true);
    //     }
    // }

    // function openEmojiModal() {
    //     if (emojiModal) {
    //         setEmojiModal(false);
    //     } else {
    //         setEmojiModal(true);
    //     }
    // }

    return (
        <ScrollView style={{ flex: 1, flexGrow: 1, paddingBottom: 50, paddingHorizontal: 20, backgroundColor: colors.background }} showsVerticalScrollIndicator={true}>
            <TouchableOpacity style={styles.back_button_block} onPress={showAlert}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 25, fontWeight: "bold", color: colors.text }}>{t('exitButton')}</Text>
            </TouchableOpacity>
            <View style={{ padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15 }}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 8, color: colors.text }}>{props.route.params?.isEdit ? t('editPublish') : t('newPublish')}</Text>
                </View>

                <View style={styles.publish_buttons}>
                    <View style={styles.publish_add_buttons}>
                        <TouchableOpacity onPress={pickPhoto}>
                            <MaterialCommunityIcons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='camera-plus-outline' />
                        </TouchableOpacity>

                        {isUploadImage ?
                            <TouchableOpacity onPress={alertRemoveImage}>
                                <MaterialCommunityIcons style={{ marginRight: 15, color: colors.tertiary, fontSize: 26, fontWeight: "bold" }} name='file-image-remove' />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={UploadImage}>
                                <MaterialCommunityIcons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='file-image-plus-outline' />
                            </TouchableOpacity>
                        }

                        {/* <TouchableOpacity onPress={openEmojiModal}>
                            <MaterialCommunityIcons style={{marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold"}} name='emoticon-happy' />
                        </TouchableOpacity> */}

                        <TouchableOpacity onPress={openStatusModal}>
                            <Ionicons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name={newPublication.status == 1 ? 'eye-off' : newPublication.status == 2 ? 'people' : newPublication.status == 3 || newPublication.status == 4 ? 'earth' : 'alert-sharp'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.publich_block}>
                        <Text style={{ fontSize: 16, marginRight: 10, color: colors.primary }}>{newPublication.body.length} / 500</Text>
                        {loading_Button ?
                            <View style={{ flexDirection: "row", backgroundColor: colors.quartet_dark, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 }}>
                                <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>{t('publishing')}</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={sharePublish}>
                                <View style={{ backgroundColor: colors.quartet, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10 }}>
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>{t('publish')}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>

                </View>

                <View style={{ width: "100%", height: 2, backgroundColor: colors.secondary, marginBottom: 10 }}></View>

                <View style={{
                    padding: 10,
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                    borderRadius: 10,
                    outlineStyle: "solid",
                    outlineWidth: 2,
                }}>
                    <TextInput
                        placeholder={t('write')}
                        placeholderTextColor={colors.holderText}
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        value={newPublication.body}
                        style={{
                            fontSize: 18,
                            color: colors.text,
                            minHeight: 100,
                            textAlignVertical: "top"
                        }}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />

                    {isUploadImage ?
                        <View>
                            <View style={styles.multimedia_block}>
                                <MaterialCommunityIcons style={{ fontSize: 18, color: colors.tertiary, marginTop: 10, marginRight: 10 }} name='file-image' />
                                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.tertiary, marginTop: 10 }}>{userImage.length + '/10 ' + t('imageLoaded')}</Text>
                            </View>
                            {userImage.map((key, x) => (
                                <View key={key}>
                                    <Image style={styles.publication_image} source={{ uri: userImage[x] }} />
                                    {/* <TouchableOpacity onPress={() => deleteSelectedImage(x)} style={{ position: 'absolute', right: 0, margin: 10, padding: 5, borderRadius: 20, opacity: 0.8, backgroundColor: "black" }}>
                                        <MaterialCommunityIcons style={{ fontSize: 25, color: "white" }} name='close-thick'></MaterialCommunityIcons>
                                    </TouchableOpacity> */}
                                </View>
                            ))}
                        </View>
                        :
                        <View style={styles.multimedia_block}>
                            <MaterialCommunityIcons style={{ fontSize: 18, color: colors.primary, marginTop: 10, marginRight: 10 }} name='file-image-remove-outline' />
                            <Text style={{ fontSize: 18, color: colors.primary, marginTop: 10 }}>{t('noImageLoaded')}</Text>
                        </View>
                    }
                </View>
            </View>
            {/* <Modal style={{ alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark }} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{ height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary }}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setNewPublication({ ...newPublication, body: newPublication.body + emoji })} />
            </Modal> */}

            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 175,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={statusModal} onClosed={openStatusModal} coverScreen={true}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{t('visibility')}</Text>
                </View>
                {props.route.params?.isEdit ?
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtonsEditPublish}
                        onPress={setSelectStatus}
                        selectedId={newPublication.status}
                        labelStyle={{ color: colors.text, fontSize: 16 }}
                    />
                    :
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtons}
                        onPress={setSelectStatus}
                        selectedId={newPublication.status}
                        labelStyle={{ color: colors.text, fontSize: 16 }}
                    />
                }
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center"
    },
    back_button_block: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15
    },
    publish_buttons: {
        flexDirection: "row",
        marginVertical: 8,
        justifyContent: "space-between",
        alignItems: "center"
    },
    publish_add_buttons: {
        flexDirection: "row",
        alignItems: "center"
    },
    loadingSpinner: {
        marginRight: 10
    },
    multimedia_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    publication_image: {
        minHeight: 200,
        maxHeight: 400,
        width: "100%",
        marginBottom: 15,
        borderRadius: 10
    },
    publich_block: {
        flexDirection: "row",
        alignItems: 'center'
    }
})