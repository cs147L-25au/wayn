import { ImageSourcePropType } from "react-native";

export const statusIcons: Record<string, ImageSourcePropType> = {
  studying: require("../assets/emojis/studystatus.png"),
  exploring: require("../assets/emojis/explorestatus.png"),
  chilling: require("../assets/emojis/chillstatus.png"),
  working: require("../assets/emojis/workstatus.png"),
  "hanging out": require("../assets/emojis/hangoutstatus.png"),
};

export const defaultStatusIcon = require("../assets/emojis/question.png");
