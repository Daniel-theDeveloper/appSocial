import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { database } from '../../utils/database';
import { collection, addDoc } from 'firebase/firestore';
import { localUserLogin } from '../../utils/localstorage';
import { getStorage, ref, uploadBytes } from "firebase/storage"

import * as ImagePicker from 'expo-image-picker';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from 'react-native-modalbox';
import EmojiSelector from 'react-native-emoji-selector';
import { useTheme } from '@react-navigation/native';

export let new_publication_params = {
    isFhoto: false,
    photoURI: null,
    photoName: null,
    photoType: 'pnj'
}

export default function New_publication(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        urlImage: null,
        comments_container: [],
        replyID: null,
        date: new Date(),
        likes: [],
        shares: [],
        userId: localUserLogin.id
    })
    const [userImage, setUserImage] = useState(null);
    const [userImageName, setUserImageName] = useState("publish");
    const [userImageType, setUserImageType] = useState("pnj");
    const [isUploadImage, setIsUploadImage] = useState(false);
    const [loading_Button, setLoading_Button] = useState(false);
    const [emojiModal, setEmojiModal] = useState(false);

    const { colors } = useTheme();

    useEffect(() => {
        if (new_publication_params.isFhoto) {
            setUserImage(new_publication_params.photoURI);
            setUserImageName(new_publication_params.photoName);
            setUserImageType(new_publication_params.photoType);

            setIsUploadImage(true);
        }
    }, []);

    const UploadImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                quality: 1,
                aspect: [4, 3],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
            if (image.canceled) {
                // Nothing
            } else {
                setUserImage(image.assets[0].uri);
                setUserImageName(image.assets[0].width);
                setUserImageType(getFormatImage(image.assets[0].mimeType))

                setIsUploadImage(true);
            }
        } else {
            Alert.alert("Permisos denegados", "Por favor, active el permiso de la galeria");
        }
    }

    const pickPhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 1
            });
            if (image.canceled) {
                // Nothing
            } else {
                setUserImage(image.assets[0].uri);
                setUserImageName(image.assets[0].width);
                setUserImageType(getFormatImage(image.assets[0].mimeType))

                setIsUploadImage(true);
            }

        } else {
            Alert.alert("Permisos denegados", "Sin permisos de la camara, no puedes tomar fotos en la aplicación");
        }
    }

    function getFormatImage(mimeType) {
        const array = mimeType.split('/');
        return array[1];
    }

    function removeImage() {
        setUserImage(null);
        setIsUploadImage(false);
    }

    const showAlert = () =>
        Alert.alert(
            'Salir de la publicación',
            '¿Desea salirse de la publicación sin guardar ni publicar nada?',
            [
                {
                    text: 'Continuar creando',
                },
                {
                    text: 'Salirse',
                    onPress: () => goBackAgain(),
                    style: 'cancel',
                },
            ],
        );

    const alertRemoveImage = () =>
        Alert.alert(
            '¿Eliminar imagen?',
            '¿Desea eliminar su imagen?',
            [
                {
                    text: 'No',
                },
                {
                    text: 'Si',
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
            if (userImage != null) {
                const url = localUserLogin.username + "/publicationImages/" + userImageName + "." + userImageType;

                const response = await fetch(userImage);
                const blob = await response.blob();
                const storage = getStorage();
                const storageRef = ref(storage, url);

                const snapshot = await uploadBytes(storageRef, blob);

                newPublication.urlImage = snapshot.ref.fullPath;
            }
            if (newPublication.body != '') {
                await addDoc(collection(database, 'publications'), newPublication);
                setLoading_Button(false);
                goBackAgain();
            } else {
                setLoading_Button(false);
                Alert.alert("publicación vacia", "Por favor escribe algo");
            }
        } catch (error) {
            setLoading_Button(false);
            Alert.alert("Error del servidor", "Por favor, vuelve a intentarlo");
            console.error(error);
        }
    }

    function openEmojiModal() {
        if (emojiModal) {
            setEmojiModal(false);
        } else {
            setEmojiModal(true);
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, paddingBottom: 50, paddingHorizontal: 20, backgroundColor: colors.background }} showsVerticalScrollIndicator={true}>
            <TouchableOpacity style={styles.back_button_block} onPress={showAlert}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 25, fontWeight: "bold", color: colors.text }}>Salirse</Text>
            </TouchableOpacity>
            <View style={{ padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15 }}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 8, color: colors.text }}>Nueva publicación</Text>
                </View>

                <View style={styles.publish_buttons}>
                    <View style={styles.publish_add_buttons}>
                        <TouchableOpacity onPress={pickPhoto}>
                            <MaterialCommunityIcons style={{marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold"}} name='camera-plus-outline' />
                        </TouchableOpacity>

                        {isUploadImage ?
                            <TouchableOpacity onPress={alertRemoveImage}>
                                <MaterialCommunityIcons style={{marginRight: 15, color: colors.tertiary, fontSize: 26, fontWeight: "bold"}} name='file-image-remove' />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={UploadImage}>
                                <MaterialCommunityIcons style={{marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold"}} name='file-image-plus-outline' />
                            </TouchableOpacity>
                        }

                        <TouchableOpacity onPress={openEmojiModal}>
                            <MaterialCommunityIcons style={{marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold"}} name='emoticon-happy' />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.publich_block}>
                        <Text style={{fontSize: 16, marginRight: 10, color: colors.primary}}>{newPublication.body.length} / 500</Text>
                        {loading_Button ?
                            <View style={{flexDirection: "row", backgroundColor: colors.quartet_dark, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10}}>
                                <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                                <Text style={{color: colors.text, fontSize: 18, fontWeight: "bold"}}>Publicando</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={sharePublish}>
                                <View style={{backgroundColor: colors.quartet, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10}}>
                                    <Text style={{color: colors.text, fontSize: 18, fontWeight: "bold"}}>Publicar</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    </View>

                </View>

                <View style={{width: "100%", height: 2, backgroundColor: colors.secondary, marginBottom: 10}}></View>

                <View style={{
                    padding: 10,
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                    borderRadius: 10,
                    outlineStyle: "solid",
                    outlineWidth: 2,
                }}>
                    <TextInput
                        placeholder='Escribe lo que piensas'
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
                                <MaterialCommunityIcons style={{fontSize: 18, color: colors.tertiary, marginTop: 10, marginRight: 10}} name='file-image' />
                                <Text style={{fontSize: 18, fontWeight: "bold", color: colors.tertiary, marginTop: 10}}>Imagen cargada</Text>
                            </View>
                            <Image style={styles.publication_image} source={{ uri: userImage }} />
                        </View>
                        :
                        <View style={styles.multimedia_block}>
                            <MaterialCommunityIcons style={{fontSize: 18, color: colors.primary, marginTop: 10, marginRight: 10}} name='file-image-remove-outline' />
                            <Text style={{fontSize: 18, color: colors.primary, marginTop: 10}}>Ninguna imagen seleccionada</Text>
                        </View>

                    }
                </View>
            </View>
            <Modal style={{ alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark }} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{ height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary }}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setNewPublication({ ...newPublication, body: newPublication.body + emoji })} />
            </Modal>
        </View>
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
        borderRadius: 20
    },
    publich_block: {
        flexDirection: "row",
        alignItems: 'center'
    }
})