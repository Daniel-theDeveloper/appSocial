import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import SignUp, { params } from '../../utils/signUp';

export default function Sign_up_part2(props) {
    const [name, setName] = useState("");
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

                    SignUp().then((res) => {
                        if (res) {
                            setLoading(false);
                            props.navigation.navigate('Sign_up_part3');
                        } else {
                            setLoading(false);
                            Alert.alert("Error en el servidor", "Ha ocurrido  un error, vuelvelo a intentar mas tarde");
                            props.navigation.navigate('Login');
                        }
                    })
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
        <View style={{
            flex: 1,
            flexGrow: 1,
            padding: 10,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View style={{
                backgroundColor: colors.primary_dark,
                width: "100%",
                padding: 10,
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
                        <MaterialCommunityIcons style={{fontSize: 35, fontWeight: 'bold', color: colors.text}} name='close' />
                    </TouchableOpacity>
                    <Text style={{fontSize: 30, fontWeight: 'bold', color: colors.text}}>Cree una cuenta nueva</Text>
                    <View></View>
                </View>

                <Text style={{marginTop: 20, marginBottom: 10, marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: colors.text}}>Ingrese su nombre:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 55,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Mi nombre' placeholderTextColor={colors.holderText} style={{fontSize: 18, fontWeight: 'bold', color: colors.secondary}} onChangeText={(text) => setName(text)} autoCorrect={false} />
                </View>

                <Text style={{marginTop: 20, marginBottom: 10, marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: colors.text}}>Ingrese su apellido:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 55,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Mi apellido' placeholderTextColor={colors.holderText} style={{fontSize: 18, fontWeight: 'bold', color: colors.secondary}} onChangeText={(text) => setSurname(text)} autoCorrect={false} />
                </View>

                <Text style={{marginTop: 20, marginBottom: 10, marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: colors.text}}>Ingrese contraseña:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 55,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Contraseña' placeholderTextColor={colors.holderText} style={{fontSize: 18, fontWeight: 'bold', color: colors.secondary}} onChangeText={(text) => setPassword(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.secondary}} name='eye' />
                        </TouchableOpacity>
                    }
                </View>
                {password.length >= 6 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{color: colors.tertiary, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7}} name='shield-check' />
                        <Text style={{color: colors.tertiary, fontSize: 16, fontWeight: 'bold'}}>La contraseña tiene 6 caracteres</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7}} name='shield-alert-outline' />
                        <Text style={{color: colors.text_error, fontSize: 16, fontWeight: 'bold'}}>La contraseña debe tener 6 caracteres</Text>
                    </View>

                }


                <Text style={{marginTop: 20, marginBottom: 10, marginLeft: 15, fontSize: 17, fontWeight: 'bold', color: colors.text}}>Vuelva a escribir su contraseña:</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 18,
                    backgroundColor: colors.background,
                    borderRadius: 20,
                    width: '100%',
                    height: 55,
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: 1,
                        height: 3
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}>
                    <TextInput placeholder='Mi ciudad actual' placeholderTextColor={colors.holderText} style={{fontSize: 18, fontWeight: 'bold', color: colors.secondary}} onChangeText={(text) => setPasswordConfirm(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                    {hidePassword ?
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.primary_dark_alternative}} name='eye-off-outline' />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={setPasswordStatus}>
                            <MaterialCommunityIcons style={{fontSize: 22, color: colors.secondary}} name='eye' />
                        </TouchableOpacity>
                    }
                </View>

                <Text style={{marginTop: 20, color: colors.text, fontSize: 17, fontWeight: 'bold', textAlign: 'center'}}>Al crear la cuenta nueva, aceptas los terminos y condiciones de Social App, ademas de las normas de comunidad de esta red social.</Text>

                {loading ?
                    <View style={{marginVertical: 15, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', backgroundColor: secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}}>
                        <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={{marginVertical: 15, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%'}} onPress={trySingUp}>
                        <Text style={{color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 16}}>Crear la cuenta</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
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
        marginTop: 15
    }
})