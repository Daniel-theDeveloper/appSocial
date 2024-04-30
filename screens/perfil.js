import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import Modal from 'react-native-modalbox';

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { convertDateLarge } from "../utils/convertDate";
import { userId } from "./components/Publish";
import { userData } from "./sub-screens/configPerfil";
import UserList from "./components/userList";

import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../utils/database';
import { isWasInteractedByID, startFollowProcess, stopFollowProcess, deleteFollowerProcess } from "../utils/interations";
import { localUserLogin } from "../utils/localstorage";

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

    useEffect(() => {
        getUserData();
        getPublishData();
    }, [])

    const fetchImage = async (urlImage, isAvatar) => {
        const storage = getStorage();
        const imageRef = ref(storage, urlImage);
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

    function getUserData() {
        let data = []
        let getData = []
        const collectionRef = collection(database, 'users');
        const q = query(collectionRef);

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            try {
                QuerySnapshot.docs.map(doc => {
                    data.push({ id: doc.id, data: doc.data() });
                })
                data.find(function (res) {
                    if (res.data['username'] === userId.id) {
                        getData = {
                            id: res.id,
                            avatar: res.data['avatar'],
                            details: res.data['details'],
                            email: res.data['email'],
                            followers: res.data['followers'],
                            following: res.data['following'],
                            name: res.data['name'],
                            username: res.data['username'],
                            wasCreated: res.data['wasCreated'],
                            banner: res.data['banner'],
                            country: res.data['country'],
                            city: res.data['city']
                        }
                    }
                })
                if (getData.avatar != null) {
                    fetchImage(getData.avatar, true);
                }
                if (getData.banner != null) {
                    fetchImage(getData.banner, false);
                }
                if (getData.username === localUserLogin.username) {
                    setMyPerfil(true);
                }
                setFollowsCount(getData.followers.length);
                setFollowingsCount(getData.following.length);
                setIsFollowed(isWasInteractedByID(getData.followers));
                setIsFollowedYou(isWasInteractedByID(getData.following));
                setUserArray(getData);
            } catch (error) {
                console.error(error);
                props.navigation.goBack()
            }
        })
        return unsuscribe;
    }

    function getPublishData() {
        setLoading(true);
        try {
            const collectionRef = collection(database, 'publications');
            const q = query(collectionRef, where("user", "==", userId.id), orderBy('date', 'desc'));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setPublications(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        body: doc.data().body,
                        urlImage: doc.data().urlImage,
                        name: doc.data().user,
                        comments: doc.data().comments,
                        comments_container: doc.data().comments_container,
                        replyID: doc.data().replyID,
                        date: doc.data().date,
                        likes: doc.data().likes,
                        shares: doc.data().shares
                    }))
                )
                setLoading(false);
            })
            return unsuscribe;
        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde")
        }
    }

    const startFollow = async () => {
        setIsFollowed(true);

        const res = await startFollowProcess(userArray.id, localUserLogin.id);

        if (res == false) {
            setIsFollowed(false);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
        }
    }


    const stopFollow = async () => {
        setIsFollowed(false);

        const res = await stopFollowProcess(userArray.id, localUserLogin.id);

        if (res) {
            setOptionsPerfil(false);
        } else {
            setIsFollowed(true);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
        }
    }

    const deleteFollower = async () => {
        setIsFollowedYou(false);

        const res = await deleteFollowerProcess(userArray.id, localUserLogin.id);

        if (res) {
            setOptionsPerfil(false);
        } else {
            setIsFollowed(true);
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
        }
    }

    function goConfigMyPerfil() {
        if (userArray.id == localUserLogin.id) {
            userData.id = userArray.id;
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
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.back_button} onPress={goBack}>
                <MaterialCommunityIcons style={styles.back_button_label} name='chevron-left' />
            </TouchableOpacity>
            {bannerURL != null ?
                <Image style={styles.image_header} source={{ uri: bannerURL }} />
                :
                <View style={styles.noBanner}></View>
            }
            <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../assets/avatar-default.png')} />

            <View style={styles.info_container}>
                <View style={styles.interaction_block}>
                    {myPerfil ?
                        <TouchableOpacity onPress={goConfigMyPerfil}>
                            <View style={styles.followButton}>
                                <MaterialCommunityIcons style={styles.followIcon} name='pencil' />
                                <Text style={styles.followLabel}>Configurar</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        isFollowed ?
                            <View style={styles.followed}>
                                <MaterialCommunityIcons style={styles.followedIcon} name='account-multiple-check' />
                                <Text style={styles.followedLabel}>Siguiendo</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={startFollow}>
                                <View style={styles.followButton}>
                                    <MaterialCommunityIcons style={styles.followIcon} name='account-multiple-plus-outline' />
                                    <Text style={styles.followLabel}>Seguir</Text>
                                </View>
                            </TouchableOpacity>
                    }

                    {isFollowed || isFollowedYou ?
                        <TouchableOpacity onPress={openOptionsList}>
                            <MaterialCommunityIcons style={styles.interaction_options} name='dots-horizontal' />
                        </TouchableOpacity>
                        :
                        <View></View>
                    }
                </View>

                <Text style={styles.nickname}>{userArray.name}</Text>
                {isFollowedYou ?
                    <View style={styles.nickname_footer}>
                        <Text style={styles.username_followYou}>@{userArray.username}</Text>
                        <MaterialCommunityIcons style={styles.icon_followYou} name='account-star-outline' />
                        <Text style={styles.username_followYou}>Te esta siguiendo</Text>
                    </View>
                    :
                    <Text style={styles.username}>{userArray.username}</Text>
                }

                <Text style={styles.info_User}>{userArray.details}</Text>

                <View style={styles.follows_block}>
                    <TouchableOpacity onPress={openFollowersList}>
                        <View style={styles.follows_part}>
                            <Text style={styles.follows_numbers}>{followsCount}</Text>
                            <Text style={styles.follows_label}>Seguidores</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.follows_separator} />
                    <TouchableOpacity onPress={openFollowingList}>
                        <View style={styles.follows_part}>
                            <Text style={styles.follows_numbers}>{followingsCount}</Text>
                            <Text style={styles.follows_label}>Siguiendo</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.basicInfo}>
                <View style={styles.basicInfo_block}>
                    <MaterialCommunityIcons style={styles.basicInfo_icon} name='map-marker-outline' />
                    <Text style={styles.basicInfo_label}>{userArray.city}</Text>
                    <Text style={styles.basicInfo_label}>, </Text>
                    <Text style={styles.basicInfo_label}>{userArray.country}</Text>
                </View>
                <View style={styles.basicInfo_block}>
                    <MaterialCommunityIcons style={styles.basicInfo_icon} name='calendar-account-outline' />
                    <Text style={styles.basicInfo_label}>Usuario desde {convertDateLarge(userArray.wasCreated)}</Text>
                </View>
            </View>

            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color="#ed007e" size={80} style={styles.loading_spiner} />
                    <Text style={styles.loading_title}>Cargando publicaciones</Text>
                </View>
                :
                publications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={styles.empty_icon} name='book-open-page-variant-outline' />
                        <Text style={styles.empty_Title}>No ha hecho ninguna publicacion</Text>
                    </View>
                    :
                    <View style={styles.father}>
                        {publications.map(publication => <Publication key={publication.id} props={props} {...publication} />)}
                    </View>
            }

            <Modal style={styles.modal} position={"bottom"} isOpen={followersList} onClosed={openFollowersList} coverScreen={true}>
                <View style={styles.modalLine}></View>
                <Text style={styles.modalTitle}>Seguidores</Text>

                <ScrollView>
                    {userArray.followers.map((follower, key) => (<UserList key={key} props={props} idUser={follower} list_owner={userArray.username} followType={0} />))}
                </ScrollView>
            </Modal>

            <Modal style={styles.modal} position={"bottom"} isOpen={followingsList} onClosed={openFollowingList} coverScreen={true}>
                <View style={styles.modalLine}></View>
                <Text style={styles.modalTitle}>Siguiendo</Text>

                <ScrollView>
                    {userArray.following.map((following, key) => (<UserList key={key} props={props} idUser={following} list_owner={userArray.username} followType={1} />))}
                </ScrollView>
            </Modal>

            <Modal style={styles.modalOptions} position={"bottom"} isOpen={optionsPerfil} onClosed={openOptionsList} coverScreen={true}>
                {isFollowed ?
                    <TouchableOpacity style={styles.modalButton} onPress={stopFollow}>
                        <MaterialCommunityIcons style={styles.modalButtonIcon} name='account-minus-outline' />
                        <Text style={styles.modalButtonLabel}>Dejar de seguir</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                {isFollowedYou ?
                    <TouchableOpacity style={styles.modalButton} onPress={deleteFollower}>
                        <MaterialCommunityIcons style={styles.modalButtonIcon} name='account-minus-outline' />
                        <Text style={styles.modalButtonLabel}>Eliminar seguidor</Text>
                    </TouchableOpacity>
                    :
                    <View></View>
                }
                <TouchableOpacity style={styles.modalButton} onPress={openOptionsList}>
                    <MaterialCommunityIcons style={styles.modalButtonIcon} name='window-close' />
                    <Text style={styles.modalButtonLabel}>Cerrar</Text>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016"
    },
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
        top: 150,
        left: 30,
        height: 110,
        width: 110,
        borderRadius: 50,
        zIndex: 1
    },
    info_container: {
        backgroundColor: "#550038",
        borderRadius: 10,
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 20
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
    followButton: {
        flexDirection: "row",
        padding: 8,
        borderColor: "#ff0070",
        borderWidth: 2,
        borderRadius: 10,
        outlineStyle: "solid",
        outlineWidth: 2,
    },
    followIcon: {
        color: "#ff0070",
        fontSize: 24,
        marginRight: 10
    },
    followLabel: {
        color: "#ff0070",
        fontSize: 16,
        fontWeight: "bold"
    },
    followedIcon: {
        color: "#abf752",
        fontSize: 24,
        marginRight: 10
    },
    followedLabel: {
        color: "#abf752",
        fontSize: 16,
        fontWeight: "bold"
    },
    interaction_options: {
        color: "#ff0070",
        fontSize: 30,
        marginLeft: 18
    },
    nickname: {
        color: "#4cc9f0",
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5
    },
    nickname_footer: {
        flexDirection: "row"
    },
    username: {
        color: "#ff0070",
        fontSize: 18,
        fontWeight: "bold"
    },
    username_followYou: {
        color: "#abf752",
        fontSize: 18,
        fontWeight: "bold"
    },
    icon_followYou: {
        color: "#abf752",
        fontSize: 24,
        marginLeft: 10
    },
    info_User: {
        color: "white",
        fontSize: 16,
        textAlign: "justify",
        marginTop: 10
    },
    basicInfo: {
        marginLeft: 10
    },
    basicInfo_block: {
        marginVertical: 5,
        flexDirection: "row"
    },
    basicInfo_icon: {
        color: "#4cc9f0",
        fontSize: 24,
        marginRight: 5
    },
    basicInfo_label: {
        color: "#4cc9f0",
        fontSize: 16
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
    follows_numbers: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginRight: 5
    },
    follows_label: {
        color: "#4cc9f0",
        fontSize: 17,
        fontWeight: "bold"
    },
    follows_separator: {
        backgroundColor: "#4cc9f0",
        height: 26,
        width: 2.5
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
    loading_title: {
        color: "#ed007e",
        fontSize: 24,
        fontWeight: "bold"
    },
    empty_icon: {
        color: "#a00055",
        fontSize: 80,
        marginBottom: 10
    },
    empty_Title: {
        color: "#ed007e",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },
    father: {
        marginHorizontal: 15
    },
    noBanner: {
        width: "100%",
        height: 200,
        backgroundColor: "#220014"
    },
    modal: {
        alignItems: "center",
        padding: 20,
        maxHeight: 700,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: "#550038"
    },
    modalOptions: {
        paddingTop: 20,
        paddingHorizontal: 10,
        maxHeight: 175,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        backgroundColor: "#550038"
    },
    modalLine: {
        height: 3,
        width: 150,
        borderRadius: 5,
        backgroundColor: "#e40068",
    },
    modalTitle: {
        color: "#e40068",
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 15
    },
    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10
    },
    modalButtonIcon: {
        fontSize: 30,
        color: "#ff0070",
        marginRight: 15
    },
    modalButtonLabel: {
        fontSize: 17,
        color: "#ff0070",
        fontWeight: "bold"
    }
})