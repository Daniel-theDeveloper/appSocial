import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from "react-native";

import Publication from './components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { convertDateLarge } from "../utils/convertDate";
import { userId } from "./components/Publish";
import { myIdUser } from "../utils/localstorage";

import { doc, updateDoc, arrayUnion, collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { database } from '../utils/database';
import { isWasInteracted } from "../utils/interations";
import { globalUsername } from "../utils/localstorage";

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
        location: "",
        banner: null
    });
    const [publications, setPublications] = useState([]);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isFollowedYou, setIsFollowedYou] = useState(false);
    const [avatarURI, setAvatarURI] = useState(null);
    const [bannerURL, setBannerURL] = useState(null);
    const [loading, setLoading] = useState(true);

    const [followsCount, setFollowsCount] = useState(0);
    const [followingsCount, setFollowingsCount] = useState(0);

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
                            location: res.data['location'],
                            banner: res.data['banner']
                        }
                    }
                })
                if (getData.avatar != null) {
                    fetchImage(getData.avatar, true);
                }
                if (getData.banner != null) {
                    fetchImage(getData.banner, false);
                }
                setFollowsCount(getData.followers.length)
                setFollowingsCount(getData.following.length)
                setIsFollowed(isWasInteracted(getData.followers))
                setIsFollowedYou(isWasInteracted(getData.following))
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
        try {
            const docRefUser = doc(database, 'users', userArray.id);
            const docRefMyUser = doc(database, 'users', myIdUser);
            await updateDoc(docRefUser, {
                followers: arrayUnion(globalUsername)
            });
            await updateDoc(docRefMyUser, {
                following: arrayUnion(userArray.username)
            });
            setIsFollowed(true);
        } catch (error) {
            Alert.alert("Error en el servidor", "Vuelvelo a intentar mas tarde");
            console.error(error);
        }
    }

    return (
        <ScrollView style={styles.container}>
            {bannerURL != null ?
                <Image style={styles.image_header} source={{ uri: bannerURL }} />
                :
                <View style={styles.noBanner}></View>
            }
            <Image style={styles.avatar} source={avatarURI != null ? { uri: avatarURI } : require('../assets/avatar-default.png')} />

            <View style={styles.info_container}>
                <View style={styles.interaction_block}>
                    {isFollowed ?
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
                    <MaterialCommunityIcons style={styles.interaction_options} name='dots-horizontal' />
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
                    <View style={styles.follows_part}>
                        <Text style={styles.follows_numbers}>{followsCount}</Text>
                        <Text style={styles.follows_label}>Seguidores</Text>
                    </View>
                    <View style={styles.follows_separator} />
                    <View style={styles.follows_part}>
                        <Text style={styles.follows_numbers}>{followingsCount}</Text>
                        <Text style={styles.follows_label}>Siguiendo</Text>
                    </View>
                </View>
            </View>

            <View style={styles.basicInfo}>
                <View style={styles.basicInfo_block}>
                    <MaterialCommunityIcons style={styles.basicInfo_icon} name='map-marker-outline' />
                    <Text style={styles.basicInfo_label}>{userArray.location}</Text>
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
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#210016"
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
    }
})