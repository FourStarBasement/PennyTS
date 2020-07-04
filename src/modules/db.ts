/// Interfaces for all tables in the database

export enum QueryType {
  Single,
  Multi,
  Void,
}

export enum UserFlags {
  Staff = 1 << 0,
  Contrib = 1 << 1,
  Moderator = 1 << 2,
  Patron = 1 << 3,
  Weeb = 1 << 4,
  Beta = 1 << 5,
  BugFinder = 1 << 6
}

export interface DBEmotes {
  server_id: BigInt;
  emote_id: string;
  used: number;
}

export interface DBRoles {
  guild: bigint;
  role: bigint;
}

export interface DBServer {
  server_id: BigInt;
  welcome: number;
  welcome_message: string;
  welcome_role: BigInt;
  welcome_channel: BigInt;
  leave_message: string;
  prefix: string;
  levels: number;
  edits: number;
  starboard_channel: BigInt;
  mod_log: number;
  mod_channel: BigInt;
  modlog_perm: string;
}

export interface DBStarboard {
  message_id: BigInt;
  star_id: BigInt;
}

export interface DBTags {
  id: string;
  name: string;
  owner: string;
  content: string;
  guild: string;
  used: number;
}

export interface DBUser {
  user_id: BigInt;
  credits: bigint;
  daily_time: number;
  used: number;
  highfives: number;
  blacklisted: boolean;
  xp: number;
  level: number;
  xp_cool: Date;
  next: number;
  warns: number;
  cookie_time: number;
  cookies: number;
  background: string;
  emblem: string;
  token: string;
  flags: number;
}

export interface DBUserBackgrounds {
  user_id: BigInt;
  name: string;
}

export interface DBUserEmblems {
  emblem: string;
  user_id: BigInt;
}

// Deserialise some starboard stuff
export interface StarData {
  count: number;
  message_id: string;
  star_id: string;
}
