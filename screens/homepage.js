import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { database } from '../utils/database';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function Homepage(props) {
    const [publications, setPublications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadAllPublish();
    }, [])

    function loadAllPublish() {
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef, orderBy('date', 'desc'));

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            setPublications(
                QuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    body: doc.data().body,
                    urlImage: doc.data().urlImage,
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

    // function test() {
    //     return 12;
    // }

    function loadAllUsers() {
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef, orderBy('date', 'desc'));

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            setPublications(
                QuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    body: doc.data().body,
                    urlImage: doc.data().urlImage,
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

    const goNewPublish = async () => {
        props.navigation.navigate('NewPublication')
    }

    return (
        <ScrollView style={styles.father} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.header_row}>
                        <TouchableOpacity>
                            <MaterialCommunityIcons style={styles.menuButton} name='menu' />
                        </TouchableOpacity>
                        <Text style={styles.title}>Pagina principal</Text>
                        <Image style={styles.avatar} source={require('../assets/avatar-default.png')} />
                    </View>

                    <View style={styles.header_row}>
                        <TouchableOpacity style={styles.new_publication_zone} onPress={goNewPublish}>
                            <View style={styles.new_publication}>
                                <Text style={styles.new_publication_label}>Publica lo que estas pensando</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.new_publication_button}>
                            <MaterialCommunityIcons style={styles.menuButton2} name='camera' />
                        </View>
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