import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { params } from '../../utils/signUp';
import { useTheme } from '@react-navigation/native';

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

    const { colors } = useTheme();

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
        props.navigation.navigate('WelcomeScreen');
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


    }

    return (
        <View style={{
            flex: 1,
            flexGrow: 1,
            padding: 10,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Text style={{ fontSize: 25, marginBottom: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>Su cuenta se ha creado, solo unos ultimos detalles</Text>

            <View style={{
                backgroundColor: colors.primary_dark,
                width: "100%",
                borderRadius: 24,
                shadowColor: colors.shadow,
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
                    <View style={{ height: 140, width: '100%', backgroundColor: colors.secondary_dark_alternative, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}></View>
                }
                <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../../assets/avatar-default.png')} />
                <View style={styles.namesContainer}>
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>{params.nickname}</Text>
                    <Text style={{ color: colors.text_dark, fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>@{params.username}</Text>
                </View>

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
                            shadowColor: colors.shadow,
                            shadowOpacity: 0.55,
                            shadowRadius: 4,
                            elevation: 5,
                            shadowOffset: {
                                width: 10,
                                height: 10
                            }
                        }}>
                            <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 10 }} name='account-box-multiple-outline' />
                            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Subir foto de tu perfil</Text>
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
                            shadowColor: colors.shadow,
                            shadowOpacity: 0.55,
                            shadowRadius: 4,
                            elevation: 5,
                            shadowOffset: {
                                width: 10,
                                height: 10
                            }
                        }}>
                            <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 10 }} name='image-edit-outline' />
                            <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Subir foto del banner de tu nuevo perfil</Text>
                        </View>
                    </TouchableOpacity>


                    <View style={{
                        marginHorizontal: 5,
                        marginVertical: 20,
                        padding: 10,
                        borderColor: colors.primary,
                        borderWidth: 1.5,
                        borderRadius: 10,
                        outlineStyle: "solid",
                        outlineWidth: 2,
                    }}>
                        <TextInput
                            placeholder='Redacta una descripcion para tu nuevo perfil'
                            placeholderTextColor="#c50056"
                            onChangeText={(text) => setDescription(text)}
                            style={{
                                fontSize: 18,
                                color: colors.text,
                                minHeight: 100,
                                textAlignVertical: "top",
                            }}
                            autoFocus={false}
                            multiline={true}
                            maxLength={100} />
                        <Text style={{ fontSize: 16, marginLeft: 5, color: colors.primary }}>{description.length} / 100</Text>
                    </View>

                    <TouchableOpacity style={{marginBottom: 20, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}} onPress={goBackAgain}>
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Saltar este paso</Text>
                    </TouchableOpacity>

                    {loading ?
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignContent: 'center',
                            marginTop: 35,
                            backgroundColor: colors.secondary_dark,
                            borderRadius: 30,
                            width: 100,
                            paddingVertical: 10,
                            width: '100%'
                        }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Cargando</Text>
                        </View>
                        :
                        <TouchableOpacity style={{marginBottom: 20, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}} onPress={trySingUp}>
                            <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20}}>Continuar</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
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
        marginTop: 30,
        marginLeft: 20
    },
    loadingSpinner: {
        marginRight: 10
    },
});