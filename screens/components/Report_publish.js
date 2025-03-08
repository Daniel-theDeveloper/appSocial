import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';

import { localUserLogin } from './../../utils/localstorage';
import { getDocs, collection, addDoc } from 'firebase/firestore';
import { database } from './../../utils/database';

import Octicons from "react-native-vector-icons/Octicons";

import { useTheme } from '@react-navigation/native';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Report_publish({ publishId, userId }) {
    const [selectReason, setSelectReason] = useState(1);
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [wasSend, setWasSend] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        wasReport();
    }, []);

    const wasReport = async () => {
        try {
            const reportsRef = collection(database, 'reports');
            const querySnapshot = await getDocs(reportsRef);
            querySnapshot.forEach((doc) => {
                if (doc.data().reported_post_id == publishId && doc.data().reporting_user_id == localUserLogin.id) {
                    setWasSend(true);
                }
            });
        } catch (error) {
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const radioButtons = useMemo(() => ([
        {
            id: 1,
            label: t('reportType1'),
            value: 1,
            color: colors.primary
        },
        {
            id: 2,
            label: t('reportType2'),
            value: 2,
            color: colors.primary
        },
        {
            id: 3,
            label: t('reportType3'),
            value: 3,
            color: colors.primary
        },
        {
            id: 4,
            label: t('reportType4'),
            value: 4,
            color: colors.primary
        },
        {
            id: 5,
            label: t('reportType5'),
            value: 5,
            color: colors.primary
        },
    ]), []);

    function pressSelectReason(e) {
        setSelectReason(e);
    }

    const sendReport = async () => {
        setLoading(true);
        try {
            const report = {
                reported_post_id: publishId,
                reported_user_id: userId,
                reporting_user_id: localUserLogin.id,
                reason: selectReason,
                additional_info: details,
                created: new Date(),
                status: 0,
                resolution: null
            }

            await addDoc(collection(database, 'reports'), report);

            setLoading(false);
            setWasSend(true);
        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    return (
        <View style={{
            width: "100%"
        }}>
            {!wasSend ?
                /* Caso aun no se reporto */
                <View style={styles.container}>
                    <Octicons style={{ color: colors.primary, fontSize: 95 }} name='report' />
                    <Text style={{ color: colors.primary_dark_alternative, fontSize: 25, fontWeight: 'bold', marginBottom: 30 }}>{t('report')}</Text>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t('reportAsk1')}</Text>
                    <RadioGroup
                        containerStyle={{ alignItems: 'flex-start', width: "100%", marginBottom: 15 }}
                        radioButtons={radioButtons}
                        onPress={pressSelectReason}
                        selectedId={selectReason}
                        labelStyle={{ color: colors.text, fontSize: 18 }}
                    />
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{t('reportAsk2')}</Text>
                    <TextInput
                        style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "100%",
                            height: 100,
                            borderColor: colors.primary,
                            borderWidth: 2,
                            borderRadius: 10,
                            padding: 10,
                            margin: 10,
                            fontSize: 17,
                            color: colors.primary
                        }}
                        multiline={true}
                        numberOfLines={4}
                        placeholder={t('reportPlaceHolder')}
                        onChangeText={setDetails}
                        value={details} />

                    {details.length <= 0 ?
                        <View style={{ marginTop: 35, backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>{t('reportButton')}</Text>
                        </View>
                        :
                        loading ?
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 35, backgroundColor: colors.secondary_dark, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }}>
                                <ActivityIndicator size="small" color={colors.loadingSpinner} />
                                <Text style={{ marginLeft: 5, color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>{t('loading')}</Text>
                            </View>
                            :
                            <TouchableOpacity style={{ marginTop: 35, backgroundColor: colors.secondary, borderRadius: 30, width: 100, paddingVertical: 10, width: '100%' }} onPress={sendReport}>
                                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>{t('reportButton')}</Text>
                            </TouchableOpacity>
                    }
                </View>
                :
                /* Caso ya se reporto */
                <View style={styles.container}>
                    <Octicons style={{ color: colors.primary, fontSize: 95 }} name='shield-check' />
                    <Text style={{ color: colors.primary_dark_alternative, fontSize: 25, fontWeight: 'bold', marginBottom: 30 }}>{t('wasReportTitle')}</Text>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t('wasReport')}</Text>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%"
    }
})