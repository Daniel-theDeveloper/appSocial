import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { params } from '../../utils/signUp';
import { useTheme } from '@react-navigation/native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function WelcomeScreen(props) {
    const { colors } = useTheme();

    function goLogin() {
        props.navigation.navigate('Login');
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
            }}>
                <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 80 }} name='hail' />
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold' }}>Bienvenido</Text>
                    <Text style={{ marginLeft: 10, color: colors.secondary, fontSize: 30, fontWeight: 'bold' }}>{params.nickname}</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold' }}>a Social App</Text>

                <Text style={{ marginVertical: 10, color: colors.text, fontSize: 18, textAlign: 'center' }}>Vuelva a iniciar sesion con su nueva cuenta</Text>

                <TouchableOpacity style={{ marginVertical: 20, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={goLogin}>
                    <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>Continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}