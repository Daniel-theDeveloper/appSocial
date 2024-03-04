import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import { NavigationContainer } from "@react-navigation/native"
import MyRoutes from "./routes/routes"

import { create } from '@react-navigation/stack'

export default function App() {
  // Enrutamiento de las paginas
  const MyStack = MyRoutes

  // Diseño de la pagina
  return (
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}
