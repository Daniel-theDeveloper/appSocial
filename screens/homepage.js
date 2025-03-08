import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';

import { auth, database } from '../utils/database';
import { collection, onSnapshot, orderBy, query, doc, getDoc, where } from 'firebase/firestore';
import RadioGroup from 'react-native-radio-buttons-group';

import * as ImagePicker from 'expo-image-picker';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { localUserLogin, erase_all, getSaveTheme, setSaveTheme, getSaveLanguaje, setSaveLanguaje } from '../utils/localstorage';
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
    const [configLanguaje, setConfigLanguaje] = useState(false);
    const [configTheme, setConfigTheme] = useState(false);

    const [selectedTheme, setSelectedTheme] = useState('system');
    const [selectedLanguaje, setSelectedLanguaje] = useState('system');

    const { colors } = useTheme();
    const { t } = useTranslation();

    const platform = Platform.OS;

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: t('optionLight'),
            value: 'light',
            color: colors.primary
        },
        {
            id: 2,
            label: t('optionDark'),
            value: 'dark',
            color: colors.primary
        },
        {
            id: 3,
            label: t('optionSystem'),
            value: 'system',
            color: colors.primary
        }
    ]), []);

    const radioButtonsLanguaje = useMemo(() => ([
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
        getSelectedTheme();
        getSelectedLanguaje();
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

    function openModalConfig() {
        if (configTheme) {
            setConfigTheme(false);
        } else {
            setConfigTheme(true);
        }
    }

    function openModalLanguaje() {
        if (configLanguaje) {
            setConfigLanguaje(false);
        } else {
            setConfigLanguaje(true);
        }
    }

    const getSelectedTheme = async () => {
        const theme = await getSaveTheme();

        if (theme == 'light') {
            setSelectedTheme(1);
        } else if (theme == 'dark') {
            setSelectedTheme(2);
        } else if (theme == 'system') {
            setSelectedTheme(3);
        }
    }

    const getSelectedLanguaje = async () => {
        const languaje = await getSaveLanguaje();

        if (languaje == 'system') {
            setSelectedLanguaje(1);
        } else if (languaje == 'english') {
            setSelectedLanguaje(2);
        } else if (languaje == 'spanish') {
            setSelectedLanguaje(3);
        }
    }

    const setNewTheme = async (e) => {
        setSelectedTheme(e);
        if (e === 1) {
            await setSaveTheme('light');
        } else if (e === 2) {
            await setSaveTheme('dark');
        } else if (e === 3) {
            await setSaveTheme('system');
        }
        Alert.alert(t('restart'));
    }

    const setNewLanguaje = async (e) => {
        setSelectedLanguaje(e);
        if (e === 1) {
            await setSaveLanguaje('system');
        } else if (e === 2) {
            await setSaveLanguaje('english');
            i18n.changeLanguage('en');
        } else if (e === 3) {
            await setSaveLanguaje('spanish');
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

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
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
            return unsuscribe;
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

    const goSaves = async () => {
        try {
            const docRef = doc(database, "users", localUserLogin.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                props.navigation.navigate({ name: 'Saves', params: { saves: docSnap.data().saves }, merge: true });
            } else {
                Alert.alert(t('serverErrorTitle'), t('serverError'));
            }
        } catch (error) {
            Alert.alert(t('serverErrorTitle'), t('serverError'));
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
                        <View style={loadingStyle.container}>
                            <View style={loadingStyle.perfil_header}>
                                <View style={{
                                    height: 50,
                                    width: 50,
                                    borderRadius: 100,
                                    backgroundColor: colors.primary_dark
                                }}></View>
                                <View style={loadingStyle.perfil_usernames_container}>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        backgroundColor: colors.primary_dark,
                                        marginBottom: 10,
                                        borderRadius: 5
                                    }}></View>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        borderRadius: 5,
                                        backgroundColor: colors.primary_dark
                                    }}></View>
                                </View>
                            </View>
                            <View style={{
                                padding: 10,
                                height: 120,
                                backgroundColor: colors.primary_dark,
                                borderRadius: 15,
                                marginBottom: 20
                            }}></View>
                            <View style={loadingStyle.perfil_header}>
                                <View style={{
                                    height: 50,
                                    width: 50,
                                    borderRadius: 100,
                                    backgroundColor: colors.primary_dark
                                }}></View>
                                <View style={loadingStyle.perfil_usernames_container}>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        backgroundColor: colors.primary_dark,
                                        marginBottom: 10,
                                        borderRadius: 5
                                    }}></View>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        borderRadius: 5,
                                        backgroundColor: colors.primary_dark
                                    }}></View>
                                </View>
                            </View>
                            <View style={{
                                padding: 10,
                                height: 120,
                                backgroundColor: colors.primary_dark,
                                borderRadius: 15,
                                marginBottom: 20
                            }}></View>
                            <View style={loadingStyle.perfil_header}>
                                <View style={{
                                    height: 50,
                                    width: 50,
                                    borderRadius: 100,
                                    backgroundColor: colors.primary_dark
                                }}></View>
                                <View style={loadingStyle.perfil_usernames_container}>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        backgroundColor: colors.primary_dark,
                                        marginBottom: 10,
                                        borderRadius: 5
                                    }}></View>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        borderRadius: 5,
                                        backgroundColor: colors.primary_dark
                                    }}></View>
                                </View>
                            </View>
                            <View style={{
                                padding: 10,
                                height: 120,
                                backgroundColor: colors.primary_dark,
                                borderRadius: 15,
                                marginBottom: 20
                            }}></View>
                            <View style={loadingStyle.perfil_header}>
                                <View style={{
                                    height: 50,
                                    width: 50,
                                    borderRadius: 100,
                                    backgroundColor: colors.primary_dark
                                }}></View>
                                <View style={loadingStyle.perfil_usernames_container}>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        backgroundColor: colors.primary_dark,
                                        marginBottom: 10,
                                        borderRadius: 5
                                    }}></View>
                                    <View style={{
                                        height: 18,
                                        width: 150,
                                        borderRadius: 5,
                                        backgroundColor: colors.primary_dark
                                    }}></View>
                                </View>
                            </View>
                            <View style={{
                                padding: 10,
                                height: 120,
                                backgroundColor: colors.primary_dark,
                                borderRadius: 15,
                                marginBottom: 20
                            }}></View>
                        </View>
                        :
                        <View style={loadingStyle.publications_colections}>
                            {/* publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isComment={isWasCommented(publication.comments_container)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />) */}
                            {publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)}
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
                }} position={"center"} isOpen={modalOptions} onClosed={openModalOptions} coverScreen={true}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={openModalConfig}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='theme-light-dark' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('buttonChangeTheme')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={goSaves}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='book-search-outline' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('saves')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={openModalLanguaje}>
                        <MaterialIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='language' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('buttonChangeLanguage')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={platform === 'web' ? log_out : alertLogOut}>
                        <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text_error, marginRight: 10 }} name='logout' />
                        <Text style={{ fontSize: 18, color: colors.text_error, fontWeight: 'bold' }}>{t('exit')}</Text>
                    </TouchableOpacity>
                </Modal>

                <Modal style={{
                    paddingTop: 20,
                    paddingHorizontal: 10,
                    maxHeight: 190,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 20,
                    backgroundColor: colors.background,
                    alignItems: 'flex-start'
                }} position={"bottom"} isOpen={configTheme} onClosed={openModalConfig} coverScreen={true}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 10 }}></View>
                    </View>
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtons}
                        onPress={setNewTheme}
                        selectedId={selectedTheme}
                        labelStyle={{ color: colors.text }}
                    />
                </Modal>

                <Modal style={{
                    paddingTop: 20,
                    paddingHorizontal: 10,
                    maxHeight: 175,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 20,
                    backgroundColor: colors.background,
                    alignItems: 'flex-start'
                }} position={"bottom"} isOpen={configLanguaje} onClosed={openModalLanguaje} coverScreen={true}>
                    <View style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                    </View>
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtonsLanguaje}
                        onPress={setNewLanguaje}
                        selectedId={selectedLanguaje}
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

const loadingStyle = StyleSheet.create({
    container: {
        margin: 15
    },
    perfil_header: {
        flexDirection: "row",
        marginBottom: 10
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    publications_colections: {
        marginHorizontal: 15
    }
})