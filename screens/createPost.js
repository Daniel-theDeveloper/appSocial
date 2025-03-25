import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { database } from '../utils/database';
import { new_publication_params } from './sub-screens/new_publication';
import { useTheme } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../utils/localstorage';
import { isWasInteracted, isWasInteractedByID, isWasCommented, isWasSaved } from '../utils/interations';

import '../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function CreatePost(props) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDescending, setIsDescending] = useState(true);
    const [orderStatus, setOrderStatus] = useState('desc');

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        loadMyPublish();
    }, []);

    function loadMyPublish() {
        setLoading(true);
        try {
            const collectionRef = collection(database, 'publications');
            const q = query(collectionRef,
                where("userId", "==", localUserLogin.id),
                where("status", "in", [1, 2, 3, 4]),
                orderBy('date', orderStatus)
            );

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                setPublications(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        body: doc.data().body,
                        urlImages: doc.data().urlImages,
                        replyID: doc.data().replyID,
                        status: doc.data().status,
                        userId: doc.data().userId,
                        comments: doc.data().comments,
                        // comments_container: doc.data().comments_container,
                        date: doc.data().date,
                        likes: doc.data().likes,
                        shares: doc.data().shares,
                        author: doc.data().author
                    }))
                )
                setLoading(false);
            })
            return unsubscribe;
        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const takePhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchCameraAsync({
                allowsMultipleSelection: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 0.8,
                selectionLimit: 10
            });
            if (!image.canceled) {
                props.navigation.navigate({ name: 'NewPublication', params: { photo: image }, merge: true });
            }
        } else {
            Alert.alert(t('deniedPermissionsTitle'), t('galleryDenied'));
        }
    }

    function goNewPublish() {
        if (localUserLogin.id != undefined) {
            props.navigation.navigate('NewPublication');
        } else {
            Alert.alert(t('internetErrorTitle'), t('internetError'));
        }
    }

    function setOrder() {
        if (isDescending) {
            setIsDescending(false)
            setOrderStatus('desc')
            loadMyPublish()
        } else {
            setIsDescending(true)
            setOrderStatus('asc')
            loadMyPublish()
        }
    }

    return (
        <ScrollView style={{ flex: 1, flexGrow: 1, padding: 20, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10, color: colors.primary }}>{t('yourContent')}</Text>

            <View style={styles.header_row}>
                <TouchableOpacity style={styles.new_publication_zone} onPress={goNewPublish}>
                    <View style={{ padding: 10, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 4, }}>
                        <Text style={{ fontSize: 17, padding: 2, color: colors.text }}>{t('whatsThink')}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto}>
                    <View style={{ backgroundColor: colors.primary, padding: 11, borderRadius: 15 }}>
                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.background }} name='camera' />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.config_block}>
                <Text style={{ color: colors.secondary, fontSize: 18, fontWeight: "bold" }}>{t('sortByButton')}</Text>
                {isDescending ?
                    <TouchableOpacity onPress={setOrder}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 6,
                            borderWidth: 2.5,
                            borderRadius: 10,
                            borderColor: colors.secondary,
                            outlineStyle: "solid",
                            outlineWidth: 4,
                            marginLeft: 10
                        }}>
                            <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20 }} name='order-bool-descending' />
                            <Text style={{ color: colors.text, fontSize: 15, marginLeft: 10 }}>{t('sortByRecent')}</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={setOrder}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 6,
                            borderWidth: 2.5,
                            borderRadius: 10,
                            borderColor: colors.secondary,
                            outlineStyle: "solid",
                            outlineWidth: 4,
                            marginLeft: 10
                        }}>
                            <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20 }} name='order-bool-ascending' />
                            <Text style={{ color: colors.text, fontSize: 15, marginLeft: 10 }}>{t('sortByOld')}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>

            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color={colors.primary} size={80} style={styles.loading_spiner} />
                    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "bold" }}>{t('loading')}</Text>
                </View>
                :
                publications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 80, marginBottom: 10 }} name='book-open-page-variant-outline' />
                        <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('newUserMessage')}</Text>
                        <Text style={{ color: colors.primary, fontSize: 18, textAlign: "center", }}>{t('newUserSubtitle')}</Text>
                    </View>
                    :
                    publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header_row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8
    },
    new_publication_zone: {
        width: "82%"
    },
    config_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20
    },
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 500
    },
    loading_spiner: {
        height: 90,
        width: 90
    }
})