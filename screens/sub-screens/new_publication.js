import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { database } from '../../utils/database';
import { collection, addDoc } from 'firebase/firestore';
import { globalUsername } from '../../utils/localstorage';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function New_publication(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        comments: 0,
        comments_container: [],
        date: new Date(),
        likes: 0,
        shares: 0,
        user: globalUsername
    })

    const showAlert = () =>
        Alert.alert(
            'Salir de la publicacion',
            '¿Desea salirse de la publicacion sin guardar ni publicar nada?',
            [
                {
                    text: 'Continuar creando',
                },
                {
                    text: 'Salirse',
                    onPress: () => goBackAgain(),
                    style: 'cancel',
                },
            ],
        );

    const isEmpty = () =>
        Alert.alert(
            'Publicacion vacia',
            'Esta publicacion esta vacia',
            [
                {
                    text: 'OK',
                }
            ]
        );

    const goBackAgain = async () => {
        props.navigation.goBack()
    }

    const sharePublish = async () => {
        try {
            if (newPublication.body != '') {
                await addDoc(collection(database, 'publications'), newPublication);
                goBackAgain();
            } else {
                isEmpty();
            }
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={showAlert}>
                        <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nueva publicacion</Text>
                </View>

                <View style={styles.publish_buttons}>
                    <View style={styles.insert_button}>
                        <View style={styles.insert_row}>
                            <MaterialCommunityIcons style={styles.insert_label} name='plus' />
                            <Text style={styles.insert_label}>Insertar</Text>
                        </View>
                    </View>

                    <View style={styles.insert_extra_button}>
                        <MaterialCommunityIcons style={styles.insert_label} name='emoticon-happy-outline' />
                    </View>

                    <View style={styles.insert_extra_button}>
                        <MaterialCommunityIcons style={styles.insert_label} name='map-marker' />
                    </View>

                    <TouchableOpacity onPress={sharePublish}>
                        <View style={styles.publish_button}>
                            <Text style={styles.publish_label}>Publicar</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.new_publication}>
                    <TextInput
                        placeholder='Escribe lo que piensas'
                        placeholderTextColor="#c50056"
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        style={styles.input}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />
                </View>
                <View style={styles.multimedia_block}>
                    <MaterialCommunityIcons style={styles.icon_media_status} name='map-marker-off' />
                    {/* <MaterialCommunityIcons style={styles.icon_media_status} name='map-marker-check' /> */}
                    <Text style={styles.text_media_status}>Ninguna ubicacion seleccionada</Text>
                </View>
                <View style={styles.multimedia_block}>
                    <MaterialCommunityIcons style={styles.icon_media_status} name='file-image-remove' />
                    <Text style={styles.text_media_status}>Ninguna imagen seleccionada</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        paddingVertical: 50,
        paddingHorizontal: 20,
        backgroundColor: "#210016"
    },
    content: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
    },
    header: {
        flexDirection: "row",
        alignItems: "center"
    },
    back_button: {
        fontSize: 45,
        color: "white"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 13,
        color: "white"
    },
    new_publication: {
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
        minHeight: 250,
        textAlignVertical: "top",
    },
    publish_buttons: {
        flexDirection: "row",
        marginVertical: 15,
        justifyContent: "space-between"
    },
    insert_button: {
        padding: 12,
        borderRadius: 15,
        outlineStyle: "solid",
        outlineWidth: 4,
        borderColor: "#4CC9F0",
        borderWidth: 2,
    },
    insert_extra_button: {
        padding: 12,
        borderRadius: 15,
        outlineStyle: "solid",
        outlineWidth: 4,
        borderColor: "#4CC9F0",
        borderWidth: 2,
    },
    insert_row: {
        flexDirection: "row",
        alignItems: "baseline"
    },
    insert_label: {
        color: "#4CC9F0",
        fontSize: 18,
        fontWeight: "bold"
    },
    publish_button: {
        backgroundColor: "#4CC9F0",
        padding: 12,
        borderRadius: 15
    },
    publish_label: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold"
    },
    multimedia_block: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 5
    },
    text_media_status: {
        fontSize: 18,
        color: "#ff0070",
        marginTop: 10
    },
    icon_media_status: {
        fontSize: 18,
        color: "#ff0070",
        marginTop: 10,
        marginRight: 10
    },
})