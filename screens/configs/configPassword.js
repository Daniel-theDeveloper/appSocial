import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { localUserLogin } from '../../utils/localstorage';
import ChangePassword from '../../utils/changePassword';

import '../../i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export default function ConfigPassword(props) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    const [hideOldPassword, setHideOldPassword] = useState(true);
    const [hidePassword, setHidePassword] = useState(true);
    const [hideRepeatPassword, setHideRepeatPassword] = useState(true);

    const [loading, setLoading] = useState(false);

    function goBackAgain() {
        props.navigation.goBack()
    }

    function setOldPasswordStatus() {
        if (hideOldPassword) {
            setHideOldPassword(false);
        } else {
            setHideOldPassword(true);
        }
    }

    function setPasswordStatus() {
        if (hidePassword) {
            setHidePassword(false);
        } else {
            setHidePassword(true);
        }
    }

    function setRepeatPasswordStatus() {
        if (hideRepeatPassword) {
            setHideRepeatPassword(false);
        } else {
            setHideRepeatPassword(true);
        }
    }

    const tryChangePassword = async () => {
        setLoading(true);

        const res = await ChangePassword(oldPassword, newPassword);

        if (res) {
            goBackAgain();
            Alert.alert(t('changePasswordSuccess'));
        } else {
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background, paddingLeft: 15, paddingRight: 15 }}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }} onPress={goBackAgain}>
                <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.text, }}>{t('optionPassword')}</Text>
            </TouchableOpacity>

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
                <Text style={{ marginBottom: 10, marginLeft: 14, fontSize: 18, fontWeight: 'bold', color: colors.text }}>{t('oldPassword')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 14,
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
                        <TextInput placeholder={t('placeholderPassword')} placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, width: '90%' }} onChangeText={(text) => setOldPassword(text)} secureTextEntry={hideOldPassword} autoCorrect={false} />
                        {hideOldPassword ?
                            <TouchableOpacity onPress={setOldPasswordStatus}>
                                <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.primary_dark_alternative }} name='eye-off-outline' />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={setOldPasswordStatus}>
                                <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.secondary }} name='eye' />
                            </TouchableOpacity>
                        }
                    </View>
                </View>

                <Text style={{ marginBottom: 10, marginTop: 20, marginLeft: 14, fontSize: 18, fontWeight: 'bold', color: colors.text }}>{t('newPassword')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 14,
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
                        <TextInput placeholder={t('placeholderPassword')} placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, width: '90%' }} onChangeText={(text) => setNewPassword(text)} secureTextEntry={hidePassword} autoCorrect={false} />
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
                </View>
                {newPassword.length >= 6 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-check' />
                        <Text style={{ color: colors.tertiary, fontSize: 14, fontWeight: 'bold' }}>{t('passwordLengthError')}</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-alert-outline' />
                        <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold' }}>{t('passwordLength')}</Text>
                    </View>
                }

                <Text style={{ marginTop: 20, marginBottom: 10, marginLeft: 14, fontSize: 18, fontWeight: 'bold', color: colors.text }}>{t('repeatPassword')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 14,
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
                        <TextInput placeholder={t('repeatPlaceHolder')} placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, width: '90%' }} onChangeText={(text) => setPasswordConfirm(text)} secureTextEntry={hideRepeatPassword} autoCorrect={false} />
                        {hideRepeatPassword ?
                            <TouchableOpacity onPress={setRepeatPasswordStatus}>
                                <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.primary_dark_alternative }} name='eye-off-outline' />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={setRepeatPasswordStatus}>
                                <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.secondary }} name='eye' />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                {newPassword == passwordConfirm && newPassword.length > 0 && oldPassword.length > 0 ?
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-check' />
                        <Text style={{ color: colors.tertiary, fontSize: 14, fontWeight: 'bold' }}>{t('passwordOk')}</Text>
                    </View>
                    :
                    <View style={styles.password_message_block}>
                        <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-alert-outline' />
                        <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold' }}>{t('passwordNo')}</Text>
                    </View>
                }

                {newPassword == passwordConfirm && newPassword.length >= 6 ?
                    loading ?
                        <View style={{ marginVertical: 15, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                            <ActivityIndicator color={colors.loading} style={styles.loadingSpinner} />
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('loading')}</Text>
                        </View>
                        :
                        <TouchableOpacity style={{ marginVertical: 15, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={tryChangePassword}>
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('optionPassword')}</Text>
                        </TouchableOpacity>
                    :
                    <View style={{ marginVertical: 15, backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                        <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{t('optionPassword')}</Text>
                    </View>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    password_message_block: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center'
    }
})