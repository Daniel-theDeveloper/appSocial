import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { params } from '../../utils/signUp';
import { useTheme } from '@react-navigation/native';

import { database } from '../../utils/database';
import { getDocs, collection } from 'firebase/firestore';

export default function Sign_up_part1(props) {
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { colors } = useTheme();

    function exitBack() {
        props.navigation.goBack()
    }

    const trySingUp = async () => {
        if (email.length > 0 && country.length > 0) {
            try {
                setError(false);
                setLoading(true);
                if (email.length != 0 && country.length != 0) {
                    const emailNoExits = await searchEmail(email)
                    if (emailNoExits) {
                        // Save data
                        params.email = email.toLowerCase();
                        params.country = country;
                        params.city = city;
                        setLoading(false);
                        setError(false);
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

    const searchEmail = async (myEmail) => {
        let key = true;
        const email = myEmail.toLowerCase();
        try {
            const QuerySnapshot = await getDocs(collection(database, "users"));
            QuerySnapshot.forEach((doc) => {
                if (doc.data().email == email) {
                    key = false
                }
            });

            return key;
        } catch (error) {
            console.log(error);
            return false
        }
    }

    return (
        <View style={{
            flex: 1,
            flexGrow: 1,
            padding: 14,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
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

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Ingrese su correo electronico:</Text>
                <View style={{
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
                    <TextInput placeholder='minombre@social.com' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setEmail(text)} keyboardType='email-address' autoCorrect={false} />
                </View>
                {error ?
                    <Text style={{ color: colors.text_error, marginTop: 5, marginLeft: 14, fontSize: 14, fontWeight: 'bold' }}>Este correo ya esta en uso, por favor, use otro</Text>
                    :
                    <View></View>
                }

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>Ingrese su pais:</Text>
                <View style={{
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
                    <TextInput placeholder='Mi pais actual' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setCountry(text)} autoCorrect={false} />
                </View>

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 16, fontWeight: 'bold', color: colors.text }}>(opcional) Ingrese su ciudad:</Text>
                <View style={{
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
                    <TextInput placeholder='Mi ciudad actual' placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary }} onChangeText={(text) => setCity(text)} autoCorrect={false} />
                </View>

                {loading ?
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        marginTop: 35,
                        backgroundColor: colors.secondary_dark,
                        borderRadius: 30,
                        paddingVertical: 10,
                        width: '100%'
                    }}>
                        <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>Cargando</Text>
                    </View>
                    :
                    <TouchableOpacity style={{ marginTop: 35, backgroundColor: colors.secondary, borderRadius: 30, paddingVertical: 10, width: '100%' }} onPress={trySingUp}>
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>Siguiente</Text>
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
    }
})