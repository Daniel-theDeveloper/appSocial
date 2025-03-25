import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, database } from '../../utils/database';
import { collection, doc, deleteDoc, getDocs, setDoc, query, where, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import { localUserLogin, erase_all } from '../../utils/localstorage';

export default function DeleteAccount(props) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [userUnderstand, setUserUnderstand] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [hidePassword, setHidePassword] = useState(true);

    const showAlert = () =>
        Alert.alert(
            t('deleteAccountWarningTitle'),
            t('deleteAccountWarning'),
            [
                {
                    text: t('no'),
                    onPress: () => goBackAgain()
                },
                {
                    text: t('yes'),
                    onPress: () => deleteProcess(),
                    style: 'cancel',
                },
            ],
        );

    function goBackAgain() {
        props.navigation.goBack();
    }

    const reauthenticateUser = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                return false;
            } else {
                const credentials = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credentials);

                return true;
            }
        } catch (error) {
            console.error(error);
            setPasswordError(true);
            setLoading(false);
            return false;
        }
    }

    const deleteProcess = async () => {
        try {
            setPasswordError(false);
            setLoading(true);

            const authRes = await reauthenticateUser();

            if (authRes) {
                // Proceso de eliminación de las publicaciones
                const batch = writeBatch(database);
                const q = query(collection(database, "publications"), where("userId", "==", localUserLogin.id));
                const publishSnapshot = await getDocs(q);
    
                publishSnapshot.forEach((publish) => {
                    const url = "archived/" + localUserLogin.id + "/publications";
    
                    const docData = publish.data();
                    const deleteDocRef = doc(database, url, publish.id);
    
                    // Archivando publicación
                    batch.set(deleteDocRef, {
                        ...docData, deleted_at: serverTimestamp()
                    });
                    // Eliminando de la colección publica
                    batch.delete(publish.ref);
                });
    
                // Proceso de la eliminación de los datos del usuario
                const docRef = doc(database, "users", localUserLogin.id);
                const docSnap = await getDoc(docRef);
    
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const deleteUserRef = doc(database, "archived", localUserLogin.id);
    
                    // Archivando usuario
                    batch.set(deleteUserRef, {
                        ...userData, retired_at: serverTimestamp()
                    });
    
                    // Eliminando usuario de la colección publica
                    batch.delete(docRef);
                } else {
                    console.error("Usuario no encontrado");
                }
    
                // Ejecutando el batch
                await batch.commit();
    
                // Eliminando usuario de Firebase Authentication
                await deleteUser(auth.currentUser);
    
                // Limpiando el usuario de los datos guardados de la app
                await erase_all();
    
                props.navigation.replace('Login');
            }

        } catch (error) {
            Alert.alert(t('serverErrorTitle'), t('serverError'));
            setLoading(false);
            console.error(error);
            goBackAgain();
        }
    }

    return (
        <View style={{ alignItems: 'center', backgroundColor: colors.background, paddingVertical: 15, paddingHorizontal: 20, height: '100%' }}>
            {!userUnderstand ?
                <View style={{ height: '100%', width: '100%' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' }} onPress={goBackAgain}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>{t('optionDelete')}</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 200 }}>
                        <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 80, marginBottom: 10 }} name='account-cancel-outline' />
                        <Text style={{ color: colors.text_error, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('deleteAccountTitle')}</Text>
                        <Text style={{ color: colors.text_error, fontSize: 18, textAlign: "center", }}>{t('deleteAccountHelp')}</Text>
                    </View>

                    <View style={styles.points_containers}>
                        <Text style={{ color: colors.primary, marginBottom: 7, fontSize: 18, textAlign: "center", fontWeight: 'bold' }}>{t('takeNote')}</Text>
                        <View style={styles.points}>
                            <View style={{ height: 10, width: 10, margin: 6, backgroundColor: colors.tertiary, borderRadius: 10 }}></View>
                            <Text style={{ color: colors.primary, fontSize: 18 }}>{t('deleteAccountTip1')}</Text>
                        </View>
                        <View style={styles.points}>
                            <View style={{ height: 10, width: 10, margin: 6, backgroundColor: colors.tertiary, borderRadius: 10 }}></View>
                            <Text style={{ color: colors.primary, fontSize: 18 }}>{t('deleteAccountTip2')}</Text>
                        </View>
                        <View style={styles.points}>
                            <View style={{ height: 10, width: 10, margin: 6, backgroundColor: colors.tertiary, borderRadius: 10 }}></View>
                            <Text style={{ color: colors.primary, fontSize: 18 }}>{t('deleteAccountTip3')}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={{ position: 'absolute', bottom: 30, padding: 10, width: '100%', alignItems: 'center', backgroundColor: colors.quartet, borderRadius: 20 }} onPress={() => setUserUnderstand(true)}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{t('optionDelete')}</Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={{ height: '100%', width: '100%' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' }} onPress={goBackAgain}>
                        <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                        <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>{t('optionDelete')}</Text>
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
                        <Text style={{ marginBottom: 10, marginLeft: 14, fontSize: 18, fontWeight: 'bold', color: colors.text }}>{t('confirmPassword')}</Text>
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
                            <TextInput placeholder={t('placeholderPassword')} placeholderTextColor={colors.holderText} style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, width: '90%' }} onChangeText={(text) => setPassword(text)} secureTextEntry={hidePassword} autoCorrect={false} />
                            {hidePassword ?
                                <TouchableOpacity onPress={() => setHidePassword(false)}>
                                    <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.primary_dark_alternative }} name='eye-off-outline' />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => setHidePassword(true)}>
                                    <MaterialCommunityIcons style={{ marginLeft: 5, fontSize: 24, color: colors.secondary }} name='eye' />
                                </TouchableOpacity>
                            }
                        </View>
                        {passwordError ?
                            <View style={styles.password_message_block}>
                                <MaterialCommunityIcons style={{ color: colors.text_error, fontSize: 24, fontWeight: 'bold', marginHorizontal: 7 }} name='shield-alert-outline' />
                                <Text style={{ color: colors.text_error, fontSize: 14, fontWeight: 'bold' }}>{t('passwordError')}</Text>
                            </View>
                            :
                            <View></View>}
                    </View>
                    {password.length < 6 ?
                        <View style={{ position: 'absolute', bottom: 30, padding: 10, width: '100%', alignItems: 'center', backgroundColor: colors.quartet_dark, borderRadius: 20 }} onPress={() => setUserUnderstand(true)}>
                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{t('optionDelete')}</Text>
                        </View>
                        :
                        loading ?
                            <View style={{ flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 30, padding: 10, width: '100%', alignItems: 'center', backgroundColor: colors.quartet_dark, borderRadius: 20 }} onPress={() => setUserUnderstand(true)}>
                                <ActivityIndicator size={'small'} color={colors.secondary} />
                                <Text style={{ color: colors.text, fontWeight: 'bold', marginLeft: 6, fontSize: 18 }}>{t('loading')}</Text>
                            </View>
                            :
                            <TouchableOpacity style={{ position: 'absolute', bottom: 30, padding: 10, width: '100%', alignItems: 'center', backgroundColor: colors.quartet, borderRadius: 20 }} onPress={showAlert}>
                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>{t('optionDelete')}</Text>
                            </TouchableOpacity>
                    }
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    points_containers: {
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 25,
        marginBottom: 50
    },
    points: {
        flexDirection: 'row',
        width: '98%',
        marginBottom: 7
    },
    password_message_block: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center'
    }
})