import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from '../screens/login';
import Details from '../screens/sub-screens/details';
import { Homepage, Trending, Create, Notifications, Chats } from '../screens';
import FastComment from '../screens/sub-screens/fast_comment'
import New_publication from '../screens/sub-screens/new_publication';
import ReplyScreen from '../screens/sub-screens/replyScreen';
import Perfil from '../screens/perfil';

import Ionicons from 'react-native-vector-icons/Ionicons'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tab1Name = "Principal"
const tab2Name = "Buscar"
const tab3Name = "Crear"
const tab4Name = "Notificaciones"
const tab5Name = "Chats"

export default function MyRoutes() {
    function MyRoutes() {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Home" component={HomeTaps} />
                <Stack.Screen name="FastComment" component={FastComment} />
                <Stack.Screen name="Details" component={Details} />
                <Stack.Screen name="Perfil" component={Perfil} />
                <Stack.Screen name="ReplyScreen" component={ReplyScreen} />
                <Stack.Screen name="NewPublication" component={New_publication} />
            </Stack.Navigator>
        );
    }

    return MyRoutes()
}

export function HomeTaps() {
    return (
        <Tab.Navigator
            initialRouteName={tab1Name}
            // screenOptions={{
            //     tabBarShowLabel: false,
            //     headerShown: false,
            //     tabBarActiveBackgroundColor: "#220014",
            //     tabBarInactiveBackgroundColor: "#220014",
            //     tabBarActiveTintColor: '#ff0070',
            //     tabBarInactiveTintColor: '#660031',
            // }}
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
                tabBarActiveBackgroundColor: "#220014",
                tabBarInactiveBackgroundColor: "#220014",
                tabBarStyle: {
                    borderBlockColor: "#220014",
                    borderWidth: 2
                },
                tabBarActiveTintColor: '#ff0070',
                tabBarInactiveTintColor: '#660031',
            })}
        >
            <Tab.Screen name={tab1Name} component={Homepage} />
            <Tab.Screen name={tab2Name} component={Trending} />
            <Tab.Screen name={tab3Name} component={Create} />
            <Tab.Screen name={tab4Name} component={Notifications} />
            <Tab.Screen name={tab5Name} component={Chats} />
        </Tab.Navigator>
    )
}