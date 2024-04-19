import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { localUserLogin } from '../../utils/localstorage';

import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export let userData = {
    id: "",
    avatar: null,
    banner: null,
    username: "",
    name: "",
    details: "",
    country: "",
    city: ""
}

export default function ConfigPerfil(props) {
    const [avatarURI, setAvatarURI] = useState(userData.avatar);
    const [bannerURL, setBannerURL] = useState(userData.banner);

    const [nickname, setNickname] = useState(userData.name);
    const [country, setCountry] = useState(userData.country);
    const [city, setCity] = useState(userData.city);
    const [description, setDescription] = useState(userData.details);

    const [loading, setLoading] = useState(false);

    function goBackAgain() {
        props.navigation.goBack()
    }

    const saveConfig = async () => {
        if (nickname.length != 0 && country.length != 0 && description.length != 0) {
            setLoading(true);
            try {
                const docRef = doc(database, 'users', userData.id);

                if (userData.avatar != avatarURI) {
                    if (avatarURI != null) {
                        let URLImage;
                        const url = localUserLogin.username+"/avatar.png";
        
                        const response = await fetch(avatarURI);
                        const blob = await response.blob();
                        const storage = getStorage();
                        const storageRef = ref(storage, url);
        
                        const snapshot = await uploadBytes(storageRef, blob);
        
                        URLImage = snapshot.ref.fullPath;
                        await updateDoc(docRef, {
                            avatar: URLImage
                        });
                    }
                }
                if (userData.banner != bannerURL) {
                    if (bannerURL != null) {
                        let URLBanner;
                        const url = localUserLogin.username+"/banner.png";
        
                        const response = await fetch(bannerURL);
                        const blob = await response.blob();
                        const storage = getStorage();
                        const storageRef = ref(storage, url);
        
                        const snapshot = await uploadBytes(storageRef, blob);
        
                        URLBanner = snapshot.ref.fullPath;
                        await updateDoc(docRef, {
                            banner: URLBanner
                        });
                    }
                }

                await updateDoc(docRef, {
                    country: country,
                    city: city != undefined ? city : null,
                    name: nickname,
                    details: description
                });
                setLoading(false);
                props.navigation.navigate('Perfil');
            } catch (error) {
                setLoading(false);
                Alert.alert("Error en el servidor", "Por favor, vuelvelo a intentar mas tarde");
                console.error(error);
            }
        } else {
            Alert.alert("Datos vacios", "Por favor, llene todos los campos requeridos");
        }
    }

    const UploadAvatar = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                aspect: [2, 2],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
            if (image.canceled) {
                // Nothing
            } else {
                setAvatarURI(image.assets[0].uri);
            }
        } else {
            Alert.alert("Permisos denegados", "Por favor, sin el permiso de la galeria, no puedes cambiar la foto de perfil");
        }
    }

    const UploadBanner = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                aspect: [4, 2],
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
            if (image.canceled) {
                // Nothing
            } else {
                setBannerURL(image.assets[0].uri);
            }
        } else {
            Alert.alert("Permisos denegados", "Por favor, sin el permiso de la galeria, no puedes cambiar el banner");
        }
    }

    const SaveAlert = () =>
        Alert.alert(
            '¿Guardar configuracion?',
            '¿Desea guardar los cambios?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Si',
                    onPress: () => saveConfig()
                }
            ],
        );

    const NotSaveAlert = () =>
        Alert.alert(
            'Salir de la configuracion',
            '¿Desea salirse de la configuracion sin guardar ningun cambio?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Si',
                    onPress: () => goBackAgain()
                }
            ],
        );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                <Text style={styles.title}>Configuracion del perfil</Text>
            </View>
            <View style={styles.subContainer}>
                {bannerURL != null ?
                    <Image style={styles.backgroundBanner} source={{ uri: bannerURL }} />
                    :
                    <View style={styles.NoBanner}></View>
                }
                <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../../assets/avatar-default.png')} />
                <View style={styles.subContainerBody}>
                    <TouchableOpacity onPress={UploadAvatar}>
                        <View style={styles.submitphotoButton}>
                            <MaterialCommunityIcons style={styles.submitphotoIcon} name='account-box-multiple-outline' />
                            <Text style={styles.submitphotoLabel}>Cambiar foto de tu perfil</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={UploadBanner}>
                        <View style={styles.submitphotoButton}>
                            <MaterialCommunityIcons style={styles.submitphotoIcon} name='image-edit-outline' />
                            <Text style={styles.submitphotoLabel}>Cambiar foto del banner de tu perfil</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.subContainer2}>
                <Text style={styles.label}>Apodo:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi nuevo apodo' placeholderTextColor="#7b0051" style={styles.input} defaultValue={userData.name} onChangeText={(text) => setNickname(text)} autoCorrect={false} maxLength={25} />
                </View>
            </View>

            <View style={styles.subContainer2}>
                <Text style={styles.label}>Pais:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi nuevo pais' placeholderTextColor="#7b0051" style={styles.input} defaultValue={userData.country} onChangeText={(text) => setCountry(text)} autoCorrect={false} maxLength={25} />
                </View>

                <View style={styles.separator}></View>

                <Text style={styles.label}>Ciudad (opcional):</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi nueva ciudad' placeholderTextColor="#7b0051" style={styles.input} defaultValue={userData.city} onChangeText={(text) => setCity(text)} autoCorrect={false} maxLength={25} />
                </View>
            </View>

            <View style={styles.subContainer2}>
                <Text style={styles.label}>Descripcion de tu perfil:</Text>
                <View style={styles.new_description}>
                    <TextInput
                        placeholder='Redacta una descripcion sobre tu perfil'
                        placeholderTextColor="#c50056"
                        defaultValue={userData.details}
                        onChangeText={(text) => setDescription(text)}
                        style={styles.input}
                        autoFocus={false}
                        multiline={true}
                        maxLength={100} />
                    <Text style={styles.statistics_label}>{description.length} / 100</Text>
                </View>
            </View>

            <View style={styles.subContainer2}>
                {loading ?
                    <View style={styles.signLoadingButton}>
                        <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                        <Text style={styles.saveTextButton}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={styles.saveButton} onPress={SaveAlert}>
                        <Text style={styles.saveTextButton}>Guardar cambios</Text>
                    </TouchableOpacity>
                }
                <View style={styles.separator}></View>
                {loading ?
                    <View style={styles.signLoadingButton}>
                        <Text style={styles.saveTextButton}>Salir</Text>
                    </View>
                    :
                    <TouchableOpacity style={styles.saveButton} onPress={NotSaveAlert}>
                        <Text style={styles.saveTextButton}>Salir</Text>
                    </TouchableOpacity>
                }
            </View>

            <View style={styles.separator}></View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    back_button: {
        fontSize: 45,
        color: "white"
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 10,
        backgroundColor: '#210016'
    },
    subContainer: {
        backgroundColor: '#550038',
        width: "100%",
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 10,
            height: 10
        },
        shadowOpacity: 0.55,
        shadowRadius: 4,
        elevation: 5
    },
    subContainer2: {
        backgroundColor: '#550038',
        width: "100%",
        borderRadius: 24,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 10,
            height: 10
        },
        marginTop: 20,
        shadowOpacity: 0.55,
        shadowRadius: 4,
        elevation: 5
    },
    avatar: {
        position: "absolute",
        top: 45,
        left: 30,
        height: 110,
        width: 110,
        borderRadius: 50,
        zIndex: 1
    },
    subContainerBody: {
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 10
    },
    backgroundBanner: {
        height: 140,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    NoBanner: {
        height: 140,
        width: '100%',
        backgroundColor: '#312244',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    submitphotoButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#7209B7",
        borderRadius: 10,
        marginVertical: 10,
        padding: 10,
        width: "100%",
        shadowColor: 'black',
        shadowOpacity: 0.55,
        shadowRadius: 4,
        elevation: 5,
        shadowOffset: {
            width: 10,
            height: 10
        }
    },
    submitphotoIcon: {
        fontSize: 30,
        color: 'white',
        marginRight: 10
    },
    submitphotoLabel: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
    },
    label: {
        marginBottom: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    textContainer: {
        padding: 18,
        backgroundColor: '#210016',
        borderRadius: 20,
        width: '100%',
        height: 55,
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 3
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#4895EF",
    },
    separator: {
        marginVertical: 10
    },
    new_description: {
        padding: 10,
        borderColor: "#ff0070",
        borderWidth: 1.5,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    statistics_label: {
        fontSize: 16,
        marginTop: 20,
        marginLeft: 5,
        color: "#ed007e"
    },
    signLoadingButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#20456e',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    loadingSpinner: {
        marginRight: 10
    },
    saveButton: {
        backgroundColor: '#4895EF',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    saveTextButton: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20
    }
});