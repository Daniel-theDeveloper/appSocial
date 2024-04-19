import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { database } from '../utils/database';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { localUserLogin } from '../utils/localstorage';

export default function CreatePost(props) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDescending, setIsDescending] = useState(true);
    const [orderStatus, setOrderStatus] = useState('desc');

    useEffect(() => {
        loadMyPublish();
    }, [])

    function loadMyPublish() {
        setLoading(true);
        try {
            const collectionRef = collection(database, 'publications');
            const q = query(collectionRef, where("user", "==", localUserLogin.username), orderBy('date', orderStatus));

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
                setLoading(false);
            })
            return unsuscribe;
        } catch (error) {
            setIsEmpty(true);
            setLoading(false);
            console.error(error);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde")
        }
    }

    function goNewPublish() {
        props.navigation.navigate('NewPublication')
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
        <ScrollView style={styles.container}>
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

            <Text style={styles.principal_title}>Tus publicaciones</Text>

            <View style={styles.config_block}>
                <Text style={styles.config_title}>Ordenar por:</Text>
                {isDescending ?
                    <TouchableOpacity onPress={setOrder}>
                        <View style={styles.config_button}>
                            <MaterialCommunityIcons style={styles.config_icon} name='order-bool-descending' />
                            <Text style={styles.config_option}>Mas recientes</Text>
                        </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={setOrder}>
                        <View style={styles.config_button}>
                            <MaterialCommunityIcons style={styles.config_icon} name='order-bool-ascending' />
                            <Text style={styles.config_option}>Mas antiguos</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>

            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color="#ed007e" size={80} style={styles.loading_spiner} />
                    <Text style={styles.loading_title}>Cargando publicaciones</Text>
                </View>
                :
                publications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={styles.empty_icon} name='book-open-page-variant-outline' />
                        <Text style={styles.empty_Title}>Todas tus futuras publicaciones apareceran aqui</Text>
                        <Text style={styles.empty_subtitle}>Comience creando su primer publicacion</Text>
                    </View>
                    :
                    publications.map(publication => <Publication key={publication.id} props={props} {...publication} />)
            }


        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#210016"
    },
    header_row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8
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
    menuButton2: {
        fontSize: 30,
        color: "#550038",
    },
    principal_title: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 20,
        color: "#ed007e"
    },
    config_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20
    },
    config_title: {
        color: "#4CC9F0",
        fontSize: 18,
        fontWeight: "bold"
    },
    config_icon: {
        color: "#4CC9F0",
        fontSize: 20,
        fontWeight: "bold"
    },
    config_option: {
        color: "white",
        fontSize: 15,
        marginLeft: 10
    },
    config_button: {
        flexDirection: "row",
        alignItems: "center",
        padding: 6,
        borderWidth: 2.5,
        borderRadius: 10,
        borderColor: "#4CC9F0",
        outlineStyle: "solid",
        outlineWidth: 4,
        marginLeft: 10
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
    },
    loading_title: {
        color: "#ed007e",
        fontSize: 24,
        fontWeight: "bold"
    },
    empty_icon: {
        color: "#a00055",
        fontSize: 80,
        marginBottom: 10
    },
    empty_Title: {
        color: "#ed007e",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },
    empty_subtitle: {
        color: "#a00055",
        fontSize: 18,
        textAlign: "center",
    }
})