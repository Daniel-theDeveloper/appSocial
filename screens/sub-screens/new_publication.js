import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { database } from '../../utils/database';
import { collection, addDoc } from 'firebase/firestore';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function new_publication(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        comments: 0,
        comments_container: [],
        date: new Date(),
        likes: 0,
        shares: 0,
        user: 'DanielDeveloper'
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

    const goBackAgain = async () => {
        props.navigation.goBack()
    }

    const sharePublish = async () => {
        await addDoc(collection(database, 'publications'), newPublication);
        goBackAgain();
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
                <View style={styles.new_publication}>
                    <TextInput
                        placeholder='Escribe lo que piensas'
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        style={styles.input}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />
                </View>
                <Text style={styles.text_image}>Ninguna imagen seleccionada</Text>
                <View style={styles.publish_footer}>
                    <View style={styles.insert_button}>
                        <View style={styles.insert_row}>
                            <MaterialCommunityIcons style={styles.insert_label} name='plus' />
                            <Text style={styles.insert_label}>Insertar</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={sharePublish}>
                        <View style={styles.publish_button}>
                            <Text style={styles.publish_label}>Publicar</Text>
                        </View>
                    </TouchableOpacity>
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
        backgroundColor: "#E3E3E3"
    },
    content: {
        padding: 10,
        backgroundColor: "white",
        borderRadius: 15
    },
    header: {
        flexDirection: "row",
        alignItems: "center"
    },
    back_button: {
        fontSize: 45
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 13
    },
    new_publication: {
        padding: 10,
        borderWidth: 1.5,
        borderRadius: 10,
        outlineColor: "#523009",
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    input: {
        fontSize: 18,
        color: '#141442',
        height: "78%",
        textAlignVertical: "top",
    },
    text_image: {
        fontSize: 18,
        color: "#434c5a",
        marginTop: 10
    },
    publish_footer: {
        flexDirection: "row",
        marginVertical: 15,
        justifyContent: "space-between"
    },
    insert_button: {
        backgroundColor: "blue",
        padding: 12,
        borderRadius: 15
    },
    insert_row: {
        flexDirection: "row",
        alignItems: "baseline"
    },
    insert_label: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold"
    },
    publish_button: {
        backgroundColor: "#00cc00",
        padding: 12,
        borderRadius: 15
    },
    publish_label: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold"
    }
})