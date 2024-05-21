import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Notification from './components/notification';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { database } from '../utils/database';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { localUserLogin } from '../utils/localstorage';

export default function Notifications(props) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllNotifications();
    }, []);

    function loadAllNotifications() {
        try {
            setLoading(true);

            const url = 'users/' + localUserLogin.id + '/notifications';
            const collectionRef = collection(database, url);
            const q = query(collectionRef, orderBy('date', 'desc'));

            const unsuscribe = onSnapshot(q, QuerySnapshot => {
                setNotifications(
                    QuerySnapshot.docs.map(doc => ({
                        id: doc.id,
                        body: doc.data().body,
                        date: doc.data().date,
                        idUser: doc.data().idUser,
                        readed: doc.data().readed,
                        optionalData: doc.data().optionalData,
                        type: doc.data().type
                    }))
                )
            });
            setLoading(false);
            return unsuscribe;
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Notificaciones </Text>
            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color="#ed007e" size={80} style={styles.loading_spiner} />
                    <Text style={styles.loading_title}>Cargando notificaciones</Text>
                </View>
                :
                notifications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={styles.empty_icon} name='bell-off-outline' />
                        <Text style={styles.empty_Title}>No tienes nuevas notificaciones</Text>
                        <Text style={styles.empty_subtitle}>Siga interactuando</Text>
                    </View>
                    :
                    <View>
                        {notifications.map(notifications => <Notification key={notifications.id} props={props} {...notifications} />)}
                    </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 15,
        backgroundColor: "#210016"
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#ed007e",
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
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 500
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
    empty_subtitle: {
        color: "#a00055",
        fontSize: 18,
        textAlign: "center",
    }
})