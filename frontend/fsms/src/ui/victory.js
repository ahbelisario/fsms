import { Platform } from "react-native";

const mod = Platform.OS === "web"
  ? require("victory")
  : require("victory-native");

const V = mod?.default ?? mod;

export const VictoryBar = V.VictoryBar;
export const VictoryLine = V.VictoryLine;
export const VictoryChart = V.VictoryChart;
export const VictoryAxis = V.VictoryAxis;
export const VictoryTheme = V.VictoryTheme;