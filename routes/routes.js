import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from '../screens/login';
import Details from '../screens/sub-screens/details';
import { Homepage, Trending, Create, Notifications, Chats } from '../screens';
import New_publication from '../screens/sub-screens/new_publication'

import Fontisto from 'react-native-vector-icons/Fontisto'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function MyRoutes() {
    function MyRoutes() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Home" component={HomeTaps} />
                <Stack.Screen name="Details" component={Details} />
                <Stack.Screen name="NewPublication" component={New_publication} />
            </Stack.Navigator>
        );
    }

    return MyRoutes()
}

export function HomeTaps() {
    return (
        <Tab.Navigator
            initialRouteName='Principal'
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarActiveBackgroundColor: "#220014",
                tabBarInactiveBackgroundColor: "#220014",
                tabBarActiveTintColor: '#ff0070',
                tabBarInactiveTintColor: '#660031',
            }}
        >
            <Tab.Screen
                name='homepage'
                component={Homepage}
                options={{
                    title: "Principal",
                    tapBarIcon: ({ color, size }) => (
                        <Fontisto name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name='trending'
                component={Trending}
                options={{
                    title: "Buscar",
                    tapBarIcon: ({ color, size }) => (
                        <Fontisto name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name='create'
                component={Create}
                options={{
                    title: "Crear",
                    tapBarIcon: ({ color, size }) => (
                        <Fontisto name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name='notifications'
                component={Notifications}
                options={{
                    title: "Notificaciones",
                    tabBarBadge: 1,
                    tapBarIcon: ({ color, size }) => (
                        <Fontisto name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name='chats'
                component={Chats}
                options={{
                    title: "Mensajes",
                    tapBarIcon: ({ color, size }) => (
                        <Fontisto name="home" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    )
}