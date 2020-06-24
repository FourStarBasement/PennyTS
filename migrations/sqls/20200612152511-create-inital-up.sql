/* Replace with your SQL commands */
CREATE TABLE emote (
  server_id bigint primary key,
  emote_id  bigint,
  used integer default 0
);

CREATE TABLE roles (
  guild bigint primary key,
  role bigint
);

CREATE TABLE servers (
  server_id bigint primary key,
  welcome boolean default false,
  welcome_message text,
  welcome_role bigint,
  welcome_channel bigint,
  leave_message   text,
  prefix varchar(5) default '//',
  mod_log integer default 0,
  mod_channel bigint,
  levels integer default 1,
  edits integer default 0,
  starboard_channel bigint,
  modlog_perm varchar(36)
);

CREATE TABLE starboard (
  message_id bigint,
  star_id bigint
);

CREATE TABLE tags (
  id bigint primary key,
  name text,
  owner_id bigint,
  content text,
  guild_id bigint,
  used integer default 0
);

CREATE TABLE users (
  user_id bigint primary key,
  credits integer default 0,
  daily_time boolean default true,
  used integer default 0,
  highfives integer default 0,
  blacklisted boolean default false,
  xp integer default 0,
  level integer default 0,
  xp_cool timestamp,
  next integer default 1024,
  warns integer default 0,
  cookie_time boolean default true,
  cookies integer default 0,
  background varchar(36),
  patron boolean default false,
  emblem varchar(32),
  weeb boolean default true,
  token varchar(32)
);

CREATE TABLE user_backgrounds (
  user_id bigint primary key,
  name varchar(36)
);

CREATE TABLE user_emblems(
  user_id bigint primary key,
  emblem varchar(32)
);
