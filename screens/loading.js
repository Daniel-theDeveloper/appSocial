import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { getLocalUser } from '../utils/localstorage';
import LoginProcess from '../utils/loginProcess';

export default function Loading(props) {
    useEffect(() => {
        autoLogin();
    }, []);

    const { colors } = useTheme();

    const autoLogin = async () => {
        const resLocalUser = await getLocalUser();

        if (resLocalUser != undefined) {
            try {
                const emailCrude = resLocalUser.email.split('"');
                const email = emailCrude[1];

                const passwordCrude = resLocalUser.password.split('"');
                const password = passwordCrude[1];

                const resLogin = await LoginProcess(email, password);
                if (resLogin) {
                    props.navigation.replace('Home');
                } else {
                    props.navigation.replace('Login');
                }
            } catch (error) {
                console.error(error);
                props.navigation.replace('Login');
            }
        } else {
            props.navigation.replace('Login');
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
            <Image style={{ height: 150, width: 150, marginBottom: 40 }} source={require('../assets/icon.png')} />
            <ActivityIndicator color={colors.primary} size={70} />
        </View>
    );

}