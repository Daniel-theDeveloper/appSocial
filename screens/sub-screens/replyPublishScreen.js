import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';

import { database } from '../../utils/database';
import { collection, addDoc, doc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

import { localUserLogin } from '../../utils/localstorage';
import ReplyPublish from '../components/replyPublish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from 'react-native-modalbox';
import EmojiSelector from 'react-native-emoji-selector';
import { sendNotification } from '../../utils/interations';

export default function ReplyPublishScreen(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        urlImage: null,
        comments_container: [],
        replyID: props.route.params?.id,
        date: new Date(),
        likes: [],
        shares: [],
        userId: localUserLogin.id
    });
    const [loading_Button, setLoading_Button] = useState(false);
    const [emojiModal, setEmojiModal] = useState(false);

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

    const sharePublish = async () => {
        setLoading_Button(true);
        try {
            if (newPublication.body != '') {
                await addDoc(collection(database, 'publications'), newPublication);
                await setShare();
                if (props.route.params?.userIdSend !== localUserLogin.id) {
                    await sendNotification('reply_p', props.route.params?.userIdSend, props.route.params?.id, newPublication.body);
                }
                setLoading_Button(false);
                goBackAgain();
            } else {
                setLoading_Button(false);
                Alert.alert("Publicacion vacia", "Por favor escribe algo");
            }
        } catch (error) {
            setLoading_Button(false);
            Alert.alert("Error del servidor", "Por favor, vuelve a intentarlo");
            console.error(error);
        }
    }

    const setShare = async () => {
        const docRef = doc(database, 'publications', props.route.params?.id);
        await updateDoc(docRef, {
            shares: arrayUnion(localUserLogin.id)
        });
    }

    function openEmojiModal() {
        if (emojiModal) {
            setEmojiModal(false);
        } else {
            setEmojiModal(true);
        }
    }

    function goBackAgain() {
        props.navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back_button_block} onPress={showAlert}>
                <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                <Text style={styles.back_button_label}>Salirse</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Responder</Text>

                <View style={styles.publish_buttons}>
                    <TouchableOpacity onPress={openEmojiModal}>
                        <MaterialCommunityIcons style={styles.insert_label} name='emoticon-happy' />
                    </TouchableOpacity>
                    {loading_Button ?
                        <View style={styles.publish_loading_button}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.publish_label}>Publicando</Text>
                        </View>
                        :
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.statistics_label}>{newPublication.body.length} / 500</Text>
                            <TouchableOpacity onPress={sharePublish}>
                                <View style={styles.publish_button}>
                                    <Text style={styles.publish_label}>Publicar</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <View style={styles.line}></View>

                <View style={styles.new_publication}>
                    <TextInput
                        placeholder='Escribe tu respuesta'
                        placeholderTextColor="#c50056"
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        value={newPublication.body}
                        style={styles.input}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />
                    <ReplyPublish props={props} replyID={props.route.params?.id} />
                </View>
            </View>
            <Modal style={styles.modal} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={styles.modalLine}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setNewPublication({ ...newPublication, body: newPublication.body + emoji })} />
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        paddingBottom: 50,
        paddingHorizontal: 20,
        backgroundColor: "#210016"
    },
    content: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
    },
    back_button_block: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15
    },
    back_button_label: {
        fontSize: 25,
        fontWeight: "bold",
        color: "white"
    },
    back_button: {
        fontSize: 45,
        color: "white"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 8,
        color: "white"
    },
    publish_buttons: {
        flexDirection: "row",
        marginVertical: 8,
        justifyContent: "space-between",
        alignItems: "center"
    },
    insert_label: {
        marginRight: 15,
        color: "#4CC9F0",
        fontSize: 26,
        fontWeight: "bold"
    },
    publish_button: {
        backgroundColor: "#4CC9F0",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10
    },
    publish_loading_button: {
        flexDirection: "row",
        backgroundColor: "#235d6f",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10
    },
    loadingSpinner: {
        marginRight: 10
    },
    publish_label: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    },
    statistics_label: {
        fontSize: 16,
        marginRight: 10,
        color: "#ed007e"
    },
    line: {
        width: "100%",
        height: 2,
        backgroundColor: "#4cc9f0",
        marginBottom: 10
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
        minHeight: 100,
        textAlignVertical: "top",
    },
    modal: {
        alignItems: "center",
        padding: 20,
        height: 500,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: "#550038"
    },
    modalLine: {
        height: 3,
        width: 50,
        borderRadius: 5,
        marginBottom: 30,
        backgroundColor: "#e40068",
    },
});