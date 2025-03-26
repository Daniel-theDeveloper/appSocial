import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';
import Publication from './components/Publish';
import { localUserLogin } from '../utils/localstorage';
import { isWasInteracted, isWasInteractedByID, isWasCommented, isWasSaved } from '../utils/interations';

import { database } from '../utils/database';
import { collection, where, query, onSnapshot, orderBy } from 'firebase/firestore';

import '../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Trending(props) {
    const [allPublish, setAllPublish] = useState([]);
    const [publications, setPublications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const { colors } = useTheme();

    const { t } = useTranslation();

    useEffect(() => {
        loadAllPublish();
    }, []);

    function loadAllPublish() {
        const collectionRef = collection(database, 'publications');
        // const q = query(collectionRef, where('userId', '!=', localUserLogin.id));
        const q = query(collectionRef, where("status", "in", [2, 3, 4]), orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, QuerySnapshot => {
            setAllPublish(
                QuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    body: doc.data().body,
                    urlImages: doc.data().urlImages,
                    replyID: doc.data().replyID,
                    status: doc.data().status,
                    author: doc.data().author,
                    // comments_container: await searchMyComment(doc.id),
                    date: doc.data().date,
                    likes: doc.data().likes,
                    shares: doc.data().shares,
                    userId: doc.data().userId
                }))
            )
        });
        setPublications(allPublish);
        setLoading(false);
        return unsubscribe;
    }

    const startSearch = async () => {
        setLoading(true);
        try {
            const filteredPublish = allPublish.filter((item) => {
                const itemData = `${item.body.toLowerCase()}`;
                const toSearch = searchText.toLowerCase();

                return itemData.includes(toSearch);
            });
            setPublications(filteredPublish);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background, paddingLeft: 15, paddingRight: 15 }}>
            <ScrollView>
                <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 20, backgroundColor: colors.primary_dark, borderRadius: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 1, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                    <TextInput style={{ color: colors.text }} placeholder={t('searchPlaceHolder')} placeholderTextColor={colors.holderText} onChangeText={(text) => setSearchText(text)} autoCorrect={false} editable={loading ? false : true} />
                </View>

                {loading ?
                    <View style={{
                        alignItems: 'center',
                        backgroundColor: colors.quartet_dark,
                        borderRadius: 10,
                        marginVertical: 10,
                        padding: 10,
                        width: "100%",
                        shadowColor: 'black',
                        shadowOpacity: 0.55,
                        shadowRadius: 4,
                        elevation: 5,
                        shadowOffset: {
                            width: 10,
                            height: 10
                        }
                    }}>
                        <Text>{t('search')}</Text>
                    </View>
                    :
                    <TouchableOpacity onPress={startSearch} style={{
                        alignItems: 'center',
                        backgroundColor: colors.quartet,
                        borderRadius: 10,
                        marginVertical: 10,
                        padding: 10,
                        width: "100%",
                        shadowColor: 'black',
                        shadowOpacity: 0.55,
                        shadowRadius: 4,
                        elevation: 5,
                        shadowOffset: {
                            width: 10,
                            height: 10
                        }
                    }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>{t('searchButton')}</Text>
                    </TouchableOpacity>
                }

                {loading ?
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 500 }}>
                        <ActivityIndicator color={colors.loading} style={{ marginBottom: 10 }} size={60} />
                        <Text style={{ color: colors.primary, fontSize: 18, textAlign: "center" }}>{t('searchStart')}</Text>
                    </View>
                    :
                    publications.length <= 0 ?
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", height: 500 }}>
                            <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 80, marginBottom: 10 }} name='magnify-scan' />
                            <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('notFound')}</Text>
                            <Text style={{ color: colors.primary, fontSize: 18, textAlign: "center" }}>{t('notFoundHelp')}</Text>
                        </View>
                        :
                        publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)
                }

            </ScrollView>
        </View>
    );
}