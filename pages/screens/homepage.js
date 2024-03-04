import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function homepage() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <MaterialCommunityIcons style={styles.menuButton} name='menu' />
                </TouchableOpacity>
                <Text style={styles.title}>Pagina principal</Text>
                <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
            </View>
            
            <View style={styles.perfil_header}>
                <Image style={styles.avatar} source={require('../../assets/avatar-default.png')} />
                <View style={styles.perfil_usernames_container}>
                    <Text style={styles.username}>USUARIO</Text>
                    <Text style={styles.date}>10 de marzo</Text>
                </View>
            </View>

            <View style={styles.publication_container}>
                <Text style={styles.publication_text}>Publicacion de prueba donde el usuario expresa su pensamiento sobre las cosas que ocurren en la vida misma, tambien llamadas como experiencias</Text>
                <Image style={styles.publication_image} source={require('../../assets/publicationTest.png')} />
                <View style={styles.interact_container}>
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='star' />
                        <Text style={styles.interact_label}>200</Text>
                    </View>
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='message' />
                        <Text style={styles.interact_label}>12</Text>
                    </View>
                    <View style={styles.interact_block}>
                        <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                        <Text style={styles.interact_label}>64</Text>
                    </View>
                    <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='book' />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#E3E3E3"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        paddingTop: 40,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10
    },
    menuButton: {
        fontSize: 40
    },
    title: {
        fontSize: 20,
        fontWeight: "bold"
    },
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