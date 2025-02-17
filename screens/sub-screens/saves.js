import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Publication from '../components/Publish';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { database } from '../../utils/database';
import { doc, getDoc } from 'firebase/firestore';
import { isWasInteracted, isWasInteractedByID, isWasCommented, isWasSaved } from '../../utils/interations';

import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Saves(props) {

    const [savePublish, setSavePublish] = useState([]);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        getSavesPublish();
    }, [])

    function goBackAgain() {
        props.navigation.goBack()
    }

    const getSavesPublish = async () => {
        let saves = [];

        if (props.route.params?.saves.length != 0) {
            for (let x = 0; x < props.route.params?.saves.length; x++) {
                const docRef = doc(database, "publications", props.route.params?.saves[x]);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    saves.push({
                        id: docSnap.id,
                        body: docSnap.data().body,
                        urlImage: docSnap.data().urlImage,
                        replyID: docSnap.data().replyID,
                        userId: docSnap.data().userId,
                        comments: docSnap.data().comments,
                        comments_container: docSnap.data().comments_container,
                        date: docSnap.data().date,
                        likes: docSnap.data().likes,
                        shares: docSnap.data().shares
                    })
                }
            }
            setSavePublish(saves);
        }

    }

    return (
        <View style={{ backgroundColor: colors.background, padding: 15 }}>
            <ScrollView>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }} onPress={goBackAgain}>
                    <MaterialCommunityIcons style={{ fontSize: 45, color: colors.text }} name='chevron-left' />
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>{t('saved')}</Text>
                </TouchableOpacity>

                {savePublish.length == 0 ?
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 250 }}>
                        <MaterialCommunityIcons style={{ color: colors.primary_dark_alternative, fontSize: 80, marginBottom: 10 }} name='book-off-outline' />
                        <Text style={{ color: colors.primary_dark_alternative, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('noSavesTitle')}</Text>
                        <Text style={{ color: colors.primary_dark_alternative, fontSize: 18, textAlign: "center", }}>{t('noSaves')}</Text>
                    </View>
                    :
                    savePublish.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isComment={isWasCommented(publication.comments_container)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)
                }
            </ScrollView>
        </View>
    );
}
