/// Interfaces for all tables in the database

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

export interface DBServer {
  server_id: string;
  server_icon: string;
  server_name: string;
  welcome: number;
  welcome_message: string;
  leave_message: string;
  prefix: string;
  wc: string;
  mod_log: number;
  mod_channel: string;
  ar: number;
  role: string;
  levels: number;
  edits: number;
  starboard: string;
  welcome_role: string;
  modlog_perm: string;
}

export interface DBStarboard {
  msgID: string;
  starID: string;
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
  user_id: string;
  user_avatar: string;
  credits: number;
  daily_time: number;
  used: number;
  highfives: number;
  user_color: string;
  blacklisted: number;
  xp: number;
  level: number;
  xp_cool: Date;
  next: number;
  warns: number;
  cookie_time: number;
  cookie: number;
  background: string;
  patron: number;
  emblem: string;
  weeb: string;
  token: string;
}

export interface DBUserBackgrounds {
  user_id: string;
  name: string;
}

export interface DBUserEmblems {
  emblem: string;
  user_id: string;
}

// Deserialise some starboard stuff
export interface StarData {
  count: number;
  message_id: string;
  star_id: string;
}
