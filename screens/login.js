import React, { useState } from 'react';

import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import LoginProcess from '../utils/loginProcess';

export default function Login(props) {
    const [loginButtomVisible, setloginButtomVisible] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    let canEdit = true;

    function goSing_up() {
        props.navigation.navigate('Sign_up_part1');
    }

    const login = async () => {
        if (email.length != 0 && password.length != 0) {
            setloginButtomVisible(false);
            canEdit = false;
            userData = [];

            const myEmail = email.toLowerCase();
            const resLogin = await LoginProcess(myEmail, password);

            canEdit = true;
            setloginButtomVisible(true);
            console.log("Resultado del login: " + resLogin);

            if (resLogin) {
                props.navigation.navigate('Home');
            } else {
                console.log("Hay error :c");
                Alert.alert("Credenciales incorrectas", "El usuario y contraseña no estan correctos");
                canEdit = true
                setloginButtomVisible(true)
            }
        } else {
            Alert.alert("Campos vacios", "Por favor, llene todos los campos");
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
                        <TextInput placeholder='Usuario' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setEmail(text)} keyboardType='email-address' autoCorrect={false} editable={canEdit} />
                    </View>
                    <View style={styles.textContainer}>
                        <TextInput placeholder='Contraseña' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setPassword(text)} secureTextEntry={true} autoCorrect={false} editable={canEdit} />
                    </View>

                    {loginButtomVisible ?
                        <TouchableOpacity style={styles.loginButtom} onPress={login}>
                            <Text style={styles.loginTextButtom}>Ingresar</Text>
                        </TouchableOpacity>
                        :
                        <View style={styles.loginLoadingButtom}>
                            <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                            <Text style={styles.loginTextButtom}>Cargando</Text>
                        </View>
                    }

                    <TouchableOpacity onPress={goSing_up} style={styles.sign_up}>
                        <Text style={styles.loginTextButtom2}>¿No tienes una cuenta?</Text>
                        <Text style={styles.loginTextButtom3}>Registrese ahora</Text>
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
        backgroundColor: '#210016',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subContainer: {
        backgroundColor: '#550038',
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
        backgroundColor: '#210016',
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
        color: "#4895EF",
    },
    loginButtom: {
        marginTop: 35,
        backgroundColor: '#4895EF',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    loginLoadingButtom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        marginTop: 35,
        backgroundColor: '#20456e',
        borderRadius: 30,
        width: 100,
        paddingVertical: 10,
        width: '100%'
    },
    loadingSpinner: {
        marginRight: 10
    },
    loginTextButtom: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    sign_up: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    loginTextButtom2: {
        marginTop: 20,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loginTextButtom3: {
        marginTop: 20,
        marginLeft: 5,
        color: '#4895ef',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});