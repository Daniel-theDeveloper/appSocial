import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Homepage, Trending, Create, Notifications, Chats } from '../pages/screens';

import MyTabs from "../routes/routes"

export default function home() {
    const Tab = createBottomTabNavigator();
    const tabs = MyTabs;

    return (
        <View>
            {/* <Tab.Navigator
            initialRouteName='Principal'
            screenOptions={{headerShown: false}}
            >
                <Tab.Screen
                    name='Homepage'
                    component={Homepage}
                    options={{
                        title: "Principal",
                    }}
                />
                <Tab.Screen
                    name='Trending'
                    component={Trending}
                    options={{
                        title: "Buscar",
                    }}
                />
                <Tab.Screen
                    name='Create'
                    component={Create}
                    options={{
                        title: "Crear",
                    }}
                />
            </Tab.Navigator> */}
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