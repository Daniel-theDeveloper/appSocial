import React from 'react';
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity } from 'react-native';

export default function login() {
    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Image style={styles.backgroundLogin} source={require('../assets/loginBackground.png')} />

                <View style={styles.loginContainer}>
                    <Text style={styles.title}> Bienvenido usuario </Text>
                    <Text style={styles.subtitle}> Regístrese para disfurtar la mejor red social  </Text>

                    <View style={styles.textContainer}>
                        <TextInput placeholder='Usuario' style={styles.input} />
                    </View>
                    <View style={styles.textContainer}>
                        <TextInput placeholder='Contraseña' style={styles.input} />
                    </View>

                    <TouchableOpacity style={styles.loginButtom}>
                        <Text style={styles.loginTextButtom}>Ingresar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.loginTextButtom2}>¿No tienes una cuenta? Registrese ahora</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 10,
        backgroundColor: '#161343',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subContainer: {
        backgroundColor: '#272276',
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
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
    backgroundLogin: {
        height: 140,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },

    loginContainer: {
        padding: 10,
        width: '100%'
    },
    title: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    subtitle: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    },
    textContainer: {
        padding: 18,
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        height: 55,
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 3
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#141442'
    },
    loginButtom: {
        marginTop: 35,
        backgroundColor: '#7209B7',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    loginTextButtom: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    loginTextButtom2: {
        marginTop: 20,
        marginBottom: 20,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }

});