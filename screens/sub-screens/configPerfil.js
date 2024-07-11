import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { localUserLogin } from '../../utils/localstorage';

import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';

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

    const { colors } = useTheme();

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
                        const url = localUserLogin.username + "/avatar.png";

                        const response = await fetch(avatarURI);
                        const blob = await response.blob();
                        const storage = getStorage();
                        const storageRef = ref(storage, url);

                        const snapshot = await uploadBytes(storageRef, blob);

                        URLImage = snapshot.ref.fullPath;
                        localUserLogin.avatar = avatarURI
                        await updateDoc(docRef, {
                            avatar: URLImage
                        });
                    }
                }
                if (userData.banner != bannerURL) {
                    if (bannerURL != null) {
                        let URLBanner;
                        const url = localUserLogin.username + "/banner.png";

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

                localUserLogin.nickname = nickname;
                setLoading(false);
                props.navigation.navigate('Perfil');
            } catch (error) {
                setLoading(false);
                Alert.alert("Error en el servidor", "Por favor, Vuélvalo a intentar mas tarde");
                console.error(error);
            }
        } else {
            Alert.alert("Datos vacíos", "Por favor, llene todos los campos requeridos");
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
        <ScrollView style={{ flex: 1, flexGrow: 1, padding: 10, backgroundColor: colors.background }}>
            <TouchableOpacity style={styles.header} onPress={NotSaveAlert}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>Configuracion del perfil</Text>
            </TouchableOpacity>
            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                {bannerURL != null ?
                    <Image style={styles.backgroundBanner} source={{ uri: bannerURL }} />
                    :
                    <View style={{ height: 140, width: '100%', backgroundColor: colors.quartet_dark, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}></View>
                }
                <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../../assets/avatar-default.png')} />
                <View style={styles.subContainerBody}>
                    <TouchableOpacity onPress={UploadAvatar}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: colors.quartet,
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
                        }}>
                            <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 10 }} name='account-box-multiple-outline' />
                            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Cambiar foto de tu perfil</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={UploadBanner}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: colors.quartet,
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
                        }}>
                            <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 10 }} name='image-edit-outline' />
                            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Cambiar foto del banner de tu perfil</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                <Text style={{ marginBottom: 10, fontSize: 20, fontWeight: 'bold', color: colors.text }}>Apodo:</Text>
                <View style={{
                    padding: 18,
                    backgroundColor: colors.background,
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
                }}>
                    <TextInput placeholder='Mi nuevo apodo' placeholderTextColor={colors.holderText} style={{ fontSize: 18, fontWeight: 'bold', color: colors.secondary }} defaultValue={userData.name} onChangeText={(text) => setNickname(text)} autoCorrect={false} maxLength={25} />
                </View>
            </View>

            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                <Text style={{ marginBottom: 10, fontSize: 20, fontWeight: 'bold', color: colors.text }}>Pais:</Text>
                <View style={{
                    padding: 18,
                    backgroundColor: colors.background,
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
                }}>
                    <TextInput placeholder='Mi nuevo pais' placeholderTextColor={colors.holderText} style={{ fontSize: 18, fontWeight: 'bold', color: colors.secondary }} defaultValue={userData.country} onChangeText={(text) => setCountry(text)} autoCorrect={false} maxLength={25} />
                </View>

                <View style={styles.separator}></View>

                <Text style={{ marginBottom: 10, fontSize: 20, fontWeight: 'bold', color: colors.text }}>Ciudad (opcional):</Text>
                <View style={{
                    padding: 18,
                    backgroundColor: colors.background,
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
                }}>
                    <TextInput placeholder='Mi nueva ciudad' placeholderTextColor={colors.holderText} style={{ fontSize: 18, fontWeight: 'bold', color: colors.secondary }} defaultValue={userData.city} onChangeText={(text) => setCity(text)} autoCorrect={false} maxLength={25} />
                </View>
            </View>

            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                <Text style={{ marginBottom: 10, fontSize: 20, fontWeight: 'bold', color: colors.text }}>Descripcion de tu perfil:</Text>
                <View style={{ padding: 10, borderColor: colors.primary, borderWidth: 1.5, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2, }}>
                    <TextInput
                        placeholder='Redacta una descripcion sobre tu perfil'
                        placeholderTextColor={colors.holderText}
                        defaultValue={userData.details}
                        onChangeText={(text) => setDescription(text)}
                        style={{ fontSize: 18, fontWeight: 'bold', color: colors.secondary }}
                        autoFocus={false}
                        multiline={true}
                        maxLength={100} />
                    <Text style={{ fontSize: 16, marginTop: 20, marginLeft: 5, color: colors.primary }}>{description.length} / 100</Text>
                </View>
            </View>

            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                {loading ?
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        backgroundColor: colors.quartet_dark,
                        borderRadius: 30,
                        width: 100,
                        paddingVertical: 10,
                        width: '100%'
                    }}>
                        <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={{backgroundColor: colors.quartet, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}} onPress={SaveAlert}>
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Guardar cambios</Text>
                    </TouchableOpacity>
                }
                <View style={styles.separator}></View>
                {loading ?
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        backgroundColor: colors.quartet_dark,
                        borderRadius: 30,
                        width: 100,
                        paddingVertical: 10,
                        width: '100%'
                    }}>
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Salir</Text>
                    </View>
                    :
                    <TouchableOpacity style={{backgroundColor: colors.quartet, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}} onPress={NotSaveAlert}>
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Salir</Text>
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
    separator: {
        marginVertical: 10
    },
    loadingSpinner: {
        marginRight: 10
    }
});