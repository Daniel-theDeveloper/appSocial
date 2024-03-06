import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import login from '../screens/login';
import details from '../screens/details';
import { Homepage, Trending, Create, Notifications, Chats } from '../screens';

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function MyRoutes() {
    function MyRoutes() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={login} />
                <Stack.Screen name="Home" component={HomeTaps} />
                <Stack.Screen name="Details" component={details} />
            </Stack.Navigator>
        );
    }

    return MyRoutes()
}

export function HomeTaps() {
    return (
        <Tab.Navigator
            initialRouteName='Principal'
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen
                name='homepage'
                component={Homepage}
                options={{
                    title: "Principal",
                    tapBarIcon: () => {
                        <MaterialCommunityIcons name="flag" />
                    }
                }}
            />
            <Tab.Screen
                name='trending'
                component={Trending}
                options={{
                    title: "Buscar",
                    tapBarIcon: () => {
                        <MaterialCommunityIcons name="flag" />
                    }
                }}
            />
            <Tab.Screen
                name='create'
                component={Create}
                options={{
                    title: "Crear",
                    tapBarIcon: () => {
                        <MaterialCommunityIcons name="flag" />
                    }
                }}
            />
            <Tab.Screen
                name='notifications'
                component={Notifications}
                options={{
                    title: "Notificaciones",
                    tapBarIcon: () => {
                        <MaterialCommunityIcons name="flag" />
                    }
                }}
            />
            <Tab.Screen
                name='chats'
                component={Chats}
                options={{
                    title: "Mensajes",
                    tapBarIcon: () => {
                        <MaterialCommunityIcons name="flag" />
                    }
                }}
            />
        </Tab.Navigator>
    )
}

// export function MyTabs() {
//     return [
//         {
//             id: 1,
//             title: 'Pagina principal',
//             screen: 'homepage',
//             icon: 'home',
//             Component: Homepage
//         },
//         {
//             id: 2,
//             title: 'Buscar',
//             screen: 'trending',
//             icon: 'heart',
//             Component: Trending
//         },
//         {
//             id: 3,
//             title: 'Crear post',
//             screen: 'createPost',
//             icon: 'plus',
//             Component: Create
//         },
//         {
//             id: 4,
//             title: 'Notificaciones',
//             screen: 'notifications',
//             icon: 'bell',
//             Component: Notifications
//         },
//         {
//             id: 5,
//             title: 'Chats',
//             screen: 'chats',
//             icon: 'message-text',
//             Component: Chats
//         }
//     ]
// }