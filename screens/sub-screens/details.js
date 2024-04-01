import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { isWasInteracted } from '../../utils/interations';
import { globalUsername } from '../../utils/localstorage';
import { publicationId } from '../components/Publish';
import Comment from '../components/Comment';
// import { compareDesc } from "date-fns";

import { doc, updateDoc, arrayUnion, collection, onSnapshot, query } from 'firebase/firestore'
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function Details(props) {
    const [publicationArray, setPublicationArray] = useState({
        id: "",
        body: "",
        name: "",
        comments: "",
        comments_container: [],
        date: "",
        likes: [],
        shares: 0
    });
    const [loadingButton, setLoadingButton] = useState((false));

    const [allLikes, setAllLikes] = useState(0)
    const [allComments, setAllComments] = useState(0);

    const [isLike, setIsLike] = useState((false));
    const [isShared, setIsShared] = useState((false));
    const [isSaved, setIsSaved] = useState((false));

    const [myComment, setMyCommnent] = useState("");

    // const orderComments = publicationArray.comments_container.sort(function(a, b) {
    //     return compareDesc(a.date, b.date);
    // })

    useEffect(() => {
        let data = []
        let getData = []
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef);

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            QuerySnapshot.docs.map(doc => {
                data.push({ id: doc.id, data: doc.data() });
            })
            data.find(function (res) {
                if (res.id === publicationId.id) {
                    getData = {
                        id: res.id,
                        body: res.data['body'],
                        name: res.data['user'],
                        comments: res.data['comments'],
                        comments_container: res.data['comments_container'],
                        date: res.data['date'],
                        likes: res.data['likes'],
                        shares: res.data['shares']
                    }
                }
            })
            setAllLikes(getData.likes.length)
            setAllComments(getData.comments_container.length)
            setIsLike(isWasInteracted(getData.likes));
            setPublicationArray(getData)
        })
        return unsuscribe;
    }, [])

    const setLike = async () => {
        if (isLike) {
            // Show a list like person
        } else {
            try {
                const docRef = doc(database, 'publications', publicationArray.id);
                await updateDoc(docRef, {
                    likes: arrayUnion(globalUsername)
                });
                setIsLike(true);
            } catch (error) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
            }
        }
    }

    const setShared = async () => {
        if (isShared) {
            setIsShared(false)
        } else {
            setIsShared(true)
        }
    }

    const sendMyComment = async () => {
        if (myComment !== "") {
            setLoadingButton(true);
            const commentArray = {
                comment_answers: [],
                date: new Date(),
                dislikes: [],
                likes: [],
                message: myComment,
                user: globalUsername
            }
            try {
                const docRef = doc(database, 'publications', publicationArray.id);
                await updateDoc(docRef, {
                    comments_container: arrayUnion(commentArray)
                });
                setMyCommnent("");
                setLoadingButton(false);
            } catch (error) {
                Alert.alert("Algo salio mal", "Por favor, vuelve a intentarlo")
                console.error(error);
                setLoadingButton(false);
            }
        } else {
            console.log("Escribe algo")
        }
    }

    return (
        <ScrollView style={styles.father} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <View style={styles.publication}>

                    {/* Encabezado de la publicacion */}
                    <View style={styles.perfil_header}>
                        <View style={styles.perfil_user}>
                            <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                            <View style={styles.perfil_usernames_container}>
                                <Text style={styles.username}>{publicationArray.name} publicó</Text>
                                <Text style={styles.date}>{convertDate(publicationArray.date)}</Text>
                            </View>
                        </View>
                        <View style={styles.follow_button}>
                            <Text style={styles.follow_label}>Seguir</Text>
                        </View>
                    </View>

                    {/* Cuerpo de la publicacion */}
                    <Text style={styles.publication_text}>{publicationArray.body}</Text>
                    {/* <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} /> */}

                    {/* Zona de estadisticas */}
                    <View style={styles.statistics}>
                        <View style={styles.statistics_block}>
                            <Text style={styles.statistics_num}>{allComments}</Text>
                            <Text style={styles.statistics_label}>Comentarios</Text>
                        </View>
                        <Text style={styles.statistics_separator}>|</Text>
                        <View style={styles.statistics_block}>
                            <Text style={styles.statistics_num}>{allLikes}</Text>
                            <Text style={styles.statistics_label}>Likes</Text>
                        </View>
                    </View>
                    {/* Zona de interaccion */}
                    <View style={styles.interact_container}>
                        <TouchableOpacity onPress={setLike}>
                            {isLike ?
                                <MaterialCommunityIcons style={styles.interacted_icon_like} name='star' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='star-outline' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={setShared}>
                            {isShared ?
                                <MaterialCommunityIcons style={styles.interacted_icon_shared} name='repeat-variant' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                            }
                        </TouchableOpacity>

                        <TouchableOpacity>
                            {isSaved ?
                                <MaterialCommunityIcons style={styles.interacted_icon_shared} name='book' />
                                :
                                <MaterialCommunityIcons style={styles.interact_icon} name='book-outline' />
                            }
                        </TouchableOpacity>


                        <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                        <MaterialCommunityIcons style={styles.interact_icon} name='chevron-down' />
                    </View>
                </View>

                {/* Zona de comentarios */}
                <Text style={styles.comment_principal_title}>Comentarios</Text>

                <View style={styles.new_comment_container}>
                    <View style={styles.new_comment_header}>
                        <Image style={styles.comment_avatar} source={require('../../assets/avatar-default.png')} />
                        <View style={styles.new_comment_input_block}>
                            <TextInput
                                style={styles.new_comment_input}
                                placeholder='Escribe un comentario'
                                placeholderTextColor="#ed007e"
                                multiline={true}
                                onChangeText={(text) => setMyCommnent(text)}
                                maxLength={500} />
                        </View>
                    </View>

                    {loadingButton ?
                        <View style={styles.loading_comment_button}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.loading_comment_label}>Publicando</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={sendMyComment}>
                            <View style={styles.new_comment_button}>
                                <Text style={styles.new_comment_label}>Publicar</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                {publicationArray.comments_container.map((comment, key) => (<Comment key={key} props={props} {...comment} />))}
                {/* {orderComments.map((comment, key) => (<Comment key={key} props={props} {...comment} />))} */}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    father: {
        backgroundColor: "#210016"
    },
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016",
        paddingVertical: 40,
        paddingHorizontal: 12
    },
    publication: {
        backgroundColor: "#550038",
        padding: 18,
        borderRadius: 20
    },
    perfil_header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    perfil_user: {
        flexDirection: "row"
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
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
    date: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#235d6f"
    },
    follow_button: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: "#4CC9F0",
        outlineStyle: "solid",
        outlineWidth: 4,
    },
    follow_label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4CC9F0"
    },
    publication_text: {
        fontSize: 18,
        marginBottom: 15,
        color: "white"
    },
    publication_image: {
        height: 400,
        width: "100%",
        marginBottom: 15
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
    statistics_separator: {
        fontSize: 18,
        fontWeight: "bold",
        marginHorizontal: 15,
        color: "#ed007e"
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    interact_icon: {
        fontSize: 26,
        color: "#a6006a"
    },
    interacted_icon_like: {
        fontSize: 26,
        color: "#ffe400"
    },
    interacted_icon_shared: {
        fontSize: 26,
        color: "#afff53"
    },
    interact_icon_saved: {
        fontSize: 26,
        color: "#ff6c00"
    },
    comment_principal_title: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 20,
        color: "#ed007e"
    },
    new_comment_container: {
        backgroundColor: "#550038",
        padding: 15,
        borderRadius: 20,
        marginBottom: 15
    },
    new_comment_header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    new_comment_input_block: {
        backgroundColor: "#220014",
        minHeight: 50,
        maxHeight: 300,
        width: "85%",
        borderRadius: 10,
        padding: 5
    },
    new_comment_input: {
        fontSize: 16,
        color: "white"
    },
    new_comment_button: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#2f8dff"
    },
    new_comment_label: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loading_comment_button: {
        flexDirection: "row",
        justifyContent: "center",
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#16457e"
    },
    loading_comment_label: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    loadingSpinner: {
        marginRight: 10
    },
    comment_avatar: {
        height: 42,
        width: 42,
        borderRadius: 100
    },
})