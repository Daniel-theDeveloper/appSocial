module.exports = function (api) {  // Para compilar en web, es necesario activar esta linea

// export default function (api) {   // Para compilar en web, es necesario desactivar esta linea
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // plugins: [
    //   [
    //     "module-resolver",
    //     {
    //       extensions: [".tsx", ".ts", ".js", ".json"],
    //     },
    //   ],
    //   "react-native-reanimated/plugin",
    // ],
  };
};