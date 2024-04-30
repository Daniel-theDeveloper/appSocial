import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { database } from '../utils/database';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { userId } from './components/Publish';
import { new_publication_params } from './sub-screens/new_publication';

import * as ImagePicker from 'expo-image-picker';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { localUserLogin, erase_all } from '../utils/localstorage';

export default function Homepage(props) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myAvatar, setMyAvatar] = useState(null);

    useEffect(() => {
        setMyAvatar(localUserLogin.avatar);
        loadAllPublish();
    }, []);

    const alertLogOut = () =>
        Alert.alert(
            'Salirse de la plaaforma',
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
            if (image.canceled) {
                // Nothing
            } else {
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
                    name: doc.data().user,
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
        await erase_all();
        props.navigation.navigate('Login');
    }

    function goNewPublish() {
        if (localUserLogin.id != undefined) {
            new_publication_params.isFhoto = false;
            new_publication_params.photoURI = null;
            new_publication_params.photoName  = null;
            
            props.navigation.navigate('NewPublication');
        } else {
            Alert.alert("Sin conexion a internet", "Por favor, reinicie la aplicacion");
        }
    }

    function goMyPerfil() {
        userId.id = localUserLogin.username;
        props.navigation.navigate('Perfil');
    }

    return (
        <ScrollView style={styles.father} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.header_row}>
                        <TouchableOpacity onPress={alertLogOut}>
                            <MaterialCommunityIcons style={styles.menuButton} name='logout' />
                        </TouchableOpacity>
                        <Text style={styles.title}>Pagina principal</Text>
                        <TouchableOpacity onPress={goMyPerfil}>
                            <Image style={styles.avatar} source={myAvatar != null ? { uri: myAvatar } : require('../assets/avatar-default.png')} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.header_row}>
                        <TouchableOpacity style={styles.new_publication_zone} onPress={goNewPublish}>
                            <View style={styles.new_publication}>
                                <Text style={styles.new_publication_label}>Publica lo que estas pensando</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePhoto}>
                            <View style={styles.new_publication_button}>
                                <MaterialCommunityIcons style={styles.menuButton2} name='camera' />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ?
                    <View style={loadingStyle.container}>
                        <View style={loadingStyle.perfil_header}>
                            <View style={loadingStyle.avatar}></View>
                            <View style={loadingStyle.perfil_usernames_container}>
                                <View style={loadingStyle.username}></View>
                                <View style={loadingStyle.date}></View>
                            </View>
                        </View>

                        <View style={loadingStyle.publication_container}></View>
                        <View style={loadingStyle.perfil_header}>
                            <View style={loadingStyle.avatar}></View>
                            <View style={loadingStyle.perfil_usernames_container}>
                                <View style={loadingStyle.username}></View>
                                <View style={loadingStyle.date}></View>
                            </View>
                        </View>

                        <View style={loadingStyle.publication_container}></View>
                        <View style={loadingStyle.perfil_header}>
                            <View style={loadingStyle.avatar}></View>
                            <View style={loadingStyle.perfil_usernames_container}>
                                <View style={loadingStyle.username}></View>
                                <View style={loadingStyle.date}></View>
                            </View>
                        </View>

                        <View style={loadingStyle.publication_container}></View>
                        <View style={loadingStyle.perfil_header}>
                            <View style={loadingStyle.avatar}></View>
                            <View style={loadingStyle.perfil_usernames_container}>
                                <View style={loadingStyle.username}></View>
                                <View style={loadingStyle.date}></View>
                            </View>
                        </View>

                        <View style={loadingStyle.publication_container}></View>
                    </View>
                    :
                    <View style={loadingStyle.publications_colections}>
                        {publications.map(publication => <Publication key={publication.id} props={props} {...publication} />)}
                    </View>
                }
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    father: {
        backgroundColor: "#210016"
    },
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016"
    },
    header: {
        flexDirection: "column",
        backgroundColor: "#550038",
        // paddingTop: 32,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10
    },
    header_row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8
    },
    menuButton: {
        fontSize: 40,
        color: "white"
    },
    menuButton2: {
        fontSize: 30,
        color: "#550038",
    },
    new_publication: {
        padding: 10,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 4,
    },
    new_publication_zone: {
        width: "82%"
    },
    new_publication_label: {
        fontSize: 17,
        padding: 2,
        color: "white"
    },
    new_publication_button: {
        backgroundColor: "#ff0070",
        padding: 11,
        borderRadius: 15
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white"
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
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100,
        backgroundColor: "#48002a"
    },
    perfil_header: {
        flexDirection: "row",
        marginBottom: 10
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    username: {
        height: 18,
        width: 150,
        backgroundColor: "#48002a",
        marginBottom: 10,
        borderRadius: 5
    },
    date: {
        height: 18,
        width: 150,
        borderRadius: 5,
        backgroundColor: "#48002a"
    },
    publication_container: {
        padding: 10,
        height: 120,
        backgroundColor: "#48002a",
        borderRadius: 15,
        marginBottom: 20
    },
    publications_colections: {
        marginHorizontal: 15
    }
})