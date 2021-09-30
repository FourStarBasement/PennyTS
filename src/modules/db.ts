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
  BugFinder = 1 << 6,
}

export enum ServerFlags {
  UNSET = 0,
  LEVELS = 1 << 0,
  MOD_LOGS = 1 << 1,
  AUTO_QUOTE = 1 << 2,
  AUTO_ROLE = 1 << 3,
  PREMIUM = 1 << 4, // I have no clue if I will ever use this one but there just in case
  WELCOMES = 1 << 5,
  SELF_ROLE = 1 << 6,
  ROLE_EDITS = 1 << 7,
}

export enum ModLogActionFlags {
  UNSET = 0,
  CHANNEL_CREATE = 1 << 0,
  CHANNEL_UPDATE = 1 << 1,
  CHANNEL_DELETE = 1 << 2,
  GUILD_ROLE_CREATE = 1 << 3,
  GUILD_ROLE_UPDATE = 1 << 4,
  GUILD_ROLE_DELETE = 1 << 5,
  CHANNEL_PINS_UPDATE = 1 << 6,
  GUILD_MEMBER_ADD = 1 << 7,
  GUILD_MEMBER_UPDATE = 1 << 8,
  GUILD_MEMBER_REMOVE = 1 << 9,
  GUILD_BAN_ADD = 1 << 10,
  GUILD_BAN_REMOVE = 1 << 11,
  GUILD_EMOJIS_UPDATE = 1 << 12,
  INVITE_CREATE = 1 << 13,
  INVITE_DELETE = 1 << 14,
  MESSAGE_DELETE = 1 << 15,
  MESSAGE_DELETE_BULK = 1 << 16,
}

export interface DBEmote {
  server_id: BigInt;
  emote_id: BigInt;
  used: number;
}

export interface DBRole {
  guild: bigint;
  role: bigint;
}

export interface DBServer {
  server_id: BigInt;
  welcome: boolean;
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
  modlog_perm: ModLogActionFlags;
  star_limit: number;
  starboard_emoji: string;
  flags: ServerFlags;
}

export interface DBStarboard {
  message_id: BigInt;
  star_id: BigInt;
}

export interface DBTag {
  tag_id: string;
  name: string;
  owner_id: BigInt;
  content: string;
  guild_id: BigInt;
  used: number;
}

export interface DBUser {
  user_id: BigInt;
  credits: BigInt;
  daily_time: boolean;
  used: number;
  highfives: number;
  blacklisted: boolean;
  xp: number;
  level: number;
  next: number;
  warns: number;
  cookie_time: boolean;
  cookies: number;
  background: string;
  emblem: string;
  token: string;
  flags: UserFlags;
  xp_cool: BigInt;
  last_fm_name: string;
}

export interface DBUserBackground {
  user_id: BigInt;
  name: string;
}

export interface DBUserEmblem {
  emblem: string;
  user_id: BigInt;
}

export interface DBDisabledCommand {
  command: string;
  channel_id?: BigInt;
  server_id?: BigInt;
}

export interface DBHighlight {
  server_id: BigInt;
  user_id: BigInt;
  terms?: string[];
}
