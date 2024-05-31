import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';

import { auth, database } from '../utils/database';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import RadioGroup from 'react-native-radio-buttons-group';

import { Platform } from 'react-native';
import { new_publication_params } from './sub-screens/new_publication';
import { userData } from "./sub-screens/configPerfil";

import * as ImagePicker from 'expo-image-picker';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { localUserLogin, erase_all, getSaveTheme, setSaveTheme } from '../utils/localstorage';
import Modal from 'react-native-modalbox';
import { signOut } from 'firebase/auth';
import { useTheme } from '@react-navigation/native';
import { fetchImage } from '../utils/interations';

export default function Homepage(props) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myAvatar, setMyAvatar] = useState(null);

    const [modalOptions, setModalOptions] = useState(false);
    const [configTheme, setConfigTheme] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('system');

    const { colors } = useTheme();

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: 'Claro',
            value: 'light',
            color: colors.primary
        },
        {
            id: 2,
            label: 'Oscuro',
            value: 'dark',
            color: colors.primary
        },
        {
            id: 3,
            label: 'Configuracion del sistema',
            value: 'system',
            color: colors.primary
        }
    ]), []);

    useEffect(() => {
        setMyAvatar(localUserLogin.avatar);
        loadAllPublish();
        getSelectedTheme();
    }, []);

    const alertLogOut = () =>
        Alert.alert(
            'Salirse de la plaforma',
            '¿Desea cerrar su sesion?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Si',
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
        setModalOptions(false);
        if (configTheme) {
            setConfigTheme(false);
        } else {
            setConfigTheme(true);
        }
    }

    const getSelectedTheme = async () => {
        const theme = await getSaveTheme();

        if (theme == 'light') {
            setSelectedTheme(1);
        } else if (theme == 'dark') {
            setSelectedTheme(2);
        }  else if (theme == 'system') {
            setSelectedTheme(3);
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
        Alert.alert('Reinicio necesario', 'Reinicie la aplicacion para aplicar los cambios');
    }

    const takePhoto = async () => {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();

        if (granted) {
            const image = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                allowsMultipleSelection: false,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 1
            });
            if (!image.canceled) {
                new_publication_params.isFhoto = true;
                new_publication_params.photoURI = image.assets[0].uri;
                new_publication_params.photoName = image.assets[0].width;
                new_publication_params.photoType = image.assets[0].mimeType;

                props.navigation.navigate('NewPublication');
            }
        }
    }

    function loadAllPublish() {
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef, orderBy('date', 'desc'));

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            setPublications(
                QuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    body: doc.data().body,
                    urlImage: doc.data().urlImage,
                    replyID: doc.data().replyID,
                    userId: doc.data().userId,
                    comments: doc.data().comments,
                    comments_container: doc.data().comments_container,
                    date: doc.data().date,
                    likes: doc.data().likes,
                    shares: doc.data().shares
                }))
            )
        })
        setLoading(false);
        return unsuscribe;
    }

    const log_out = async () => {
        signOut(auth).catch(error => console.error(error));
        await erase_all();
        props.navigation.replace('Login');
    }

    function goNewPublish() {
        if (localUserLogin.id != undefined) {
            new_publication_params.isFhoto = false;
            new_publication_params.photoURI = null;
            new_publication_params.photoName = null;

            props.navigation.navigate('NewPublication');
        } else {
            Alert.alert("Sin conexion a internet", "Por favor, reinicie la aplicacion");
        }
    }

    function goMyPerfil() {
        props.navigation.navigate({ name: 'Perfil', params: { userId: localUserLogin.id }, merge: true });
    }

    const goMyConfig = async () => {
        // try {
        //     const docRef = doc(database, "users", localUserLogin.id);
        //     const docSnap = await getDoc(docRef);

        //     if (docSnap.exists()) {
        //         userData.id = docSnap.id;
        //         userData.avatar = fetchImage(docSnap.data().avatar);
        //         userData.banner = fetchImage(docSnap.data().banner);
        //         userData.name = docSnap.data().name;
        //         userData.username = docSnap.data().username;
        //         userData.details = docSnap.data().details;
        //         userData.country = docSnap.data().country;
        //         userData.city = docSnap.data().city;

        //         props.navigation.navigate('ConfigPerfil');
        //     } else {
        //         Alert.alert("Error en el servidor", "Vuelve a intentar mas tarde");
        //     }
        // } catch (error) {
        //     console.error(error);
        //     Alert.alert("Error en el servidor", "Vuelve a intentar mas tarde");
        // }
        console.log("Ir a configuracion");
    }

    return (
        <ScrollView style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <View style={{
                    flexDirection: "column",
                    backgroundColor: colors.primary_dark,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 10
                }}>
                    <View style={styles.header_row}>
                        <TouchableOpacity onPress={openModalOptions}>
                            <MaterialCommunityIcons style={{ fontSize: 39, color: colors.text }} name='dots-grid' />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 19, fontWeight: "bold", color: colors.text }}>Pagina principal</Text>
                        <TouchableOpacity onPress={goMyPerfil}>
                            <Image style={styles.avatar} source={myAvatar != null ? { uri: myAvatar } : require('../assets/avatar-default.png')} />
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
                                <Text style={{ fontSize: 16, padding: 2, color: colors.text }}>Publica lo que estas pensando</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePhoto}>
                            <View style={{ backgroundColor: colors.primary, padding: 11, borderRadius: 15 }}>
                                <MaterialCommunityIcons style={{ fontSize: 29, color: colors.background }} name='camera' />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

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
                        {publications.map(publication => <Publication key={publication.id} props={props} {...publication} />)}
                    </View>
                }
            </View>
            <Modal style={{
                padding: 20,
                maxHeight: 200,
                maxWidth: 330,
                borderRadius: 20,
                backgroundColor: colors.primary_dark,
                alignItems: 'flex-start'
            }} position={"center"} isOpen={modalOptions} onClosed={openModalOptions} coverScreen={true}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={goMyConfig}>
                    <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='account-cog-outline' />
                    <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Configurar perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={openModalConfig}>
                    <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='theme-light-dark' />
                    <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Cambiar tema</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                    <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text, marginRight: 10 }} name='book-search-outline' />
                    <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>Guardados</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} onPress={alertLogOut}>
                    <MaterialCommunityIcons style={{ fontSize: 28, color: colors.text_error, marginRight: 10 }} name='logout' />
                    <Text style={{ fontSize: 18, color: colors.text_error, fontWeight: 'bold' }}>Cerrar sesión</Text>
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
            }} position={"bottom"} isOpen={configTheme} onClosed={openModalConfig} coverScreen={true}>
                <View style={{alignItems: 'center', width: '100%'}}>
                    <View style={{ height: 3, width: 150, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                </View>
                <RadioGroup
                    containerStyle={{alignItems: 'flex-start'}}
                    radioButtons={radioButtons}
                    onPress={setNewTheme}
                    selectedId={selectedTheme}
                    labelStyle={{color: colors.text}}
                />
            </Modal>
        </ScrollView>
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