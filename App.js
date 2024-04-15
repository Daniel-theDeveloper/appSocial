import 'react-native-gesture-handler';

import { NavigationContainer } from "@react-navigation/native"
import MyRoutes from './navigation/navigation';

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
