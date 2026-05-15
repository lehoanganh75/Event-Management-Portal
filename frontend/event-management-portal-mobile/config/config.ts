import Constants from "expo-constants";

const expoExtra = (Constants.expoConfig ?? (Constants as any).manifest)
  ?.extra as
  | { BASE_URL?: string; EVENTS_BASE_URL?: string; EVENTS_ACCESS_KEY?: string }
  | undefined;

export const BASE_URL =
  expoExtra?.BASE_URL || process.env.BASE_URL || "https://fitiuh-events.io.vn";
