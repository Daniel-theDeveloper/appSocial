import { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';

import Loading from '../screens/loading';
import Login from '../screens/login';
import Details from '../screens/sub-screens/details';
import { Homepage, Trending, Create, Notifications, Chats } from '../screens';
import { Sign_up_part1, Sign_up_part2, Sign_up_part3, WelcomeScreen } from '../screens/signScreens';
import FastComment from '../screens/sub-screens/fast_comment'
import New_publication from '../screens/sub-screens/new_publication';
import ReplyScreen from '../screens/sub-screens/replyScreen';
import ConfigGeneral from '../screens/configs/configGeneral';
import Perfil from '../screens/perfil';
import ConfigPerfil from '../screens/configs/configPerfil';
import ConfigPassword from '../screens/configs/configPassword';
import DeleteAccount from '../screens/configs/deleteAccount';
import ReplyPublishScreen from '../screens/sub-screens/replyPublishScreen';
import MyChat from '../screens/sub-screens/myChat';
import Saves from '../screens/sub-screens/saves';

import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tab1Name = "Principal"
const tab2Name = "Buscar"
const tab3Name = "Crear"
const tab4Name = "Notificaciones"
const tab5Name = "Chats"

let new_notifications = 0;

export default function MyRoutes() {
    function MyRoutes() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Loading" component={Loading} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name="Sign_up_part3" component={Sign_up_part3} />
                <Stack.Screen name="Sign_up_part1" component={Sign_up_part1} />
                <Stack.Screen name="Sign_up_part2" component={Sign_up_part2} />
                <Stack.Screen name="Home" component={HomeTaps} />
                <Stack.Screen name="Saves" component={Saves} />
                <Stack.Screen name="FastComment" component={FastComment} />
                <Stack.Screen name="ReplyPublishScreen" component={ReplyPublishScreen} initialParams={{ id: "", userIdSend: "" }} />
                <Stack.Screen name="Details" component={Details} initialParams={{ id: "", nickname: "", avatar: null }}/>
                <Stack.Screen name="MyChat" component={MyChat} initialParams={{ channelId: "", userId: "", userNickname: "Chat", avatar: null, isDelete: false }} />
                <Stack.Screen name="Perfil" component={Perfil} initialParams={{ userId: "", userIdSend: "" }}/>
                <Stack.Screen name="ConfigGeneral" component={ConfigGeneral} />
                <Stack.Screen name="ConfigPerfil" component={ConfigPerfil} />
                <Stack.Screen name="ConfigPassword" component={ConfigPassword} />
                <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
                <Stack.Screen name="ReplyScreen" component={ReplyScreen} initialParams={{ id: "", userIdSend: "", nameUserSend: "", principalID: "", isPrincipalComment: false, comment_Array: [] }} />
                <Stack.Screen name="NewPublication" component={New_publication} initialParams={{ isEdit: false, publishToEdit: [] }}/>
            </Stack.Navigator>
        );
    }

    return MyRoutes()
}

export function HomeTaps() {
    const [new_notification, setNewNotification] = useState(0);
    const { colors } = useTheme();

    function restNotifications() {
        setNewNotification(new_notification - 1);
    }

    return (
        <Tab.Navigator
            initialRouteName={tab1Name}
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    let rn = route.name

                    if (rn === tab1Name) {
                        iconName = focused ? 'home' : 'home-outline'
                    } else if (rn === tab2Name) {
                        iconName = focused ? 'search-sharp' : 'search-outline'
                    } else if (rn === tab3Name) {
                        iconName = focused ? 'add-circle-sharp' : 'add-circle-outline'
                    } else if (rn === tab4Name) {
                        iconName = focused ? 'notifications' : 'notifications-outline'
                    } else if (rn === tab5Name) {
                        iconName = focused ? 'chatbox' : 'chatbox-outline'
                    }

                    return <Ionicons name={iconName} size={size} color={color} />
                },
                tabBarShowLabel: false,
                headerShown: false,
                tabBarActiveBackgroundColor: colors.background,
                tabBarInactiveBackgroundColor: colors.background,
                tabBarStyle: {
                    borderBlockColor: colors.background,
                    borderWidth: 2
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.primary_dark_alternative,
            })}
        >
            <Tab.Screen name={tab1Name} component={Homepage} />
            <Tab.Screen name={tab2Name} component={Trending} />
            <Tab.Screen name={tab3Name} component={Create} />
            <Tab.Screen options={new_notification > 0 ? {tabBarBadge: new_notification} : {title: ''}} name={tab4Name} component={Notifications} />
            <Tab.Screen name={tab5Name} component={Chats} />
        </Tab.Navigator>
    )
}