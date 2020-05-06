/// Interfaces for all tables in the database

export interface Backgrounds {
  name: string;
}

export interface Colors {
  Color_Name: string;
  Color_Code: string;
}

export interface Cooldowns {
  command: string;
}

export interface Emotes {
  server_id: string;
  emote_id: string;
  used: number;
}

export interface Exposed {
  user_id: number;
  name: string;
}

export interface Roles {
  guild: string;
  role: string;
}

export interface Servers {
  count?: number;
  ServerID: string;
  ServerIcon: string;
  ServerName: string;
  Welcome: number;
  WMessage: string;
  LMessage: string;
  Prefix: string;
  wc: string;
  mod_log: number;
  mod_channel: string;
  ar: number;
  role: string;
  levels: number;
  edits: number;
  starboard: string;
  WRole: string;
  ModLogPerm: string;
}

export interface Starboard {
  msgID: string;
  starID: string;
}

export interface Tags {
  ID: string;
  name: string;
  owner: string;
  content: string;
  guild: string;
  used: number;
}

export interface User {
  User_ID: string;
  UserAvatar: string;
  Credits: number;
  DailyTime: number;
  Used: number;
  HighFives: number;
  UserColor: string;
  Blacklisted: number;
  XP: number;
  Level: number;
  xp_cool: Date;
  Next: number;
  Warns: number;
  CT: number;
  Cookie: number;
  background: string;
  patron: number;
  emblem: string;
  weeb: string;
  token: string;
}

export interface UserColors {
  User_ID: string;
  Color_Name: string;
}

export interface UserB {
  User_ID: string;
  name: string;
}

export interface UserCool {
  User_ID: string;
  command: string;
  cool: Date;
}

export interface UserE {
  emblem: string;
  userID: string;
}

export interface Warns {
  ID: string;
  warns: number;
}

export interface Count {
  count: number;
}

// Deserialise some starboard stuff
export interface StarData {
  count: number;
  msgID: string;
  starID: string;
}
