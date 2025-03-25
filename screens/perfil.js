import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import Modal from 'react-native-modalbox';
import { useTheme } from '@react-navigation/native';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { convertDateLarge } from "../utils/convertDate";
import { userData } from "./configs/configPerfil";
import UserList from "./components/userList";

import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../utils/database';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess, isWasInteracted, isWasCommented, isWasSaved, addBlockUser } from "../utils/interations";
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
    const [isBlock, setIsBlock] = useState(localUserLogin.blackList.includes(props.route.params?.userId) || localUserLogin.blockUsers.includes(props.route.params?.userId));

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

    const showBlockUser = () =>
        Alert.alert(
            t('blockUser'),
            t('blockUserAsk'),
            [
                {
                    text: t('no'),
                },
                {
                    text: t('yes'),
                    onPress: () => blockUser(),
                    style: 'cancel',
                }
            ]
        );

    useEffect(() => {
        getUserData();

        if (!isBlock) {
            getPublishData();
        } else {
            setLoading(false);
        }
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
        if (!isBlock) {
            if (userArray.followers.length > 0) {
                if (followersList) {
                    setFollowersList(false);
                } else {
                    setFollowersList(true);
                }
            }
        }
    }

    function openFollowingList() {
        if (!isBlock) {
            if (userArray.following.length > 0) {
                if (followingsList) {
                    setFollowingsList(false);
                } else {
                    setFollowingsList(true);
                }
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
                if (!isBlock) {
                    if (docSnap.data().avatar != null) {
                        fetchImage(docSnap.data().avatar, true);
                    }
                    if (docSnap.data().banner != null) {
                        fetchImage(docSnap.data().banner, false);
                    }
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

            const unsubscribe = onSnapshot(q, QuerySnapshot => {
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
            return unsubscribe;
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

    const blockUser = async () => {
        const res = await addBlockUser(userId);

        if (res) {
            Alert.alert(t('blockUserHelp'));
            setIsBlock(true);
        } else {
            Alert.alert(t('errorTitle'), t('error'));
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
                <View style={{ width: "100%", height: 100, backgroundColor: colors.background }}></View>
            }
            <Image style={bannerURL != null ? styles.avatar_with_banner : styles.avatar_without_banner} source={avatarURI != null ? { uri: avatarURI } : require('../assets/avatar-default.png')} />

            <View style={{ backgroundColor: colors.primary_dark, borderRadius: 10, margin: 10, paddingVertical: 10, paddingHorizontal: 20 }}>
                <View style={styles.interaction_block}>
                    {isBlock ?
                        <View style={{ height: 44 }}></View>
                        :
                        myPerfil ?
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
                    <Text style={{ color: colors.tertiary, fontSize: 16, fontWeight: "bold" }}>@{userArray.username} {t('followingYou')}</Text>
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
                {userArray.city != null ?
                    <View style={styles.basicInfo_block}>
                        <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20, marginRight: 5 }} name='map-marker-outline' />
                        <Text style={{ color: colors.secondary, fontSize: 14 }}>{userArray.city}</Text>
                        <Text style={{ color: colors.secondary, fontSize: 14 }}>, </Text>
                        <Text style={{ color: colors.secondary, fontSize: 14 }}>{userArray.country}</Text>
                    </View>
                    :
                    <View style={styles.basicInfo_block}>
                        <MaterialCommunityIcons style={{ color: colors.secondary, fontSize: 20, marginRight: 5 }} name='map-marker-outline' />
                        <Text style={{ color: colors.secondary, fontSize: 14 }}>{userArray.country}</Text>
                    </View>
                }
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
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 15 }}>{t('followersOf')} @{userArray.username}</Text>

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
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 15 }}>{t('followersOf')} @{userArray.username}</Text>

                <ScrollView>
                    {userArray.following.map((following, key) => (<UserList key={key} props={props} idUser={following} list_owner={userArray.username} followType={1} />))}
                </ScrollView>
            </Modal>

            <Modal style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                maxHeight: 225,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                backgroundColor: colors.primary_dark
            }} position={"bottom"} isOpen={optionsPerfil} coverScreen={true}>
                {isFollowed ?
                    <TouchableOpacity style={styles.modalButton} onPress={stopFollow}>
                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 15 }} name='account-minus-outline' />
                        <Text style={{ fontSize: 17, color: colors.text, fontWeight: "bold" }}>{t('stopFollow')}</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                {isFollowedYou ?
                    <TouchableOpacity style={styles.modalButton} onPress={deleteFollower}>
                        <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text, marginRight: 15 }} name='account-minus-outline' />
                        <Text style={{ fontSize: 17, color: colors.text, fontWeight: "bold" }}>{t('deleteFollower')}</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                {!isBlock ?
                    <TouchableOpacity style={styles.modalButton} onPress={showBlockUser}>
                        <FontAwesome5 style={{ fontSize: 22, color: colors.text, marginRight: 10 }} name='user-slash' />
                        <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>{t('blockUser')}</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                <TouchableOpacity style={styles.modalButton} onPress={openOptionsList}>
                    <MaterialCommunityIcons style={{ fontSize: 30, color: colors.text_error, marginRight: 15 }} name='window-close' />
                    <Text style={{ fontSize: 17, color: colors.text_error, fontWeight: "bold" }}>{t('close')}</Text>
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
    avatar_with_banner: {
        position: "absolute",
        top: 170,
        left: 30,
        height: 90,
        width: 90,
        borderRadius: 50,
        zIndex: 1
    },
    avatar_without_banner: {
        position: "absolute",
        top: 77,
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