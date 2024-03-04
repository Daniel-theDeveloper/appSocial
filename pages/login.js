import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Alert } from 'react-native';

import appFirebase from '../utils/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
const auth = getAuth(appFirebase);

export default function login(props) {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const login = async() => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            props.navigation.navigate('Home');
        } catch (error) {
            console.log(error);
            props.navigation.navigate('Home'); // Por favor, borrar esto
            Alert.alert("Credenciales incorrectas", "El usuario y contraseña no estan correctos")
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Image style={styles.backgroundLogin} source={require('../assets/loginBackground.png')} />

                <View style={styles.loginContainer}>
                    <Text style={styles.title}> Bienvenido usuario </Text>
                    <Text style={styles.subtitle}> Regístrese para disfurtar la mejor red social  </Text>

                    <View style={styles.textContainer}>
                        <TextInput placeholder='Usuario' style={styles.input} onChangeText={(text) => setEmail(text)} />
                    </View>
                    <View style={styles.textContainer}>
                        <TextInput placeholder='Contraseña' style={styles.input} onChangeText={(text) => setPassword(text)} secureTextEntry={true} />
                    </View>

                    <TouchableOpacity style={styles.loginButtom} onPress={login}>
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
        padding: 25,
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
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }

});