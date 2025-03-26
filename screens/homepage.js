import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';

import { auth, database } from '../utils/database';
import { collection, onSnapshot, orderBy, query, doc, getDoc, where } from 'firebase/firestore';
import RadioGroup from 'react-native-radio-buttons-group';

import * as ImagePicker from 'expo-image-picker';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { localUserLogin, erase_all, getSaveLanguage, setSaveLanguage } from '../utils/localstorage';
import Modal from 'react-native-modalbox';
import { signOut } from 'firebase/auth';
import { useTheme } from '@react-navigation/native';
import { isWasInteracted, isWasInteractedByID, isWasSaved } from '../utils/interations';

import '../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export default function Homepage(props) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [myAvatar, setMyAvatar] = useState(null);

    const [modalOptions, setModalOptions] = useState(false);
    const [configLanguage, setConfigLanguage] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState('system');

    const { colors } = useTheme();
    const { t } = useTranslation();

    const platform = Platform.OS;

    const radioButtonsLanguage = useMemo(() => ([
        {
            id: 1,
            label: t('optionSystem'),
            value: 'system',
            color: colors.primary
        },
        {
            id: 2,
            label: t('optionEnglish'),
            value: 'english',
            color: colors.primary
        },
        {
            id: 3,
            label: t('optionSpanish'),
            value: 'spanish',
            color: colors.primary
        }
    ]), []);

    useEffect(() => {
        // setMyAvatar(localUserLogin.avatar);
        getSelectedLanguage();
        loadAllPublish();
    }, []);

    const alertLogOut = () =>
        Alert.alert(
            t('logoutTitle'),
            t('logout'),
            [
                {
                    text: t('no'),
                    style: 'cancel',
                },
                {
                    text: t('yes'),
                    onPress: () => log_out()
                },
            ],
        );

    function openModalOptions() {
        if (modalOptions) {
            setModalOptions(false);
        } else {
            setModalOptions(true);
        }
    }

    function openModalLanguage() {
        if (configLanguage) {
            setConfigLanguage(false);
        } else {
            setConfigLanguage(true);
        }
    }

    const getSelectedLanguage = async () => {
        const language = await getSaveLanguage();

        if (language == 'system') {
            setSelectedLanguage(1);
        } else if (language == 'english') {
            setSelectedLanguage(2);
        } else if (language == 'spanish') {
            setSelectedLanguage(3);
        }
    }

    const setNewLanguage = async (e) => {
        setSelectedLanguage(e);
        if (e === 1) {
            await setSaveLanguage('system');
        } else if (e === 2) {
            await setSaveLanguage('english');
            i18n.changeLanguage('en');
        } else if (e === 3) {
            await setSaveLanguage('spanish');
            i18n.changeLanguage('es');
        }
        Alert.alert(t('restart'));
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

    function loadAllPublish() {
        try {
            const collectionRef = collection(database, 'publications');
            const q = query(collectionRef, where("status", "in", [2, 3, 4]), orderBy('date', 'desc'));

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
                setPublications(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        body: doc.data().body,
                        urlImages: doc.data().urlImages,
                        replyID: doc.data().replyID,
                        status: doc.data().status,
                        author: doc.data().author,
                        // comments_container: await searchMyComment(doc.id),
                        date: doc.data().date,
                        likes: doc.data().likes,
                        shares: doc.data().shares,
                        userId: doc.data().userId
                    }))
                )
            });
            setLoading(false);
            return unsubscribe;
        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const log_out = async () => {
        signOut(auth).catch(error => console.error(error));
        await erase_all();
        props.navigation.replace('Login');
    }

    function goNewPublish() {
        if (localUserLogin.id != undefined) {
            props.navigation.navigate('NewPublication');
        } else {
            Alert.alert(t('internetErrorTitle'), t('internetError'));
        }
    }

    function goMyPerfil() {
        props.navigation.navigate({ name: 'Perfil', params: { userId: localUserLogin.id }, merge: true });
    }

    function goToConfig() {
        setModalOptions(false);
        props.navigation.navigate("ConfigGeneral");
    }

    function goSaves() {
        if (localUserLogin.id != undefined) {
            props.navigation.navigate('Saves');
        }
    }

    return (
        <View style={{ backgroundColor: colors.background }}>
            <View style={{
                flexDirection: "column",
                backgroundColor: colors.primary_dark,
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 10
            }}>
                <View style={styles.header_row}>
                    <TouchableOpacity onPress={openModalOptions}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='dots-grid' />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 19, fontWeight: "bold", color: colors.text }}>{t('homepage')}</Text>
                    <TouchableOpacity onPress={goMyPerfil}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='account-circle-outline' />
                    </TouchableOpacity>
                </View>

                <View style={styles.header_row}>
                    <TouchableOpacity style={styles.new_publication_zone} onPress={goNewPublish}>
                        <View style={{
                            padding: 10,
                            borderColor: colors.primary,
                            borderWidth: 2,
                            borderRadius: 10,
                            outlineStyle: "solid",
                            outlineWidth: 4,
                        }}>
                            <Text style={{ fontSize: 16, padding: 2, color: colors.text }}>{t('whatsThink')}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={takePhoto}>
                        <View style={{ backgroundColor: colors.primary, padding: 11, borderRadius: 15 }}>
                            <MaterialCommunityIcons style={{ fontSize: 29, color: colors.background }} name='camera' />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={true}>
                <View style={styles.container}>
                    {loading ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size={50} color={colors.primary} />
                        </View>
                        :
                        <View style={{ marginHorizontal: 15 }}>
                            {/* publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isComment={isWasCommented(publication.comments_container)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />) */}
                            {publications.length == 0 ?
                                <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 500 }}>
                                    <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 100, marginBottom: 10 }} name='account-group-outline' />
                                    <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('noFriendsTitle')}</Text>
                                    <Text style={{ color: colors.primary, fontSize: 18, textAlign: "center" }}>{t('noFriends')}</Text>
                                </View>
                                :
                                publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)}
                            <View style={{ height: 160 }}></View>
                        </View>
                    }
                </View>
                <Modal style={{
                    padding: 20,
                    maxHeight: 210,
                    maxWidth: 330,
                    borderRadius: 20,
                    backgroundColor: colors.primary_dark,
                    alignItems: 'flex-start'
                }} position={"center"} isOpen={modalOptions} coverScreen={true}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={goSaves}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='book-search-outline' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('saves')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={openModalLanguage}>
                        <MaterialIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='language' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('buttonChangeLanguage')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={goToConfig}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='cog-outline' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('configLabel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={platform === 'web' ? log_out : alertLogOut}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text_error, marginRight: 10 }} name='logout' />
                        <Text style={{ fontSize: 18, color: colors.text_error, fontWeight: 'bold' }}>{t('exit')}</Text>
                    </TouchableOpacity>
                </Modal>

                <Modal style={{
                    paddingTop: 20,
                    paddingHorizontal: 10,
                    maxHeight: 175,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 20,
                    backgroundColor: colors.background,
                    alignItems: 'flex-start'
                }} position={"bottom"} isOpen={configLanguage} onClosed={openModalLanguage} coverScreen={true}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                    </View>
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtonsLanguage}
                        onPress={setNewLanguage}
                        selectedId={selectedLanguage}
                        labelStyle={{ color: colors.text }}
                    />
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
    },
    header_row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8
    },
    new_publication_zone: {
        width: "82%"
    },
    avatar: {
        height: 50,
        width: 50,
        borderColor: "white",
        borderWidth: 2.5,
        borderRadius: 100
    }
})