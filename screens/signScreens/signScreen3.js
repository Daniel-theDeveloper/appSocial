import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { params } from '../../utils/signUp';
import { useTheme } from '@react-navigation/native';
import { localUserLogin } from '../../utils/localstorage';

import { database } from '../../utils/database';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from "firebase/storage";

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function SignScreen3(props) {
    const [avatarURI, setAvatarURI] = useState(null);
    const [bannerURL, setBannerURL] = useState(null);

    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const { colors } = useTheme();

    const { t } = useTranslation();

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
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
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
            Alert.alert(t('deniedPermissionsTitle'), t('photoDenied'));
        }
    }

    function goBackAgain() {
        props.navigation.navigate('WelcomeScreen');
    }

    const trySingUp = async () => {
        setLoading(true)
        try {
            const docRef = doc(database, 'users', localUserLogin.id);

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
            if (description.length > 0) {
                await updateDoc(docRef, {
                    details: description
                });
            }

            setLoading(false);
            props.navigation.replace('WelcomeScreen');
        } catch (error) {
            setLoading(false);
            Alert.alert(t('serverErrorTitle'), t('changePhotoError'));
            console.error(error);
            props.navigation.replace('WelcomeScreen');
        }
    }

    return (
        <ScrollView style={{
            flex: 1,
            flexGrow: 1,
            padding: 10,
            backgroundColor: colors.background
        }}>
            <Text style={{ fontSize: 23, marginBottom: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>{t('lastStepTitle')}</Text>

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
                    <View style={{ height: 110, width: '100%', backgroundColor: colors.secondary_dark_alternative, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}></View>
                }
                <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../../assets/avatar-default.png')} />
                <View style={styles.namesContainer}>
                    <Text style={{ color: colors.text, fontSize: 25, fontWeight: 'bold', marginLeft: 10 }}>{params.nickname}</Text>
                    <Text style={{ color: colors.text_dark, fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>@{params.username}</Text>
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
                            <MaterialCommunityIcons style={{ fontSize: 23, color: colors.text, marginRight: 6 }} name='account-box-multiple-outline' />
                            <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }}>{t('submitPhoto')}</Text>
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
                            <MaterialCommunityIcons style={{ fontSize: 23, color: colors.text, marginRight: 6 }} name='image-edit-outline' />
                            <Text style={{ fontSize: 14, color: colors.text, fontWeight: 'bold' }}>{t('submitBanner')}</Text>
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
                            placeholder={t('addDesc')}
                            placeholderTextColor={colors.holderText}
                            onChangeText={(text) => setDescription(text)}
                            style={{
                                fontSize: 14,
                                color: colors.text,
                                minHeight: 60,
                                textAlignVertical: "top",
                            }}
                            autoFocus={false}
                            multiline={true}
                            maxLength={100} />
                        <Text style={{ fontSize: 14, marginLeft: 5, color: colors.primary }}>{description.length} / 100</Text>
                    </View>

                    <TouchableOpacity style={{ marginBottom: 20, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={goBackAgain}>
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('skip')}</Text>
                    </TouchableOpacity>

                    {loading ?
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignContent: 'center',
                            backgroundColor: colors.secondary_dark,
                            borderRadius: 30,
                            width: 100,
                            paddingVertical: 10,
                            width: '100%'
                        }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('loading')}</Text>
                        </View>
                        :
                        <TouchableOpacity style={{ marginBottom: 20, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={trySingUp}>
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('nextButton')}</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    subContainerBody: {
        marginTop: 20,
        marginBottom: 10,
        marginHorizontal: 10
    },
    backgroundBanner: {
        height: 110,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    avatar: {
        position: "absolute",
        top: 45,
        left: 30,
        height: 90,
        width: 90,
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