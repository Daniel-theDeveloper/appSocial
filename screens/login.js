import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import Container, { Toast } from 'toastify-react-native';

import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modalbox';
import RadioGroup from 'react-native-radio-buttons-group';
import LoginProcess from '../utils/loginProcess';
import { getSaveTheme, setSaveTheme } from '../utils/localstorage';

export default function Login(props) {
    const [loginButtomVisible, setloginButtomVisible] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [configTheme, setConfigTheme] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('system');

    const { colors } = useTheme();

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: 'Claro',
            value: 'light',
            color: colors.primary
        },
        {
            id: 2,
            label: 'Oscuro',
            value: 'dark',
            color: colors.primary
        },
        {
            id: 3,
            label: 'Configuración del sistema',
            value: 'system',
            color: colors.primary
        }
    ]), []);

    let canEdit = true;

    useEffect(() => {
        getSelectedTheme();
    }, []);

    const showToastsLoginFailed = () => {
        Toast.error('El usuario y contraseña no están correctos');
    }

    const showToastsNoData = () => {
        Toast.error('Por favor, llene todos los campos');
    }

    const showToastsInfo = () => {
        Toast.success('Reinicie la aplicación para aplicar los cambios');
    }

    const getSelectedTheme = async () => {
        const theme = await getSaveTheme();

        if (theme == 'light') {
            setSelectedTheme(1);
        } else if (theme == 'dark') {
            setSelectedTheme(2);
        }  else if (theme == 'system') {
            setSelectedTheme(3);
        }
    }

    const setNewTheme = async (e) => {
        setSelectedTheme(e);
        if (e === 1) {
            await setSaveTheme('light');
        } else if (e === 2) {
            await setSaveTheme('dark');
        } else if (e === 3) {
            await setSaveTheme('system');
        }
        showToastsInfo();
    }

    function goSing_up() {
        props.navigation.navigate('Sign_up_part1');
    }

    const login = async () => {
        if (email.length != 0 && password.length != 0) {
            setloginButtomVisible(false);
            canEdit = false;
            userData = [];

            const myEmail = email.toLowerCase();
            const resLogin = await LoginProcess(myEmail, password);

            canEdit = true;
            setloginButtomVisible(true);

            if (resLogin) {
                props.navigation.navigate('Home');
            } else {
                showToastsLoginFailed();
                canEdit = true
                setloginButtomVisible(true)
            }
        } else {
            showToastsNoData();
        }
    };

    function openModalConfig() {
        if (configTheme) {
            setConfigTheme(false);
        } else {
            setConfigTheme(true);
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, padding: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', }}>
            <Container position="top" animationStyle="zoomInOut" style={{ backgroundColor: colors.quartet_dark }} textStyle={{ color: "#fff", fontSize: 13, fontWeight: "bold" }} />
            <View style={{
                backgroundColor: colors.primary_dark,
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
            }}>
                <Image style={styles.backgroundLogin} source={require('../assets/loginBackground.png')} />

                <View style={styles.loginContainer}>
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}> Bienvenido usuario </Text>
                    <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}> Regístrese para disfurtar la mejor red social  </Text>

                    <View style={{ padding: 14, marginTop: 20, backgroundColor: colors.background, borderRadius: 20, width: '100%', height: 45, shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                        <TextInput placeholder='Usuario' placeholderTextColor={colors.holderText} style={{ fontWeight: 'bold', color: colors.inputText }} onChangeText={(text) => setEmail(text)} keyboardType='email-address' autoCorrect={false} editable={canEdit} />
                    </View>
                    <View style={{ padding: 14, marginTop: 20, backgroundColor: colors.background, borderRadius: 20, width: '100%', height: 45, shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                        <TextInput placeholder='Contraseña' placeholderTextColor={colors.holderText} style={{ fontWeight: 'bold', color: colors.inputText }} onChangeText={(text) => setPassword(text)} secureTextEntry={true} autoCorrect={false} editable={canEdit} />
                    </View>

                    {loginButtomVisible ?
                        <TouchableOpacity style={{ marginTop: 35, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={login}>
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Ingresar</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: 35, backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                            <ActivityIndicator color={colors.secondary} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Cargando</Text>
                        </View>
                    }

                    <TouchableOpacity onPress={goSing_up} style={styles.sign_up}>
                        <Text style={{ marginTop: 20, color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>¿No tienes una cuenta?</Text>
                        <Text style={{ marginTop: 20, marginLeft: 5, color: colors.secondary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>Registrase ahora</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sign_up} onPress={openModalConfig}>
                        <Text style={{ marginTop: 20, marginLeft: 5, color: colors.secondary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>Cambiar tema</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 175,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={configTheme} onClosed={openModalConfig} coverScreen={true}>
                <View style={{alignItems: 'center', width: '100%'}}>
                    <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                </View>
                <RadioGroup
                    containerStyle={{alignItems: 'flex-start'}}
                    radioButtons={radioButtons}
                    onPress={setNewTheme}
                    selectedId={selectedTheme}
                    labelStyle={{color: colors.text}}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
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
    loadingSpinner: {
        marginRight: 10
    },
    sign_up: {
        flexDirection: 'row',
        justifyContent: 'center'
    }
});