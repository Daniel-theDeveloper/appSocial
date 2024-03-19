import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { convertDate } from '../../utils/convertDate';
import { publicationArray } from '../components/Publish';
import { isWasLiked } from '../../utils/interations';
import { globalUsername } from '../../utils/localstorage';

import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { database } from '../../utils/database';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export function isFollow() {
    const isUserFollow = false;

    function isThisUsserFollow() {
        if (isUserFollow) {
            return (
                <Text>Siguiendo</Text>
            );
        } else {
            return (
                <View style={styles.follow_button}>
                    <Text style={styles.follow_label}>Seguir</Text>
                </View>
            );
        }
    }
    return isThisUsserFollow()
}

export default function Details() {
    const FollowBlock = isFollow
    const allLikes = publicationArray.likes.length

    const [isLike, setIsLike] = useState((isWasLiked(publicationArray.likes)));
    const [isShared, setIsShared] = useState((false));
    const [isSaved, setIsSaved] = useState((false));

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
                console.error(error);
            }
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
                        <FollowBlock />
                    </View>

                    {/* Cuerpo de la publicacion */}
                    <Text style={styles.publication_text}>{publicationArray.body}</Text>
                    {/* <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} /> */}

                    {/* Zona de estadisticas */}
                    <View style={styles.statistics}>
                        <View style={styles.statistics_block}>
                            <Text style={styles.statistics_num}>{publicationArray.comments}</Text>
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

                        <TouchableOpacity>
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
                <View style={styles.comment_container}>
                    {/* Comentario principal */}
                    <View style={styles.comment_view}>

                        <View style={styles.comment_left}>
                            <Image style={styles.comment_avatar} source={require('../../assets/avatar-default.png')} />
                        </View>

                        <View style={styles.comment_right}>

                            <View style={styles.comment_header}>
                                <Text style={styles.comment_username}>USUARIO</Text>
                                <Text style={styles.comment_separator}>-</Text>
                                <Text style={styles.comment_date}>12 de marzo</Text>
                            </View>

                            <View>
                                <Text style={styles.comment}>Comentario de prueba donde se comenta lo desarrollado en la publicacion</Text>
                            </View>

                            <View style={styles.comment_footer}>
                                <View style={styles.comment_likes_block}>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-up' />
                                    <Text style={styles.comment_counter}>25</Text>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-down' />
                                </View>
                                <View style={styles.comment_responces_block}>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='message-processing' />
                                    <Text style={styles.comment_counter}>1</Text>
                                </View>
                            </View>
                            <View style={styles.comment_show_responces}>
                                <MaterialCommunityIcons style={styles.interact_icon} name='chevron-down' />
                                <Text style={styles.load_comments_label}>Cargar comentarios</Text>
                            </View>
                        </View>
                    </View>
                    {/* Area de respuestas */}
                    <View style={styles.comment_responces}>

                        <View style={styles.comment_responces_left}>
                            <Image style={styles.comment_avatar} source={require('../../assets/avatar-default.png')} />
                        </View>

                        <View style={styles.comment_responces_right}>

                            <View style={styles.comment_header}>
                                <Text style={styles.comment_username}>USUARIO</Text>
                                <Text style={styles.comment_separator}>-</Text>
                                <Text style={styles.comment_date}>12 de marzo</Text>
                            </View>

                            <View>
                                <Text style={styles.comment}>Comentario de prueba donde se responde lo desarrollado en la publicacion</Text>
                            </View>

                            <View style={styles.comment_footer}>
                                <View style={styles.comment_likes_block}>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-up' />
                                    <Text style={styles.comment_counter}>4</Text>
                                    <MaterialCommunityIcons style={styles.comment_buttons} name='thumb-down' />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
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
    comment_container: {
        backgroundColor: "#550038",
        padding: 15,
        flexDirection: "column",
        borderRadius: 20,
    },
    comment_avatar: {
        height: 42,
        width: 42,
        borderRadius: 100
    },
    comment_view: {
        flexDirection: "row"
    },
    comment_left: {
        width: "15%"
    },
    comment_right: {
        width: "85%"
    },
    comment_header: {
        flexDirection: "row"
    },
    comment_username: {
        fontWeight: "bold",
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment_separator: {
        fontWeight: "bold",
        marginHorizontal: 5,
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment_date: {
        fontSize: 17,
        color: "#4CC9F0"
    },
    comment: {
        fontSize: 15,
        marginVertical: 8,
        color: 'white'
    },
    comment_footer: {
        flexDirection: "row",
        marginVertical: 5,
    },
    comment_buttons: {
        fontSize: 20,
        color: "#a6006a"
    },
    comment_counter: {
        fontSize: 15,
        fontWeight: "bold",
        marginHorizontal: 8,
        color: "#e8007c"
    },
    comment_likes_block: {
        flexDirection: "row"
    },
    comment_responces: {
        flexDirection: "row",
    },
    comment_responces_block: {
        flexDirection: "row",
        marginLeft: 30,
    },
    comment_show_responces: {
        flexDirection: "row",
        marginVertical: 10
    },
    comment_responces_left: {
        width: "25%",
        padding: 20
    },
    comment_responces_right: {
        width: "75%"
    },
    load_comments_label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#e8007c"
    }
})