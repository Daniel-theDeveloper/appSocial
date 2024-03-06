import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

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

export default function details() {
    const FollowBlock = isFollow

    return (
        <View style={styles.container}>
            <View style={styles.publication}>

                {/* Encabezado de la publicacion */}
                <View style={styles.perfil_header}>
                    <View style={styles.perfil_user}>
                        <Image style={styles.avatar} source={require('../assets/avatar-default.png')} />
                        <View style={styles.perfil_usernames_container}>
                            <Text style={styles.username}>USUARIO publicó</Text>
                            <Text style={styles.date}>10 de marzo</Text>
                        </View>
                    </View>
                    <FollowBlock />
                </View>

                {/* Cuerpo de la publicacion */}
                <Text style={styles.publication_text}>Publicacion de prueba donde el usuario expresa su pensamiento sobre las cosas que ocurren en la vida misma, tambien llamadas como experiencias</Text>
                <Image style={styles.publication_image} source={require('../assets/publicationTest.png')} />

                {/* Zona de estadisticas */}
                <View style={styles.statistics}>
                    <View style={styles.statistics_block}>
                        <Text style={styles.statistics_num}>12</Text>
                        <Text style={styles.statistics_label}>Comentarios</Text>
                    </View>
                    <Text style={styles.statistics_separator}>|</Text>
                    <View style={styles.statistics_block}>
                        <Text style={styles.statistics_num}>200</Text>
                        <Text style={styles.statistics_label}>Likes</Text>
                    </View>
                </View>
                {/* Zona de interaccion */}
                <View style={styles.interact_container}>
                    <MaterialCommunityIcons style={styles.interact_icon} name='star' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='repeat-variant' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='share-variant' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='book' />
                    <MaterialCommunityIcons style={styles.interact_icon} name='chevron-down' />
                </View>
            </View>

            {/* Zona de comentarios */}
            <Text>Comentarios</Text>
            <View>
                <View>
                    <Image style={styles.avatar} source={require('../assets/avatar-default.png')} />
                </View>
                <View>
                    <View>
                        <Text>USUARIO</Text>
                        <Text>|</Text>
                        <Text>12 de marzo</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#E3E3E3",
        paddingVertical: 40,
        paddingHorizontal: 12
    },
    publication: {
        backgroundColor: "white",
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
        fontWeight: "bold"
    },
    date: {
        fontSize: 14
    },
    follow_button: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 10,
        outlineColor: "#523009",
        outlineStyle: "solid",
        outlineWidth: 4,
    },
    follow_label: {
        fontSize: 16
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
    statistics: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    statistics_block: {
        flexDirection: "row"
    },
    statistics_num: {
        fontSize: 16,
        fontWeight: "bold"
    },
    statistics_label: {
        fontSize: 16,
        marginLeft: 5
    },
    statistics_separator: {
        fontSize: 18,
        fontWeight: "bold",
        marginHorizontal: 15
    },
    interact_container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    interact_icon: {
        fontSize: 26,
        color: "#3c434f"
    }
})