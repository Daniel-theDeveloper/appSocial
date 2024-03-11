import * as React from 'react';
import * as RN from 'react-native'
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { database } from '../utils/database';
import { QuerySnapshot, collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import Publication from '../components/Publish';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

export default function homepage(props) {
    const goDetails = async() => {
        props.navigation.navigate('Details')
    }
    const [publications, setPublications] = React.useState([]);

    React.useEffect(() => {
        const collectionRef = collection(database, 'publications');
        const q = query(collectionRef, orderBy('date', 'desc'));

        const unsuscribe = onSnapshot(q, QuerySnapshot => {
            setPublications(
                QuerySnapshot.docs.map(doc => ({
                    id: doc.id,
                    body: doc.data().body,
                    name: doc.data().user,
                    comments: doc.data().comments,
                    date: doc.data().date,
                    likes: doc.data().likes,
                    shares: doc.data().shares
                }))
            )
        })
        return unsuscribe;
    }, [])
    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity>
                        <MaterialCommunityIcons style={styles.menuButton} name='menu' />
                    </TouchableOpacity>
                    <Text style={styles.title}>Pagina principal</Text>
                    <Image style={styles.avatar} source={require('../assets/avatar-default.png')} />
                </View>

                {publications.map(publication => <Publication key={publication.id} props={props} {...publication} />)}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: "#E3E3E3"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        paddingTop: 40,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10
    },
    menuButton: {
        fontSize: 40
    },
    title: {
        fontSize: 20,
        fontWeight: "bold"
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100
    }
})