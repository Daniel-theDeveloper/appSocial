import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { params } from '../../utils/signUp';
import { useTheme } from '@react-navigation/native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen(props) {
    const { colors } = useTheme();

    const { t } = useTranslation();

    function goLogin() {
        props.navigation.navigate('Loading');
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
                <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 95 }} name='hail' />
                <Text style={{ color: colors.text, fontSize: 25, fontWeight: 'bold' }}>{t('welcomeNew')}</Text>
                <Text style={{ marginLeft: 10, color: colors.secondary, fontSize: 20, fontWeight: 'bold' }}>{params.nickname}</Text>
                <Text style={{ color: colors.text, fontSize: 25, fontWeight: 'bold' }}>{t('welcomeNewSub')}</Text>

                <Text style={{ marginVertical: 10, color: colors.text, fontSize: 14, textAlign: 'center' }}>{t('welcomeSlogan')}</Text>

                <TouchableOpacity style={{ marginVertical: 20, backgroundColor: colors.secondary, borderRadius: 30, paddingVertical: 10, width: '100%' }} onPress={goLogin}>
                    <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('continue')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}