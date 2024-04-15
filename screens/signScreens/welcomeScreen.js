import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { params } from '../../utils/signUp';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function WelcomeScreen(props) {

    function goLogin() {
        props.navigation.navigate('Login');
    }

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <MaterialCommunityIcons style={styles.icon} name='hail' />
                <View style={styles.header}>
                    <Text style={styles.label}>Bienvenido</Text>
                    <Text style={styles.myLabel}>{params.nickname}</Text>
                </View>
                <Text style={styles.label}>a Social App</Text>

                <Text style={styles.description}>Vuelva a iniciar sesion con su nueva cuenta</Text>

                <TouchableOpacity style={styles.signButton} onPress={goLogin}>
                    <Text style={styles.signTextButton}>Continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 10,
        backgroundColor: '#210016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subContainer: {
        backgroundColor: '#550038',
        padding: 20,
        width: "100%",
        alignItems: 'center',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 10,
            height: 10
        },
        shadowOpacity: 0.55,
        shadowRadius: 4,
        elevation: 5
    },
    icon: {
        color: "#ff0070",
        fontSize: 80
    },
    header: {
        flexDirection: 'row'
    },
    label: {
        color: "white",
        fontSize: 30,
        fontWeight: 'bold'
    },
    myLabel: {
        marginLeft: 10,
        color: "#46b0d5",
        fontSize: 30,
        fontWeight: 'bold'
    },
    description: {
        marginVertical: 10,
        color: 'white',
        fontSize: 18,
        textAlign: 'center'
    },
    signButton: {
        marginVertical: 20,
        backgroundColor: '#4895EF',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    signTextButton: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20
    }
});