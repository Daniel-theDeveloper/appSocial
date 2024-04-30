import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';

import { getLocalUser } from '../utils/localstorage';
import LoginProcess from '../utils/loginProcess';

export default function Loading(props) {
    useEffect(() => {
        autoLogin();
    }, [])

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
        <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={'#220014'}
                barStyle={"light-content"}
            />
            <ActivityIndicator color={'#ff0070'} size='large'/>
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
});