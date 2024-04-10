import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import appFirebase, { database } from '../utils/database';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { setUsername, getUsername, erase_all, setIdUser } from '../utils/localstorage';

const auth = getAuth(appFirebase);

export default function Login(props) {
    const [loginButtomVisible, setloginButtomVisible] = useState((true));

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    let canEdit = true;

    // Metodo para obtener el username del usuario
    const getDataUser = async (email) => {
        let userData = [];
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                userData.push(doc.data());
            });
            const data = userData.find(function (res) {
                if (res.email === email) {
                    return res
                }
            });
            return data.username
        } catch (error) {
            console.error(error);
        }
    }

    const getIDUser = async (email) => {
        let userData = [];
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                userData.push({id: doc.id, email: doc.data().email});
            });
            const data = userData.find(function (res) {
                if (res.email === email) {
                    return res
                }
            });
            return data.id
        } catch (error) {
            console.error(error);
        }
    }

    const login = async () => {
        if (email.length != 0 || password.length != 0) {
            setloginButtomVisible(false);
            canEdit = false;
            userData = [];
            const myEmail = email.toLowerCase()
            try {
                await signInWithEmailAndPassword(auth, myEmail, password).then(async () => {
                    const username = await getDataUser(myEmail);
                    const id = await getIDUser(myEmail);
    
                    //Bloque provicional, la idea es autologuearse si ya inicio sesion
                    const old_username = await getUsername();
                    if (old_username != undefined) {
                        await erase_all();
                    }
    
                    // Guardando datos del logueo.
                    await setUsername(username);
                    setIdUser(id);
                    canEdit = true
                    setloginButtomVisible(true)
                    props.navigation.navigate('Home');
                });
    
            } catch (error) {
                console.log(error.message);
                if (error.message == "Firebase: Error (auth/invalid-email)." || error.message == "auth/invalid-login-credentials") {
                    Alert.alert("Credenciales incorrectas", "El usuario y contraseña no estan correctos");
                } else {
                    Alert.alert("Error interno del servidor");
                }
                canEdit = true
                setloginButtomVisible(true)
            }
        } else {
            Alert.alert("Campos vacios","Por favor, llene todos los campos");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={'#220014'}
                barStyle={"light-content"}
            />
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
    loginTextButtom2: {
        marginTop: 20,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});