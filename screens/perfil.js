import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import Modal from 'react-native-modalbox';
import { useTheme } from '@react-navigation/native';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { convertDateLarge } from "../utils/convertDate";
import { userData } from "./sub-screens/configPerfil";
import UserList from "./components/userList";

import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../utils/database';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess, isWasInteracted, isWasCommented, isWasSaved } from "../utils/interations";
import { localUserLogin } from "../utils/localstorage";

import '../i18n/i18n';
import { useTranslation } from 'react-i18next';

export default function Perfil(props) {
    const [userArray, setUserArray] = useState({
        avatar: null,
        details: "",
        email: "",
        followers: [],
        following: [],
        name: "",
        username: "",
        wasCreated: "",
        city: "",
        country: "",
        banner: null
    });
    const [publications, setPublications] = useState([]);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isFollowedYou, setIsFollowedYou] = useState(false);
    const [avatarURI, setAvatarURI] = useState(null);
    const [bannerURL, setBannerURL] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myPerfil, setMyPerfil] = useState(false);

    const [followsCount, setFollowsCount] = useState(0);
    const [followingsCount, setFollowingsCount] = useState(0);

    const [followersList, setFollowersList] = useState(false);
    const [followingsList, setFollowingsList] = useState(false);
    const [optionsPerfil, setOptionsPerfil] = useState(false);

    const { colors } = useTheme();
    const { t } = useTranslation();

    useEffect(() => {
        getUserData();
        getPublishData();
    }, [])

    const fetchImage = async (urlImages, isAvatar) => {
        const storage = getStorage();
        const imageRef = ref(storage, urlImages);
        const url = await getDownloadURL(imageRef);

        if (isAvatar) {
            setAvatarURI(url);
        } else {
            setBannerURL(url);
        }
    }

    function openFollowersList() {
        if (userArray.followers.length > 0) {
            if (followersList) {
                setFollowersList(false);
            } else {
                setFollowersList(true);
            }
        }
    }

    function openFollowingList() {
        if (userArray.following.length > 0) {
            if (followingsList) {
                setFollowingsList(false);
            } else {
                setFollowingsList(true);
            }
        }
    }

    function openOptionsList() {
        if (optionsPerfil) {
            setOptionsPerfil(false);
        } else {
            setOptionsPerfil(true);
        }
    }

    function goBack() {
        props.navigation.goBack()
    }

    const getUserData = async () => {
        try {
            const docRef = doc(database, "users", props.route.params?.userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (docSnap.data().avatar != null) {
                    fetchImage(docSnap.data().avatar, true);
                }
                if (docSnap.data().banner != null) {
                    fetchImage(docSnap.data().banner, false);
                }
                if (docSnap.data().username === localUserLogin.username) {
                    setMyPerfil(true);
                }

                setFollowsCount(docSnap.data().followers.length);
                setFollowingsCount(docSnap.data().following.length);
                setIsFollowed(isWasInteractedByID(docSnap.data().followers));
                setIsFollowedYou(isWasInteractedByID(docSnap.data().following));
                setUserArray(docSnap.data());
            } else {
                console.error('Usuario inexistente');
                props.navigation.goBack()
            }
        } catch (error) {
            console.error(error);
            props.navigation.goBack()
        }
    }

    function getPublishData() {
        setLoading(true);
        try {
            const collectionRef = collection(database, 'publications');
            const data = localUserLogin.id == props.route.params?.userId ? [0, 1, 2, 3, 4] : [2, 3, 4];
            const q = query(collectionRef,
                where("userId", "==", props.route.params?.userId),
                where("status", "in", data),
                orderBy('date', 'desc')
            );

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setPublications(
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
                setLoading(false);
            })
            return unsuscribe;
        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const startFollow = async () => {
        setIsFollowed(true);

        const res = await startFollowProcess(props.route.params?.userId, localUserLogin.id);

        if (res == false) {
            setIsFollowed(false);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }


    const stopFollow = async () => {
        setIsFollowed(false);

        const res = await stopFollowProcess(props.route.params?.userId, localUserLogin.id);

        if (res) {
            setOptionsPerfil(false);
        } else {
            setIsFollowed(true);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    const deleteFollower = async () => {
        setIsFollowedYou(false);

        const res = await deleteFollowerProcess(props.route.params?.userId, localUserLogin.id);

        if (res) {
            setOptionsPerfil(false);
        } else {
            setIsFollowed(true);
            Alert.alert(t('serverErrorTitle'), t('serverError'));
        }
    }

    function goConfigMyPerfil() {
        if (props.route.params?.userId == localUserLogin.id) {
            userData.id = props.route.params?.userId;
            userData.avatar = avatarURI;
            userData.banner = bannerURL;
            userData.name = userArray.name;
            userData.username = userArray.username;
            userData.details = userArray.details;
            userData.country = userArray.country;
            userData.city = userArray.city;

            props.navigation.navigate('ConfigPerfil');
        }
    }

    return (
        <ScrollView style={{ flex: 1, flexGrow: 1, backgroundColor: colors.background }}>
            <TouchableOpacity style={styles.back_button} onPress={goBack}>
                <MaterialCommunityIcons style={styles.back_button_label} name='chevron-left' />
            </TouchableOpacity>
            {bannerURL != null ?
                <Image style={styles.image_header} source={{ uri: bannerURL }} />
                :
                <View style={{ width: "100%", height: 200, backgroundColor: colors.background }}></View>
            }
            <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../assets/avatar-default.png')} />

            <View style={{ backgroundColor: colors.primary_dark, borderRadius: 10, margin: 10, paddingVertical: 10, paddingHorizontal: 20 }}>
                <View style={styles.interaction_block}>
                    {myPerfil ?
                        <TouchableOpacity onPress={goConfigMyPerfil}>
                            <View style={{ flexDirection: "row", padding: 8, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2 }}>
                                <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 24, marginRight: 10 }} name='pencil' />
                                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}>{t('config')}</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        isFollowed ?
                            <View style={styles.followed}>
                                <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, marginRight: 10 }} name='account-multiple-check' />
                                <Text style={{ color: colors.tertiary, fontSize: 16, fontWeight: "bold" }}>{t('following')}</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={startFollow}>
                                <View style={{ flexDirection: "row", padding: 8, borderColor: colors.primary, borderWidth: 2, borderRadius: 10, outlineStyle: "solid", outlineWidth: 2 }}>
                                    <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 24, marginRight: 10 }} name='account-multiple-plus-outline' />
                                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}>{t('follow')}</Text>
                                </View>
                            </TouchableOpacity>
                    }

                    {isFollowed || isFollowedYou ?
                        <TouchableOpacity onPress={openOptionsList}>
                            <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 30, marginLeft: 18 }} name='dots-horizontal' />
                        </TouchableOpacity>
                        :
                        <View></View>
                    }
                </View>

                <Text style={{ color: colors.secondary, fontSize: 24, fontWeight: "bold", marginTop: 10, marginBottom: 5 }}>{userArray.name}</Text>
                {isFollowedYou ?
                    <View style={styles.nickname_footer}>
                        <Text style={{ color: colors.tertiary, fontSize: 16, fontWeight: "bold" }}>@{userArray.username}</Text>
                        <MaterialCommunityIcons style={{ color: colors.tertiary, fontSize: 24, marginLeft: 10 }} name='account-star-outline' />
                        <Text style={{ color: colors.tertiary, fontSize: 18, fontWeight: "bold" }}>{t('followingYou')}</Text>
                    </View>
                    :
                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}>@{userArray.username}</Text>
                }

                <Text style={{ color: colors.text, fontSize: 15, textAlign: "justify", marginTop: 10 }}>{userArray.details}</Text>

                <View style={styles.follows_block}>
                    <TouchableOpacity onPress={openFollowersList}>
                        <View style={styles.follows_part}>
                            <Text style={{ color: colors.text, fontSize: 19, fontWeight: "bold", marginRight: 5 }}>{followsCount}</Text>
                            <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: "bold" }}>{t('followers')}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ backgroundColor: colors.secondary, height: 26, width: 2.5 }} />
                    <TouchableOpacity onPress={openFollowingList}>
                        <View style={styles.follows_part}>
                            <Text style={{ color: colors.text, fontSize: 19, fontWeight: "bold", marginRight: 5 }}>{followingsCount}</Text>
                            <Text style={{ color: colors.secondary, fontSize: 15, fontWeight: "bold" }}>{t('following')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.basicInfo}>
                <View style={styles.basicInfo_block}>
                    <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20, marginRight: 5 }} name='map-marker-outline' />
                    <Text style={{ color: colors.secondary, fontSize: 14 }}>{userArray.city}</Text>
                    <Text style={{ color: colors.secondary, fontSize: 14 }}>, </Text>
                    <Text style={{ color: colors.secondary, fontSize: 14 }}>{userArray.country}</Text>
                </View>
                <View style={styles.basicInfo_block}>
                    <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20, marginRight: 5 }} name='calendar-account-outline' />
                    <Text style={{ color: colors.secondary, fontSize: 14 }}>{t('createdDate')}{convertDateLarge(userArray.wasCreated)}</Text>
                </View>
            </View>

            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color={colors.primary} size={80} style={styles.loading_spiner} />
                    <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "bold" }}>{t('loading')}</Text>
                </View>
                :
                publications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={{ color: colors.primary, fontSize: 80, marginBottom: 10 }} name='book-open-page-variant-outline' />
                        <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>{t('noPublish')}</Text>
                    </View>
                    :
                    <View style={{ marginHorizontal: 15 }}>
                        {/* {publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isComment={isWasCommented(publication.comments_container)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)} */}
                        {publications.map(publication => <Publication key={publication.id} props={props} isLike={isWasInteracted(publication.likes)} isShared={isWasInteractedByID(publication.shares)} wasSaved={isWasSaved(publication.id)} {...publication} />)}
                    </View>
            }

            <Modal style={{
                alignItems: "center",
                padding: 20,
                maxHeight: 700,
                borderTopRightRadius: 40,
                borderTopLeftRadius: 40,
                backgroundColor: colors.primary_dark
            }} position={"bottom"} isOpen={followersList} onClosed={openFollowersList} coverScreen={true}>
                <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary }}></View>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold", marginVertical: 15, fontSize: 16, fontWeight: 'bold' }}>{t('followers')}</Text>

                <ScrollView>
                    {userArray.followers.map((follower, key) => (<UserList key={key} props={props} idUser={follower} list_owner={userArray.username} followType={0} />))}
                </ScrollView>
            </Modal>

            <Modal style={{
                alignItems: "center",
                padding: 20,
                maxHeight: 700,
                borderTopRightRadius: 40,
                borderTopLeftRadius: 40,
                backgroundColor: colors.primary_dark
            }} position={"bottom"} isOpen={followingsList} onClosed={openFollowingList} coverScreen={true}>
                <View style={{ height: 5, width: 100, borderRadius: 5, backgroundColor: colors.primary }}></View>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold", marginVertical: 15, fontSize: 16, fontWeight: 'bold' }}>{t('following')}</Text>

                <ScrollView>
                    {userArray.following.map((following, key) => (<UserList key={key} props={props} idUser={following} list_owner={userArray.username} followType={1} />))}
                </ScrollView>
            </Modal>

            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 175,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.background
            }} position={"bottom"} isOpen={optionsPerfil} onClosed={openOptionsList} coverScreen={true}>
                {isFollowed ?
                    <TouchableOpacity style={styles.modalButton} onPress={stopFollow}>
                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.primary, marginRight: 15 }} name='account-minus-outline' />
                        <Text style={{ fontSize: 17, color: colors.primary, fontWeight: "bold" }}>{t('stopFollow')}</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                {isFollowedYou ?
                    <TouchableOpacity style={styles.modalButton} onPress={deleteFollower}>
                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.primary, marginRight: 15 }} name='account-minus-outline' />
                        <Text style={{ fontSize: 17, color: colors.primary, fontWeight: "bold" }}>{t('deleteFollower')}</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                <TouchableOpacity style={styles.modalButton} onPress={openOptionsList}>
                    <MaterialCommunityIcons style={{ fontSize: 30, color: colors.primary, marginRight: 15 }} name='window-close' />
                    <Text style={{ fontSize: 17, color: colors.primary, fontWeight: "bold" }}>{t('close')}</Text>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    back_button: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1,
        backgroundColor: "black",
        borderRadius: 100
    },
    back_button_label: {
        fontSize: 50,
        color: "white"
    },
    image_header: {
        width: "100%",
        height: 200
    },
    avatar: {
        position: "absolute",
        top: 170,
        left: 30,
        height: 90,
        width: 90,
        borderRadius: 50,
        zIndex: 1
    },
    interaction_block: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    followed: {
        flexDirection: "row",
        marginVertical: 10
    },
    nickname_footer: {
        flexDirection: "row"
    },
    basicInfo: {
        marginLeft: 10
    },
    basicInfo_block: {
        marginVertical: 5,
        flexDirection: "row"
    },
    follows_block: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "space-around",
        alignItems: "center"
    },
    follows_part: {
        flexDirection: "row",
        alignItems: "center"
    },
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 300
    },
    loading_spiner: {
        height: 90,
        width: 90
    },
    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10
    }
})