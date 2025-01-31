import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';

import { StatusBar } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import MyRoutes from './navigation/navigation';
import { Appearance } from 'react-native';
import { getSaveTheme } from './utils/localstorage';

import DarkTheme from './themes/DarkTheme';
import LightTheme from './themes/LightTheme';
import DarkAlternativeTheme from './themes/DarkAlternativeTheme';
import LightAlternativeTheme from './themes/LightAlternativeTheme';

export default function App() {
  const MyStack = MyRoutes

  const [isDark, setIsDark] = useState(false);

  const { colors } = useTheme();

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const theme = await getSaveTheme();

    if (theme == 'system') {
      getThemeBySystem();
    } else {
      if (theme == 'light') {
        setIsDark(false);
      } else {
        setIsDark(true);
      }
    }
  }

  function getThemeBySystem() {
    const colorScheme = Appearance.getColorScheme();

    if (colorScheme === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : LightTheme}>
      <StatusBar
        animated={true}
        backgroundColor={isDark ? "#131317" : "#F3F4FF"}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <MyStack />
    </NavigationContainer>
  );
}
