import { createStackNavigator } from '@react-navigation/stack'

import login from '../pages/login';
import home from '../pages/home';
import { Homepage, Trending, Create, Notifications, Chats } from '../pages/screens';

export default function MyRoutes() {
    const Stack = createStackNavigator();

    function MyRoutes() {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Login" component={login}
                    options={{
                        title: 'Iniciar sesion',
                        headerTintColor: 'white',
                        headerTitleAlign: 'center',
                        headerStyle: { backgroundColor: '#141442' }
                    }}
                />
                <Stack.Screen name="Home" component={home} />
            </Stack.Navigator>
        );
    }

    return MyRoutes()
}

export function MyTabs() {
    return [
        {
            id: 1,
            title: 'Pagina principal',
            screen: 'homepage',
            icon: 'home',
            Component: Homepage
        },
        {
            id: 2,
            title: 'Buscar',
            screen: 'trending',
            icon: 'heart',
            Component: Trending
        },
        {
            id: 3,
            title: 'Crear post',
            screen: 'createPost',
            icon: 'plus',
            Component: Create
        },
        {
            id: 4,
            title: 'Notificaciones',
            screen: 'notifications',
            icon: 'bell',
            Component: Notifications
        },
        {
            id: 5,
            title: 'Chats',
            screen: 'chats',
            icon: 'message-text',
            Component: Chats
        }
    ]
}