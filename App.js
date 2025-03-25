import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { useTheme } from '@react-navigation/native';
import i18n from 'i18next';

import { StatusBar } from 'react-native';
import { NavigationContainer } from "@react-navigation/native"
import MyRoutes from './navigation/navigation';
import { Appearance, I18nManager, Platform } from 'react-native';
import { getSaveTheme, getSaveLanguage } from './utils/localstorage';

import DarkTheme from './themes/DarkTheme';
import LightTheme from './themes/LightTheme';
import DarkAlternativeTheme from './themes/DarkAlternativeTheme';
import LightAlternativeTheme from './themes/LightAlternativeTheme';

export default function App() {
  const MyStack = MyRoutes

  const [isDark, setIsDark] = useState(false);

  const { colors } = useTheme();

  const platform = Platform.OS;

  useEffect(() => {
    loadTheme();
    loadLanguaje();
  }, []);

  const loadTheme = async () => {
    const theme = await getSaveTheme();

    if (theme == 'light') {
      setIsDark(false);
    } else if (theme == 'dark') {
      setIsDark(true);
    } else {
      getThemeBySystem();
    }

    // if (theme == 'system') {
    //   getThemeBySystem();
    // } else {
    //   if (theme == 'light') {
    //     setIsDark(false);
    //   } else {
    //     setIsDark(true);
    //   }
    // }
  }

  const loadLanguaje = async () => {
    const Languaje = await getSaveLanguage();

    if (Languaje == 'english') {
      i18n.changeLanguage('en');
    } else if (Languaje == 'spanish') {
      i18n.changeLanguage('es');
    } else {
      i18n.changeLanguage(getLanguajeBySystem());
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

  function getLanguajeBySystem() {
    const languajeCrude = platform === 'web'? "es_test" : I18nManager.getConstants().localeIdentifier;
    const languaje = languajeCrude.split('_')[0];

    if (languaje == 'es') {
      i18n.changeLanguage('es');
    } else {
      i18n.changeLanguage('en');
    }
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : LightTheme}>
      <StatusBar
        animated={true}
        // backgroundColor={isDark ? "#131317" : "#F3F4FF"}
        backgroundColor={"#F3F4FF"}
        // barStyle={isDark ? "light-content" : "dark-content"}
        barStyle={"dark-content"}
      />
      <MyStack />
    </NavigationContainer>
  );
}
