import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { database } from '../../utils/database';
import { collection, addDoc } from 'firebase/firestore';
import { globalUsername } from '../../utils/localstorage';
import { getStorage, ref, uploadBytes } from "firebase/storage"

import * as ImagePicker from 'expo-image-picker';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function New_publication(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        urlImage: null,
        comments_container: [],
        date: new Date(),
        likes: [],
        shares: 0,
        user: globalUsername
    })
    const [userImage, setUserImage] = useState(null);
    const [userImageName, setUserImageName] = useState("publish");
    const [userImageType, setUserImageType] = useState("pnj");
    const [isUploadImage, setIsUploadImage] = useState((false));
    const [loading_Button, setLoading_Button] = useState((false));

    const UploadImage = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                quality: 1,
                aspect: [4,3],
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
            'Salir de la publicacion',
            '¿Desea salirse de la publicacion sin guardar ni publicar nada?',
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

    const goBackAgain = async () => {
        props.navigation.goBack()
    }

    const sharePublish = async () => {
        setLoading_Button(true);
        try {
            if (userImage != null) {
                const url = globalUsername+"/publicationImages/"+userImageName+"."+userImageType;
                console.log(url);

                const response = await fetch(userImage);
                const blob = await response.blob();
                const storage = getStorage();
                const storageRef = ref(storage, url);

                const snapshot = await uploadBytes(storageRef, blob);

                newPublication.urlImage = snapshot.ref.fullPath;
                console.log(newPublication.urlImage);
            }
            if (newPublication.body != '') {
                await addDoc(collection(database, 'publications'), newPublication);
                setLoading_Button(false);
                goBackAgain();
            } else {
                setLoading_Button(false);
                Alert.alert("Publicacion vacia", "Por favor escribe algo");
            }
        } catch (error) {
            setLoading_Button(false);
            Alert.alert("Error del servidor", "Por favor, vuelve a intentarlo");
            console.error(error);
        }
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={showAlert}>
                        <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nueva publicacion</Text>
                </View>

                <View style={styles.publish_buttons}>
                    <TouchableOpacity>
                        <MaterialCommunityIcons style={styles.insert_label} name='camera-plus-outline' />
                    </TouchableOpacity>

                    {isUploadImage ?
                        <TouchableOpacity onPress={alertRemoveImage}>
                            <MaterialCommunityIcons style={styles.remove_label} name='file-image-remove' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={UploadImage}>
                            <MaterialCommunityIcons style={styles.insert_label} name='file-image-plus-outline' />
                        </TouchableOpacity>
                    }

                    <TouchableOpacity>
                        <MaterialCommunityIcons style={styles.insert_label} name='map-marker-plus-outline' />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <MaterialCommunityIcons style={styles.insert_label} name='file-gif-box' />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <MaterialCommunityIcons style={styles.insert_label} name='emoticon-happy' />
                    </TouchableOpacity>

                    {loading_Button ?
                        <View style={styles.publish_loading_button}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.publish_label}>Publicando</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sharePublish}>
                            <View style={styles.publish_button}>
                                <Text style={styles.publish_label}>Publicar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                <View style={styles.line}></View>

                <View style={styles.new_publication}>
                    <TextInput
                        placeholder='Escribe lo que piensas'
                        placeholderTextColor="#c50056"
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        style={styles.input}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />
                    <Text style={styles.statistics_label}>{newPublication.body.length} / 500</Text>

                    {isUploadImage ?
                        <View>
                            <View style={styles.multimedia_block}>
                                <MaterialCommunityIcons style={styles.icon_media_status_ok} name='file-image' />
                                <Text style={styles.text_media_status_ok}>Imagen cargada</Text>
                            </View>
                            <Image style={styles.publication_image} source={{ uri: userImage }} />
                        </View>
                        :
                        <View style={styles.multimedia_block}>
                            <MaterialCommunityIcons style={styles.icon_media_status} name='file-image-remove-outline' />
                            <Text style={styles.text_media_status}>Ninguna imagen seleccionada</Text>
                        </View>

                    }
                </View>
                {
                    // isUploadImage ?
                    //     <View style={styles.multimedia_block}>
                    //         <MaterialCommunityIcons style={styles.icon_media_status} name='map-marker-off' />
                    //         {/* <MaterialCommunityIcons style={styles.icon_media_status} name='map-marker-check' /> */}
                    //         <Text style={styles.text_media_status}>Ninguna ubicacion seleccionada</Text>
                    //     </View>
                    //     :
                    //     <View>
                    //         <View style={styles.multimedia_block}>
                    //             <MaterialCommunityIcons style={styles.icon_media_status} name='map-marker-check' />
                    //             <Text style={styles.text_media_status}>Se selecciono una imagen</Text>
                    //         </View>
                    //         <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} />
                    //     </View>
                }

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        paddingVertical: 50,
        paddingHorizontal: 20,
        backgroundColor: "#210016"
    },
    content: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
    },
    header: {
        flexDirection: "row",
        alignItems: "center"
    },
    back_button: {
        fontSize: 45,
        color: "white"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 13,
        color: "white"
    },
    new_publication: {
        padding: 10,
        borderColor: "#ff0070",
        borderWidth: 1.5,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    input: {
        fontSize: 18,
        color: 'white',
        minHeight: 100,
        textAlignVertical: "top",
    },
    publish_buttons: {
        flexDirection: "row",
        marginVertical: 8,
        justifyContent: "space-between",
        alignItems: "center"
    },
    insert_label: {
        color: "#4CC9F0",
        fontSize: 26,
        fontWeight: "bold"
    },
    remove_label: {
        color: "#abf752",
        fontSize: 26,
        fontWeight: "bold"
    },
    publish_button: {
        backgroundColor: "#4CC9F0",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10
    },
    publish_loading_button: {
        flexDirection: "row",
        backgroundColor: "#235d6f",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10
    },
    loadingSpinner: {
        marginRight: 10
    },
    publish_label: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    },
    line: {
        width: "100%",
        height: 2,
        backgroundColor: "#4cc9f0",
        marginBottom: 10
    },
    multimedia_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    text_media_status: {
        fontSize: 18,
        color: "#ff0070",
        marginTop: 10
    },
    text_media_status_ok: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#abf752",
        marginTop: 10
    },
    icon_media_status: {
        fontSize: 18,
        color: "#ff0070",
        marginTop: 10,
        marginRight: 10
    },
    icon_media_status_ok: {
        fontSize: 18,
        color: "#abf752",
        marginTop: 10,
        marginRight: 10
    },
    publication_image: {
        minHeight: 200,
        maxHeight: 400,
        width: "100%",
        marginBottom: 15,
        borderRadius: 20
    },
    statistics_label: {
        fontSize: 16,
        marginLeft: 5,
        color: "#ed007e"
    }
})