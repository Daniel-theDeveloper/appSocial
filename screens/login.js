import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import '../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Modal from 'react-native-modalbox';
import RadioGroup from 'react-native-radio-buttons-group';
import LoginProcess from '../utils/loginProcess';
import { getSaveTheme, setSaveTheme, getSaveLanguage, setSaveLanguage } from '../utils/localstorage';

export default function Login(props) {
    const [loginButtonVisible, setloginButtonVisible] = useState(true);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [configTheme, setConfigTheme] = useState(false);
    const [configLanguage, setConfigLanguage] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('system');
    const [selectedLanguage, setSelectedLanguage] = useState('system');

    const { colors } = useTheme();
    const { t } = useTranslation();

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: t('optionLight'),
            value: 'light',
            color: colors.primary
        },
        {
            id: 2,
            label: t('optionDark'),
            value: 'dark',
            color: colors.primary
        },
        {
            id: 3,
            label: t('optionSystem'),
            value: 'system',
            color: colors.primary
        }
    ]), []);

    const radioButtonsLanguage = useMemo(() => ([
        {
            id: 1,
            label: t('optionSystem'),
            value: 'system',
            color: colors.primary
        },
        {
            id: 2,
            label: t('optionEnglish'),
            value: 'english',
            color: colors.primary
        },
        {
            id: 3,
            label: t('optionSpanish'),
            value: 'spanish',
            color: colors.primary
        }
    ]), []);

    useEffect(() => {
        getSelectedTheme();
        getSelectedLanguage();
    }, []);

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

    const getSelectedLanguage = async () => {
        const language = await getSaveLanguage();

        if (language == 'system') {
            setSelectedLanguage(1);
        } else if (language == 'english') {
            setSelectedLanguage(2);
        }  else if (language == 'spanish') {
            setSelectedLanguage(3);
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
        Alert.alert(t('restart'));
    }

    const setNewLanguage = async (e) => {
        setSelectedLanguage(e);
        if (e === 1) {
            await setSaveLanguage('system');
        } else if (e === 2) {
            await setSaveLanguage('english');
            i18n.changeLanguage('en');
        } else if (e === 3) {
            await setSaveLanguage('spanish');
            i18n.changeLanguage('es');
        }
        Alert.alert(t('restart'));
    }

    function goSing_up() {
        props.navigation.navigate('Sign_up_part1');
    }

    const login = async () => {
        if (email.length != 0 && password.length != 0) {
            setloginButtonVisible(false);
            userData = [];

            const myEmail = email.toLowerCase();
            const resLogin = await LoginProcess(myEmail, password);

            setloginButtonVisible(true);

            if (resLogin) {
                props.navigation.navigate('Home');
            } else {
                Alert.alert(t('errorLogin'))
                setloginButtonVisible(true)
            }
        } else {
            Alert.alert(t('errorNoData'))
        }
    };

    function openModalConfig() {
        if (configTheme) {
            setConfigTheme(false);
        } else {
            setConfigTheme(true);
        }
    }

    function openModalLanguage() {
        if (configLanguage) {
            setConfigLanguage(false);
        } else {
            setConfigLanguage(true);
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, padding: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', }}>
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
                    <Text style={{ color: colors.text, fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}>{t('welcome')}</Text>
                    <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}>{t('slogan')}</Text>

                    <View style={{ paddingLeft: 14, paddingRight: 14, marginTop: 20, backgroundColor: colors.background, borderRadius: 20, width: '100%', height: 45, shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, justifyContent: 'center' }}>
                        <TextInput placeholder={t('placeholderEmail')} placeholderTextColor={colors.holderText} style={{ fontWeight: 'bold', color: colors.inputText, width: '100%' }} onChangeText={(text) => setEmail(text)} keyboardType='email-address' autoCorrect={false} editable={loginButtonVisible ? true : false} />
                    </View>
                    <View style={{ paddingLeft: 14, paddingRight: 14, marginTop: 20, backgroundColor: colors.background, borderRadius: 20, width: '100%', height: 45, shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, justifyContent: 'center' }}>
                        <TextInput placeholder={t('placeholderPassword')} placeholderTextColor={colors.holderText} style={{ fontWeight: 'bold', color: colors.inputText, width: '100%' }} onChangeText={(text) => setPassword(text)} secureTextEntry={true} autoCorrect={false} editable={loginButtonVisible ? true : false} />
                    </View>

                    {loginButtonVisible ?
                        <TouchableOpacity style={{ marginTop: 35, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={login}>
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>{t('buttonLogin')}</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: 35, backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                            <ActivityIndicator color={colors.secondary} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>{t('loading')}</Text>
                        </View>
                    }

                    <TouchableOpacity onPress={goSing_up} style={styles.sign_up}>
                        <Text style={{ marginTop: 20, color: colors.text, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>{t('sloganNewUser')}</Text>
                        <Text style={{ marginTop: 20, marginLeft: 5, color: colors.secondary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>{t('buttonSignUp')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sign_up} onPress={openModalConfig}>
                        <Text style={{ marginTop: 20, marginLeft: 5, color: colors.secondary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>{t('buttonChangeTheme')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sign_up} onPress={openModalLanguage}>
                        <Text style={{ marginTop: 20, marginLeft: 5, color: colors.secondary, fontSize: 16, fontWeight: 'bold', textAlign: 'center', }}>{t('buttonChangeLanguage')}</Text>
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

            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 175,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={configLanguage} onClosed={openModalLanguage} coverScreen={true}>
                <View style={{alignItems: 'center', width: '100%'}}>
                    <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                </View>
                <RadioGroup
                    containerStyle={{alignItems: 'flex-start'}}
                    radioButtons={radioButtonsLanguage}
                    onPress={setNewLanguage}
                    selectedId={selectedLanguage}
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