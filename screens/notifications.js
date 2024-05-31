import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Notification from './components/notification';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';

import { database } from '../utils/database';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { localUserLogin } from '../utils/localstorage';

export default function Notifications(props) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const { colors } = useTheme();

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
        <View style={{flex: 1, flexGrow: 1, padding: 15, backgroundColor: colors.background}}>
            <Text style={{fontSize: 30, fontWeight: "bold", color: colors.primary}}> Notificaciones </Text>
            {loading ?
                <View style={styles.empty_components}>
                    <ActivityIndicator color={colors.primary} size={80} style={styles.loading_spiner} />
                    <Text style={{color: colors.primary, fontSize: 24, fontWeight: "bold"}}>Cargando notificaciones</Text>
                </View>
                :
                notifications.length == 0 ?
                    <View style={styles.empty_components}>
                        <MaterialCommunityIcons style={{color: colors.primary, fontSize: 80, marginBottom: 10}} name='bell-off-outline' />
                        <Text style={{color: colors.primary, fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8}}>No tienes nuevas notificaciones</Text>
                        <Text style={{color: colors.primary, fontSize: 18, textAlign: "center"}}>Siga interactuando</Text>
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
    empty_components: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: 500
    }
})