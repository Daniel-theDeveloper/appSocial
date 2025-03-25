import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useTheme, StackActions } from '@react-navigation/native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, database } from '../../utils/database';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { localUserLogin, erase_all, getSaveTheme, setSaveTheme, getSaveLanguage, setSaveLanguage } from '../../utils/localstorage';
import { fetchImage, removeBlockUser } from '../../utils/interations';
import { userData } from "./configPerfil";
import Modal from 'react-native-modalbox';
import RadioGroup from 'react-native-radio-buttons-group';

import '../../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export default function ConfigGeneral(props) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const options = {
        option1: t('optionCount'),
        option2: t('optionPassword'),
        option3: t('optionLanguage'),
        option4: t('optionTheme'),
        option5: t('optionBlocks'),
        option6: t('optionLogOut'),
        option7: t('optionDelete')
    }

    const menuGeneral = [
        { id: 1, title: options.option1, icon: 'account-box-outline' },
        { id: 2, title: options.option2, icon: 'lock-outline' },
        { id: 3, title: options.option3, icon: 'earth' },
        { id: 4, title: options.option4, icon: 'theme-light-dark' },
        { id: 5, title: options.option5, icon: 'account-cancel-outline' },
        { id: 6, title: options.option6, icon: 'exit-to-app' },
        { id: 7, title: options.option7, icon: 'trash-can-outline' },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [filtered, setFiltered] = useState(menuGeneral);
    const [blacklistModal, setBlacklistModal] = useState(false);
    const [blacklistUsers, setBlacklistUsers] = useState([]);

    const [configLanguage, setConfigLanguage] = useState(false);
    const [configTheme, setConfigTheme] = useState(false);

    const [selectedTheme, setSelectedTheme] = useState('system');
    const [selectedLanguage, setSelectedLanguage] = useState('system');

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
        loadBlacklistUsers();
    }, []);

    const alertLogOut = () =>
        Alert.alert(
            t('logoutTitle'),
            t('logout'),
            [
                {
                    text: t('no'),
                    style: 'cancel',
                },
                {
                    text: t('yes'),
                    onPress: () => log_out()
                },
            ],
        );

    function goBackAgain() {
        props.navigation.goBack()
    }

    const loadBlacklistUsers = async () => {
        try {
            let blacklist = [];

            const docRef = doc(database, "users", localUserLogin.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists) {
                const res = await docSnap.data().blackList;

                if (res != undefined) {
                    res.forEach(async (item) => {
                        const userRef = doc(database, "users", item);
                        const userSnap = await getDoc(userRef);
    
                        if (userSnap.exists) {
                            blacklist.push({
                                id: userSnap.id,
                                username: userSnap.data().username,
                                name: userSnap.data().name,
                                avatar: await fetchImage(userSnap.data().avatar)
                            });
                        }
                    });
                    setBlacklistUsers(blacklist);
                }
            } else {
                Alert.alert(t('errorTitle'), t('error'));
            }
        } catch (error) {
            console.error(error);
        }
    }

    const log_out = async () => {
        try {
            signOut(auth).catch(error => console.error(error));
            await erase_all();
            props.navigation.replace('Login');
        } catch (error) {
            console.error(error);
        }
    }

    const removeBlockedUser = async (id) => {
        const res = await removeBlockUser(id, localUserLogin.id);
        if (res) {
            setBlacklistModal(false);
            loadBlacklistUsers();
        } else {
            Alert.alert(t('errorTitle'), t('error'));
        }
    }

    const handleSearch = (text) => {
        let results = [];

        setSearchQuery(text);
        if (text.length != 0) {
            menuGeneral.forEach((item) => {
                if (item.title.toLowerCase().includes(text.toLowerCase())) {
                    results.push(item);
                }
            });
            setFiltered(results);
        } else {
            setFiltered(menuGeneral);
        }
    }

    function selectConfig(e) {
        switch (e) {
            case 1:
                goConfigMyPerfil();
                break;
            case 2:
                props.navigation.navigate('ConfigPassword');
                break;
            case 3:
                openModalLanguage();
                break;
            case 4:
                openModalTheme();
                break;
            case 5:
                openModalBlacklist();
                break;
            case 6:
                alertLogOut();
                break;
            case 7:
                props.navigation.navigate('DeleteAccount');
                break;
            default:
                console.error(e);
                break;
        }
    }

    function openModalTheme() {
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

    function openModalBlacklist() {
        if (blacklistModal) {
            setBlacklistModal(false);
        } else {
            setBlacklistModal(true);
        }
    }

    const getSelectedTheme = async () => {
        const theme = await getSaveTheme();

        if (theme == 'light') {
            setSelectedTheme(1);
        } else if (theme == 'dark') {
            setSelectedTheme(2);
        } else if (theme == 'system') {
            setSelectedTheme(3);
        }
    }

    const getSelectedLanguage = async () => {
        const language = await getSaveLanguage();

        if (language == 'system') {
            setSelectedLanguage(1);
        } else if (language == 'english') {
            setSelectedLanguage(2);
        } else if (language == 'spanish') {
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

    const goConfigMyPerfil = async () => {
        try {
            const docRef = doc(database, "users", localUserLogin.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists) {
                userData.id = localUserLogin.id;
                userData.avatar = await fetchImage(docSnap.data().avatar);
                userData.banner = await fetchImage(docSnap.data().banner);
                userData.name = docSnap.data().name;
                userData.username = docSnap.data().username;
                userData.details = docSnap.data().details;
                userData.country = docSnap.data().country;
                userData.city = docSnap.data().city;

                props.navigation.navigate('ConfigPerfil');
            } else {
                Alert.alert(t('errorTitle'), t('error'));
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('errorTitle'), t('error'));
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background, paddingLeft: 15, paddingRight: 15 }}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }} onPress={goBackAgain}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.text, }}>{t('configLabel')}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 16, backgroundColor: colors.primary_dark, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 24, marginRight: 7 }} name='magnify' />
                <TextInput
                    style={{ color: colors.text, fontSize: 17, fontWeight: 'bold', width: '90%' }}
                    placeholder={t('searchPlaceHolder')}
                    placeholderTextColor={colors.holderText}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 11, marginHorizontal: 2 }} onPress={() => selectConfig(item.id)}>
                        <MaterialCommunityIcons name={item.icon} size={28} style={{ color: item.id < 6 ? colors.text : colors.text_error, marginRight: 5 }} />
                        <Text style={{ fontSize: 17, color: item.id < 6 ? colors.text : colors.text_error }}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Modal sobre la configuración del tema */}
            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 150,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={configTheme} onClosed={openModalTheme} coverScreen={true}>
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 10 }}></View>
                </View>
                <RadioGroup
                    containerStyle={{ alignItems: 'flex-start' }}
                    radioButtons={radioButtons}
                    onPress={setNewTheme}
                    selectedId={selectedTheme}
                    labelStyle={{ color: colors.text, fontSize: 18 }}
                />
            </Modal>

            {/* Modal sobre la configuración del idioma */}
            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 150,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={configLanguage} onClosed={openModalLanguage} coverScreen={true}>
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary, marginBottom: 15 }}></View>
                </View>
                <RadioGroup
                    containerStyle={{ alignItems: 'flex-start' }}
                    radioButtons={radioButtonsLanguage}
                    onPress={setNewLanguage}
                    selectedId={selectedLanguage}
                    labelStyle={{ color: colors.text, fontSize: 18 }}
                />
            </Modal>

            {/* Modal sobre los usuarios bloqueados */}
            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 20,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'flex-start'
            }} position={"bottom"} isOpen={blacklistModal} coverScreen={true} swipeToClose={false}>
                <View style={{ alignItems: 'flex-start', width: '100%', marginBottom: 20 }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }} onPress={openModalBlacklist}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.primary }} name='chevron-left' />
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>{t('blockUserTitle')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'flex-start', width: '100%' }}>
                    {blacklistUsers.length != 0 ?
                        <FlatList
                            data={blacklistUsers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View style={{ flexDirection: "row", width: "100%", marginBottom: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: "row", alignItems: 'center' }} onPress={() => selectConfig(item.id)}>
                                        <Image style={{ height: 45, width: 45, borderRadius: 50, marginRight: 10 }} source={item.avatar != null ? { uri: item.avatar } : require('../../assets/avatar-default.png')} />
                                        <View>
                                            <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.secondary }}>{item.name}</Text>
                                            <Text style={{ fontSize: 16, color: colors.primary }}>@{item.username}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{ flexDirection: "row", paddingVertical: 8, minWidth: 110, justifyContent: "center", backgroundColor: colors.text_error, borderRadius: 14 }} onPress={() => removeBlockedUser(item.id)}>
                                        <MaterialCommunityIcons style={{ color: colors.text_button, fontSize: 20, marginRight: 6 }} name='account-minus-outline' />
                                        <Text style={{ color: colors.text_button, fontSize: 14, fontWeight: "bold" }}>{t('deleteCommon')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        :
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 250, width: '100%' }}>
                            <MaterialCommunityIcons style={{ color: colors.primary_dark_alternative, fontSize: 100, marginBottom: 10 }} name='smart-card-off-outline' />
                            <Text style={{ color: colors.primary_dark_alternative, fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('blockUserEmptyTitle')}</Text>
                            <Text style={{ color: colors.primary_dark_alternative, fontSize: 23, textAlign: "center", }}>{t('blockUserEmpty')}</Text>
                        </View>
                    }
                </View>
            </Modal>
        </View>
    );
}