import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Homepage, Trending, Create, Notifications, Chats } from './screens';

const Tap = createBottomTabNavigator();

export default function home() {

    // const tabs = [
    //     {
    //         id: 1,
    //         title: 'Pagina principal',
    //         screen: 'homepage',
    //         icon: 'home',
    //         Component: Homepage
    //     },
    //     {
    //         id: 2,
    //         title: 'Buscar',
    //         screen: 'trending',
    //         icon: 'heart',
    //         Component: Trending
    //     },
    //     {
    //         id: 3,
    //         title: 'Crear post',
    //         screen: 'createPost',
    //         icon: 'plus',
    //         Component: Create
    //     },
    //     {
    //         id: 4,
    //         title: 'Notificaciones',
    //         screen: 'notifications',
    //         icon: 'bell',
    //         Component: Notifications
    //     },
    //     {
    //         id: 5,
    //         title: 'Chats',
    //         screen: 'chats',
    //         icon: 'message-text',
    //         Component: Chats
    //     }
    // ]

    return (
        <View>
            {/* <Tap.Navigator initialRouteName={'homepage'}
                screenOptions={{
                    headerShown: false
                }}
            >
                {
                    tabs.map(x =>
                        <Tap.Screen
                            key={x.id}
                            name={x.screen}
                            component={x.Component}
                        >
                        </Tap.Screen>
                    )
                }
            </Tap.Navigator> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#161343',
        alignItems: 'center',
    }
})