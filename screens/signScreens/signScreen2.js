import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import LoginProcess from '../../utils/loginProcess';

import { database } from '../../utils/database';
import { getDocs, collection } from 'firebase/firestore';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import SignUp, { params } from '../../utils/signUp';

export default function Sign_up_part2(props) {
    const [username, setUsername] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [hidePassword, setHidePassword] = useState(true);

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { colors } = useTheme();

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

    const searchUsername = async (username) => {
        let key = true;
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                if (doc.data().username == username) {
                    key = false
                }
            });

            return key;
        } catch (error) {
            console.log(error);
            return false
        }
    }

    const trySingUp = async () => {
        try {
            setError(false);
            setLoading(true);
            if (username.length != 0 && surname.length != 0 && password.length >= 6) {
                if (password == passwordConfirm) {
                    // Comprobar si el nombre existe
                    const usernameNoExits = await searchUsername(username);

                    if (usernameNoExits) {
                        // Save data
                        params.username = username;
                        params.nickname = username;
                        params.password = password;

                        SignUp().then(async (res) => {
                            if (res) {
                                const resLogin = await LoginProcess(params.email, params.password);
                                setLoading(false);
                                if (resLogin) {
                                    props.navigation.navigate('Sign_up_part3');
                                } else {
                                    props.navigation.navigate('WelcomeScreen');
                                }
                            } else {
                                setLoading(false);
                                Alert.alert("Error en el servidor", "Ha ocurrido un error, Vuélvalo a intentar mas tarde");
                                props.navigation.navigate('Login');
                            }
                        })
                    } else {
                        setError(true);
                        setLoading(false);
                    }
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
        <ScrollView style={{
            flex: 1,
            flexGrow: 1,
            padding: 14,
            backgroundColor: colors.background
        }}>
            <View style={{
                backgroundColor: colors.primary_dark,
                width: "100%",
                padding: 14,
                borderRadius: 24,
                shadowColor: colors.shadow,
                shadowOffset: {
                    width: 10,
                    height: 10
                },
                shadowOpacity: 0.55,
                shadowRadius: 4,
                elevation: 5
            }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={exitBack}>
                        <MaterialCommunityIcons style={{ fontSize: 35, fontWeight: 'bold', color: colors.text }} name='close' />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.text }}>Cree una cuenta nueva</Text>
                    <View></View>
                </View>

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Ingrese su nombre unico de usuario:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 14,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 45,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Puede ser su nombre + apellido + distinguido' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setUsername(text)} autoCorrect={false} />
                </View>
                {error ?
                    <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold', marginLeft: 12, marginTop: 5 }}>Este nombre ya existe, intente cambiar el distinguido</Text>
                    :
                    <View></View>
                }

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Ingrese su apodo:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 14,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 45,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Como te gustarian que te llamen?' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setSurname(text)} autoCorrect={false} />
                </View>

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Ingrese contraseña:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 14,
                        backgroundColor: colors.background,
                        borderRadius: 20,
                        width: '90%',
                        height: 45,
                        shadowColor: colors.shadow,
                        shadowOffset: {
                            width: 1,
                            height: 3
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5
                    }}>
                        <TextInput placeholder='Contraseña' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setPassword(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    </View>
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.primary_dark_alternative }} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.secondary }} name='eye' />
                        </TouchableOpacity>
                    }
                </View>
                {password.length >= 6 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-check' />
                        <Text style={{ color: colors.tertiary, fontSize: 14, fontWeight: 'bold' }}>La contraseña tiene 6 caracteres</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-alert-outline' />
                        <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold' }}>La contraseña debe tener 6 caracteres</Text>
                    </View>
                }


                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Vuelva a escribir su contraseña:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 14,
                        backgroundColor: colors.background,
                        borderRadius: 20,
                        width: '90%',
                        height: 45,
                        shadowColor: colors.shadow,
                        shadowOffset: {
                            width: 1,
                            height: 3
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5
                    }}>
                        <TextInput placeholder='Confirmar contraseña' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setPasswordConfirm(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    </View>
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.primary_dark_alternative }} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.secondary }} name='eye' />
                        </TouchableOpacity>
                    }
                </View>
                {password == passwordConfirm && password.length > 0 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-check' />
                        <Text style={{ color: colors.tertiary, fontSize: 14, fontWeight: 'bold' }}>Las contraseñas coinciden</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-alert-outline' />
                        <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold' }}>Las contraseñas no coinciden</Text>
                    </View>
                }

                <Text style={{ marginTop: 20, color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Al crear la cuenta nueva, aceptas los terminos y condiciones de Social App, ademas de las normas de comunidad de esta red social.</Text>

                {loading ?
                    <View style={{ marginVertical: 15, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                        <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={{ marginVertical: 15, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={trySingUp}>
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>Crear la cuenta</Text>
                    </TouchableOpacity>
                }
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    loadingSpinner: {
        marginRight: 10
    },
    password_message_block: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center'
    }
})