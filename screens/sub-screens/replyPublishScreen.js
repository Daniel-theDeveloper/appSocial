import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';

import { database } from '../../utils/database';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import RadioGroup from 'react-native-radio-buttons-group';

import { localUserLogin } from '../../utils/localstorage';
import ReplyPublish from '../components/replyPublish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from 'react-native-vector-icons/Ionicons';

import Modal from 'react-native-modalbox';

// import Modal from 'react-native-modalbox';
// import EmojiSelector from 'react-native-emoji-selector';
import { sendNotification } from '../../utils/interations';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

export default function ReplyPublishScreen(props) {
    const [newPublication, setNewPublication] = React.useState({
        body: '',
        urlImages: null,
        comments_container: [],
        replyID: props.route.params?.id,
        date: new Date(),
        likes: [],
        shares: [],
        status: 3,
        userId: localUserLogin.id,
        author: null
    });
    const [loading_Button, setLoading_Button] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    // const [emojiModal, setEmojiModal] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: t('private'),
            value: 1,
            color: colors.primary
        },
        {
            id: 2,
            label: t('privateFollowers'),
            value: 2,
            color: colors.primary
        },
        {
            id: 3,
            label: t('public'),
            value: 3,
            color: colors.primary
        }
    ]), []);

    useEffect(() => {
            try {
                const userRef = doc(database, 'users', localUserLogin.id);
                setNewPublication({...newPublication, author: userRef});
            } catch (error) {
                console.error(error);
                Alert.alert(t('serverErrorTitle'), t('serverError'));
                props.navigation.goBack();
            }
        }, []);

    const showAlert = () =>
        Alert.alert(
            t('exitNewPublishTitle'),
            t('exitNewPublish'),
            [
                {
                    text: t('continueCreating'),
                },
                {
                    text: t('exitButton'),
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
                console.error("publicación vacía");
            }
        } catch (error) {
            setLoading_Button(false);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            console.error(error);
        }
    }

    const setShare = async () => {
        const docRef = doc(database, 'publications', props.route.params?.id);
        await updateDoc(docRef, {
            shares: arrayUnion(localUserLogin.id)
        });
    }

    // function openEmojiModal() {
    //     if (emojiModal) {
    //         setEmojiModal(false);
    //     } else {
    //         setEmojiModal(true);
    //     }
    // }

    function goBackAgain() {
        props.navigation.goBack();
    }

    function setSelectStatus(e) {
        setNewPublication({ ...newPublication, status: e });
    }

    function openStatusModal() {
        if (statusModal) {
            setStatusModal(false);
        } else {
            setStatusModal(true);
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, paddingBottom: 50, paddingHorizontal: 20, backgroundColor: colors.background }}>
            <TouchableOpacity style={styles.back_button_block} onPress={showAlert}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 25, fontWeight: "bold", color: colors.text }}>{t('exitButton')}</Text>
            </TouchableOpacity>

            <View style={{ padding: 10, backgroundColor: colors.primary_dark, borderRadius: 15 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 8, color: colors.text }}>{t('reply')}</Text>

                <View style={styles.publish_buttons}>
                    {/* <TouchableOpacity onPress={openEmojiModal}>
                        <MaterialCommunityIcons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name='emoticon-happy' />
                    </TouchableOpacity> */}

                    <TouchableOpacity onPress={openStatusModal}>
                        <Ionicons style={{ marginRight: 15, color: colors.secondary, fontSize: 26, fontWeight: "bold" }} name={newPublication.status == 1 ? 'eye-off' : newPublication.status == 2 ? 'people' : newPublication.status == 3 || newPublication.status == 4 ? 'earth' : 'alert-sharp'} />
                    </TouchableOpacity>

                    {loading_Button ?
                        <View style={{ flexDirection: "row", backgroundColor: colors.secondary_dark, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>{t('publishing')}</Text>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, marginRight: 10, color: colors.primary }}>{newPublication.body.length} / 500</Text>
                            <TouchableOpacity onPress={sharePublish}>
                                <View style={{ backgroundColor: colors.secondary, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10 }}>
                                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>{t('publish')}</Text>
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
                        placeholder={t('createRespond')}
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
            {/* <Modal style={{alignItems: "center", padding: 20, height: 500, borderTopRightRadius: 40, borderTopLeftRadius: 40, backgroundColor: colors.primary_dark}} position={"bottom"} isOpen={emojiModal} onClosed={openEmojiModal}>
                <View style={{height: 3, width: 50, borderRadius: 5, marginBottom: 30, backgroundColor: colors.primary}}></View>
                <EmojiSelector columns={8} onEmojiSelected={emoji => setNewPublication({ ...newPublication, body: newPublication.body + emoji })} />
            </Modal> */}
            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 175,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={statusModal} onClosed={openStatusModal} coverScreen={true}>
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{t('visibility')}</Text>
                </View>
                {props.route.params?.isEdit ?
                    // <RadioGroup
                    //     containerStyle={{ alignItems: 'flex-start' }}
                    //     radioButtons={radioButtonsEditPublish}
                    //     onPress={setSelectStatus}
                    //     selectedId={newPublication.status}
                    //     labelStyle={{ color: colors.text, fontSize: 16 }}
                    // />
                    <View></View>
                    :
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start' }}
                        radioButtons={radioButtons}
                        onPress={setSelectStatus}
                        selectedId={newPublication.status}
                        labelStyle={{ color: colors.text, fontSize: 16 }}
                    />
                }
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