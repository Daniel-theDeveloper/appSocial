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
import { useTheme } from '@react-navigation/native';

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

    const { colors } = useTheme();

    const showAlert = () =>
        Alert.alert(
            'Salir de la publicación',
            '¿Desea salirse de la publicación sin guardar ni publicar nada?',
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
                Alert.alert("publicación vacia", "Por favor escribe algo");
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
        <View style={{ flex: 1, flexGrow: 1, paddingBottom: 50, paddingHorizontal: 20, backgroundColor: colors.background }}>
            <TouchableOpacity style={styles.back_button_block} onPress={showAlert}>
                <MaterialCommunityIcons style={{fontSize: 45, color: colors.text}} name='chevron-left' />
                <Text style={{ fontSize: 25, fontWeight: "bold", color: colors.text }}>Salirse</Text>
            </TouchableOpacity>

            <View style={{ padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 8, color: colors.text }}>Responder</Text>

                <View style={styles.publish_buttons}>
                    <TouchableOpacity onPress={openEmojiModal}>
                        <MaterialCommunityIcons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='emoticon-happy' />
                    </TouchableOpacity>
                    {loading_Button ?
                        <View style={{ flexDirection: "row", backgroundColor: colors.secondary_dark, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>Publicando</Text>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, marginRight: 10, color: colors.primary }}>{newPublication.body.length} / 500</Text>
                            <TouchableOpacity onPress={sharePublish}>
                                <View style={{ backgroundColor: colors.secondary, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10 }}>
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>Publicar</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <View style={{ width: "100%", height: 2, backgroundColor: colors.secondary, marginBottom: 10 }}></View>

                <View style={{
                    padding: 10,
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                    borderRadius: 10,
                    outlineStyle: "solid",
                    outlineWidth: 2,
                }}>
                    <TextInput
                        placeholder='Escribe tu respuesta'
                        placeholderTextColor={colors.holderText}
                        onChangeText={(text) => setNewPublication({ ...newPublication, body: text })}
                        value={newPublication.body}
                        style={{
                            fontSize: 18,
                            color: colors.text,
                            minHeight: 100,
                            textAlignVertical: "top",
                        }}
                        autoFocus={true}
                        multiline={true}
                        maxLength={500} />
                    <ReplyPublish props={props} replyID={props.route.params?.id} />
                </View>
            </View>
            <Modal style={{alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark}} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary}}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setNewPublication({ ...newPublication, body: newPublication.body + emoji })} />
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    back_button_block: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15
    },
    publish_buttons: {
        flexDirection: "row",
        marginVertical: 8,
        justifyContent: "space-between",
        alignItems: "center"
    },
    loadingSpinner: {
        marginRight: 10
    }
});