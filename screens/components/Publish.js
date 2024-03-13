import * as react from 'react';
import * as RN from 'react-native';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

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
    const goDetails = async() => {
        props.navigation.navigate('Details')
    }

    function convertDate(date) {
        const dateConverted = new Date(date * 1000);
        const dateString = dateConverted.toString();
        const d = dateString.split(' ');
        const finalDate = d[2] + " de " + d[1];
        
        // console.log(d);
        // console.log(d[2] + " de " + d[1])
        return finalDate;
    }

    return (
        <View>
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
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='star' />
                        <Text style={styles.interact_label}>{likes}</Text>
                    </View>
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='message' />
                        <Text style={styles.interact_label}>{comments}</Text>
                    </View>
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                        <Text style={styles.interact_label}>{shares}</Text>
                    </View>
                    <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='book' />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
    },
    perfil_header: {
        flexDirection: "row",
        margin: 15
    },
    perfil_usernames_container: {
        flexDirection: "column",
        marginLeft: 10
    },
    username: {
        fontSize: 18,
        fontWeight: "bold"
    },
    date: {
        fontSize: 14
    },
    publication_container: {
        marginLeft: 15,
        marginRight: 15,
        padding: 10,
        backgroundColor: "white",
        borderRadius: 15
    },
    publication_text: {
        fontSize: 18,
        marginBottom: 15
    },
    publication_image: {
        height: 400,
        width: "100%",
        marginBottom: 15
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
    },
    interact_icon: {
        fontSize: 26,
        color: "#3c434f"
    },
    interact_block: {
        flexDirection: "row",
        alignItems: "center"
    },
    interact_label: {
        fontSize: 14,
        marginLeft: 5
    }
})