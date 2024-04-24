import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { publication_selected } from '../components/Publish';
import { localUserLogin } from '../../utils/localstorage';
import { publicationData } from '../components/Publish';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { database } from '../../utils/database';

export default function FastComment(props) {
    const [avatarURL] = useState(publication_selected.avatar);
    const [myAvatarURL] = useState(localUserLogin.avatar);

    const [myComment, setMyComment] = useState("");
    const [loadingButton, setLoadingButton] = useState(false);

    const sendMyComment = async () => {
        if (myComment !== "") {
            setLoadingButton(true);
            const commentArray = {
                comment_answers: [],
                date: new Date(),
                dislikes: [],
                likes: [],
                message: myComment,
                user: localUserLogin.username
            }
            try {
                const docRef = doc(database, 'publications', publicationData.id);
                await updateDoc(docRef, {
                    comments_container: arrayUnion(commentArray)
                });
                setLoadingButton(false);
                props.navigation.goBack();
            } catch (error) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            console.log("Escribe algo")
        }
    }

    function goBackAgain() {
        props.navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goBackAgain}>
                <View style={styles.back_block}>
                    <MaterialCommunityIcons style={styles.back_button} name='chevron-left' />
                    <Text style={styles.back_label}>Regresar</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.comment_publication}>
                {/* header */}
                <View style={styles.perfil_header}>
                    <Image style={styles.avatar} source={ avatarURL != null ? { uri: avatarURL } : require('../../assets/avatar-default.png')} />
                    <View style={styles.perfil_usernames_container}>
                        <Text style={styles.username}>{publication_selected.user} comentó</Text>
                        <Text style={styles.date}>{convertDate(publication_selected.date)}</Text>
                    </View>
                </View>

                {/* body */}
                <Text style={styles.publication_text}>{publication_selected.body}</Text>

                {/* footer */}
                <View style={styles.statistics}>
                    <View style={styles.statistics_block}>
                        <Text style={styles.statistics_num}>{publication_selected.likes}</Text>
                        <Text style={styles.statistics_label}>Likes</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.comment_principal_title}>Comentar</Text>

            <View style={styles.comment_publication}>
                <View style={styles.reply_row}>
                    <Image style={styles.avatar} source={myAvatarURL != null ? {uri: myAvatarURL} : require('../../assets/avatar-default.png')} />
                    <Text style={styles.username2}>{localUserLogin.nickname}</Text>
                </View>

                <View style={styles.new_comment_input_block}>
                    <TextInput
                        style={styles.new_comment_input}
                        placeholder='Escribe un comentario'
                        placeholderTextColor="#ed007e"
                        multiline={true}
                        autoFocus={true}
                        onChangeText={(text) => setMyComment(text)}
                        maxLength={200} />
                </View>

                <View style={styles.reply_row2}>
                    <Text style={styles.statistics_label}>{myComment.length} / 200</Text>
                    {loadingButton ?
                        <View style={styles.loading_Button}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.loading_Button_label}>Comentando</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sendMyComment}>
                            <View style={styles.new_comment_button}>
                                <Text style={styles.new_comment_label}>Comentar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016",
        paddingBottom: 40,
        paddingHorizontal: 12
    },
    back_block: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    back_label: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    back_button: {
        fontSize: 50,
        color: "#4CC9F0"
    },
    comment_publication: {
        backgroundColor: "#550038",
        padding: 18,
        borderRadius: 20
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
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
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    username2: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    date: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#235d6f"
    },
    publication_text: {
        fontSize: 18,
        marginBottom: 15,
        color: "white"
    },
    statistics: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statistics_block: {
        flexDirection: "row"
    },
    statistics_num: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ed007e"
    },
    statistics_label: {
        fontSize: 16,
        marginLeft: 5,
        color: "#ed007e"
    },
    reply_row: {
        flexDirection: "row"
    },
    comment_principal_title: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 20,
        color: "#ed007e"
    },
    new_comment_input_block: {
        backgroundColor: "#220014",
        marginVertical: 10,
        minHeight: 100,
        maxHeight: 300,
        borderRadius: 10,
        padding: 5
    },
    new_comment_input: {
        fontSize: 17,
        color: "white"
    },
    reply_row2: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    new_comment_button: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#2f8dff"
    },
    loading_Button: {
        flexDirection: "row",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#16457e"
    },
    new_comment_label: {
        fontSize: 16,
        marginHorizontal: 15,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loading_Button_label: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loadingSpinner: {
        marginRight: 10
    },
})