import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import appFirebase from '../../utils/database';
import { params } from '../../utils/signUp';

const auth = getAuth(appFirebase);

export default function Sign_up_part1(props) {
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    function exitBack() {
        props.navigation.goBack()
    }

    const trySingUp = async () => {
        if (email.length > 0 && country.length > 0) {
            try {
                setError(false);
                setLoading(true);
                if (email.length != 0 && country.length != 0) {
                    const isEmailExits = await fetchSignInMethodsForEmail(auth, email)
                    if (isEmailExits.length == 0) {
                        // Save data
                        params.email = email,
                        params.country = country
                        params.city = city
                        setLoading(false);
                        props.navigation.navigate('Sign_up_part2');
                    } else {
                        setLoading(false);
                        setError(true);
                    }
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.log(error)
                setLoading(false)
            }
        } else {
            Alert.alert("Campos incompletos", "Por favor, llene todos los campos");
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

                <Text style={styles.label}>Ingrese su correo electronico:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='minombre@social.com' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setEmail(text)} keyboardType='email-address' autoCorrect={false} />
                </View>
                {error ?
                    <Text style={styles.label_error}>Este correo ya esta en uso, por favor, use otro</Text>
                    :
                    <View></View>
                }

                <Text style={styles.label}>Ingrese su pais:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi pais actual' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setCountry(text)} autoCorrect={false} />
                </View>

                <Text style={styles.label}>(opcional) Ingrese su ciudad:</Text>
                <View style={styles.textContainer}>
                    <TextInput placeholder='Mi ciudad actual' placeholderTextColor="#7b0051" style={styles.input} onChangeText={(text) => setCity(text)} autoCorrect={false} />
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
    label_error: {
        color: "#4895ef",
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold'
    },
    textContainer: {
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
    }
})