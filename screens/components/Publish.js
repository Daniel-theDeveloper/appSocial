import * as react from 'react';
import * as RN from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { convertDate } from '../../utils/convertDate';

export let publicationArray = {
    id: "",
    body: "",
    comments: 0,
    date: "",
    likes: 0,
    shares: 0,
    name: "",
}

export default function Publication({
    props,
    id,
    body,
    comments,
    date,
    likes,
    shares,
    name,
}) {
    const goDetails = async () => {
        publicationArray = {
            id: id,
            body: body,
            comments: comments,
            date: date,
            likes: likes,
            shares: shares,
            name: name,
        }
        props.navigation.navigate('Details')
    }

    return (
        <View style={styles.container}>
            <View style={styles.perfil_header}>
                <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                <View style={styles.perfil_usernames_container}>
                    <Text style={styles.username}>{name}</Text>
                    <Text style={styles.date}>{convertDate(date.seconds)}</Text>
                </View>
            </View>

            <View style={styles.publication_container}>
                <TouchableOpacity onPress={goDetails}>
                    <Text style={styles.publication_text}>{body}</Text>
                    {/* <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} /> */}
                </TouchableOpacity>

                <View style={styles.interact_container}>

                    {/* Area de likes */}
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='star-outline' />
                        <Text style={styles.interact_label}>{likes}</Text>
                    </View>
                    {/* <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interacted_like_icon} name='star' />
                        <Text style={styles.interacted_like_label}>{likes}</Text>
                    </View> */}

                    {/* Area de comentarios */}
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='message-outline' />
                        <Text style={styles.interact_label}>{comments}</Text>
                    </View>
                    {/* <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interacted_comment_icon} name='message' />
                        <Text style={styles.interacted_comment_label}>{comments}</Text>
                    </View> */}

                    {/* Area de compartir */}
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                        <Text style={styles.interact_label}>{shares}</Text>
                    </View>
                    {/* <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interacted_shared_icon} name='repeat-variant' />
                        <Text style={styles.interacted_shared_label}>{shares}</Text>
                    </View> */}
                    <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='book-outline' />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 15
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
    date: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#235d6f"
    },
    publication_container: {
        padding: 10,
        backgroundColor: "#550038",
        borderRadius: 15
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
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
    },
    interact_icon: {
        fontSize: 23,
        color: "#a6006a"
    },
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
    },
    interact_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#a6006a"
    },
    interacted_like_icon: {
        fontSize: 23,
        color: "#ffe400"
    },
    interacted_like_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#ffe400"
    },
    interacted_comment_icon: {
        fontSize: 23,
        color: "#46b0d5"
    },
    interacted_comment_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#46b0d5"
    },
    interacted_shared_icon: {
        fontSize: 23,
        color: "#afff53"
    },
    interacted_shared_label: {
        fontSize: 14,
        marginLeft: 5,
        fontWeight: "bold",
        color: "#afff53"
    }
})