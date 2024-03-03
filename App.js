import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from "@react-navigation/native"

import { create } from '@react-navigation/stack'
import login from './pages/login';
import home from './pages/home';

export default function App() {

  const Stack = createStackNavigator();

  // Enrutamiento de las paginas
  function MyStack() {
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
        <Stack.Screen name="Home" component={home}
        options={{
          title: 'App-social',
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#141442' }
        }}
        />
      </Stack.Navigator>
    );
  }

  // Diseño de la pagina
  return (
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}
