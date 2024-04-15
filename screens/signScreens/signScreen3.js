import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignUp, { params } from '../../utils/signUp';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function SignScreen3(props) {
    const [avatarURI, setAvatarURI] = useState(null);
    const [bannerURL, setBannerURL] = useState(null);

    const [userAvatarName, setUserAvatarName] = useState("avatar");
    const [userAvatarType, setUserAvatarType] = useState("pnj");

    const [userBannerName, setUserBannerName] = useState("banner");
    const [userBannerType, setUserBannerType] = useState("pnj");

    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

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
                setUserBannerName(image.assets[0].width);
                setUserBannerType(getFormatImage(image.assets[0].mimeType))
            }
        } else {
            Alert.alert("Permisos denegados", "Por favor, sin el permiso de la galeria, no puedes cambiar el banner");
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
                setUserAvatarName(image.assets[0].width);
                setUserAvatarType(getFormatImage(image.assets[0].mimeType))
            }
        } else {
            Alert.alert("Permisos denegados", "Por favor, sin el permiso de la galeria, no puedes cambiar la foto de perfil");
        }
    }

    function goBackAgain() {
        props.navigation.goBack()
    }

    function getFormatImage(imageType) {
        const array = imageType.split('/');
        return array[1];
    }

    const trySingUp = async () => {
        setLoading(true)
        params.avatar = avatarURI;
        params.avatarName = userAvatarName;
        params.avatarExt = userAvatarType;
        params.banner = bannerURL;
        params.details = description;

        SignUp().then((res) => {
            if (res) {
                props.navigation.navigate('WelcomeScreen');
            } else {
                setLoading(false);
                Alert.alert("Error en el servidor", "Ha ocurrido  un error, vuelvelo a intentar mas tarde");
                props.navigation.navigate('Login');
            }
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBackAgain}>
                    <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                </TouchableOpacity>
                <Text style={styles.title}>Ultimos detalles de la cuenta</Text>
            </View>

            <View style={styles.subContainer}>
                {bannerURL != null ?
                    <Image style={styles.backgroundBanner} source={{ uri: bannerURL }} />
                    :
                    <View style={styles.NoBanner}></View>
                }
                <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../../assets/avatar-default.png')} />
                <View style={styles.namesContainer}>
                    <Text style={styles.namesNickname}>{params.nickname}</Text>
                    <Text style={styles.namesUsername}>@{params.username}</Text>
                </View>

                <View style={styles.subContainerBody}>
                    <TouchableOpacity onPress={UploadAvatar}>
                        <View style={styles.submitphotoButton}>
                            <MaterialCommunityIcons style={styles.submitphotoIcon} name='account-box-multiple-outline' />
                            <Text style={styles.submitphotoLabel}>Subir foto de tu perfil</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={UploadBanner}>
                        <View style={styles.submitphotoButton}>
                            <MaterialCommunityIcons style={styles.submitphotoIcon} name='image-edit-outline' />
                            <Text style={styles.submitphotoLabel}>Subir foto del banner de tu nuevo perfil</Text>
                        </View>
                    </TouchableOpacity>


                    <View style={styles.new_description}>
                        <TextInput
                            placeholder='Redacta una descripcion para tu nuevo perfil'
                            placeholderTextColor="#c50056"
                            onChangeText={(text) => setDescription(text)}
                            style={styles.input}
                            autoFocus={false}
                            multiline={true}
                            maxLength={100} />
                        <Text style={styles.statistics_label}>{description.length} / 100</Text>
                    </View>

                    {loading ?
                        <View style={styles.signLoadingButton}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.signTextButton}>Creando la cuenta</Text>
                        </View>
                        :
                        <TouchableOpacity style={styles.signButton} onPress={trySingUp}>
                            <Text style={styles.signTextButton}>Crear la cuenta</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 10,
        backgroundColor: '#210016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    back_button: {
        fontSize: 60,
        color: "white"
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
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
    avatar: {
        position: "absolute",
        top: 45,
        left: 30,
        height: 110,
        width: 110,
        borderRadius: 50,
        zIndex: 1
    },
    namesContainer: {
        flexDirection: 'row',
        marginTop: 30,
        marginLeft: 20,
        alignItems: "center"
    },
    namesNickname: {
        color: "white",
        fontSize: 35,
        fontWeight: 'bold',
        marginLeft: 10
    },
    namesUsername: {
        color: "#b2b2b2",
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 10
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
    new_description: {
        marginHorizontal: 5,
        marginVertical: 20,
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
    statistics_label: {
        fontSize: 16,
        marginLeft: 5,
        color: "#ed007e"
    },
    signLoadingButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        marginTop: 35,
        backgroundColor: '#20456e',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    loadingSpinner: {
        marginRight: 10
    },
    signButton: {
        marginBottom: 20,
        backgroundColor: '#4895EF',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    signTextButton: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20
    }
});