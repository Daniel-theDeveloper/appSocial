import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { params } from '../../utils/signUp';

export default function Sign_up_part2(props) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [hidePassword, setHidePassword] = useState(true);

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    function exitBack() {
        props.navigation.goBack()
    }

    function setPasswordStatus() {
        if (hidePassword) {
            setHidePassword(false);
        } else {
            setHidePassword(true);
        }
    }

    const trySingUp = async () => {
        try {
            setError(false);
            setLoading(true);
            if (name.length != 0 && surname.length != 0 && password.length >= 6) {
                if (password == passwordConfirm) {
                    const username = name + surname;
                    // Comprobar si el nombre existe

                    // Save data
                    params.username = username;
                    params.nickname = username;
                    params.password = password;

                    props.navigation.navigate('Sign_up_part3');

                    setLoading(false);
                } else {
                    setLoading(false);
                    console.log("No coinciden")
                }
            } else {
                setLoading(false);
                console.log("Vacio")
            }
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={exitBack}>
                        <MaterialCommunityIcons style={styles.icon_close} name='close' />
                    </TouchableOpacity>
                    <Text style={styles.title}>Cree una cuenta nueva</Text>
                    <View></View>
                </View>

                <Text style={styles.label}>Ingrese su nombre:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='mi nombre' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setName(text)} autoCorrect={false} />
                </View>

                <Text style={styles.label}>Ingrese su apellido:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi apellido' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setSurname(text)} autoCorrect={false} />
                </View>

                <Text style={styles.label}>Ingrese contraseña:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Contraseña' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setPassword(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={styles.icon_password_hide} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={styles.icon_password_show} name='eye' />
                        </TouchableOpacity>
                    }
                </View>
                {password.length >= 6 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={styles.password_message_good} name='shield-check' />
                        <Text style={styles.password_message_good}>La contraseña debe tener minimo 6 caracteres</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={styles.password_message_bad} name='shield-alert-outline' />
                        <Text style={styles.password_message_bad}>La contraseña debe tener minimo 6 caracteres</Text>
                    </View>

                }


                <Text style={styles.label}>Vuelva a escribir su contraseña:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi ciudad actual' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setPasswordConfirm(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={styles.icon_password_hide} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={styles.icon_password_show} name='eye' />
                        </TouchableOpacity>
                    }
                </View>

                {loading ?
                    <View style={styles.signLoadingButton}>
                        <ActivityIndicator color="#00feff" style={styles.loadingSpinner} />
                        <Text style={styles.signTextButton}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={styles.signButton} onPress={trySingUp}>
                        <Text style={styles.signTextButton}>Siguiente</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
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
        padding: 10,
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
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white'
    },
    icon_close: {
        fontSize: 35,
        fontWeight: 'bold',
        color: 'white'
    },
    label: {
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white'
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 18,
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
    signButton: {
        marginTop: 35,
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
        fontSize: 16
    },
    signLoadingButton: {
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
    icon_password_hide: {
        fontSize: 22,
        color: "#a1006a"
    },
    icon_password_show: {
        fontSize: 22,
        color: "#46b0d5"
    },
    password_message_block: {
        flexDirection: 'row',
        marginTop: 15
    },
    password_message_good: {
        color: "#abf752",
        fontSize: 16,
        fontWeight: 'bold'
    },
    password_message_bad: {
        color: "#ff0078",
        fontSize: 16,
        fontWeight: 'bold'
    }
})