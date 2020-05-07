/// Interfaces for all tables in the database

export interface DBBackgrounds {
  name: string;
}

export interface DBColors {
  Color_Name: string;
  Color_Code: string;
}

export interface DBCooldowns {
  command: string;
}

export interface DBEmotes {
  server_id: string;
  emote_id: string;
  used: number;
}

export interface DBExposed {
  user_id: number;
  name: string;
}

export interface DBRoles {
  guild: string;
  role: string;
}

export interface DBServers {
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

export interface DBStarboard {
  msgID: string;
  starID: string;
}

export interface DBTags {
  ID: string;
  name: string;
  owner: string;
  content: string;
  guild: string;
  used: number;
}

export interface DBUser {
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

export interface DBUserColors {
  User_ID: string;
  Color_Name: string;
}

export interface DBUserB {
  User_ID: string;
  name: string;
}

export interface DBUserCool {
  User_ID: string;
  command: string;
  cool: Date;
}

export interface DBUserE {
  emblem: string;
  userID: string;
}

export interface DBWarns {
  ID: string;
  warns: number;
}

export interface DBCount {
  count: number;
}

// Deserialise some starboard stuff
export interface StarData {
  count: number;
  msgID: string;
  starID: string;
}
