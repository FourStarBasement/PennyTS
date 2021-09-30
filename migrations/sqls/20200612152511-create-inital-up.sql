CREATE TABLE disabled_commands (
    id SERIAL PRIMARY KEY,
    command text NOT NULL,
    channel_id bigint,
    server_id bigint
);

CREATE TABLE emote (
    id SERIAL PRIMARY KEY,
    server_id bigint NOT NULL,
    emote_id bigint NOT NULL,
    used integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY emote ADD CONSTRAINT emote_server_id_emote_id_key UNIQUE (server_id, emote_id);

CREATE TABLE highlights (
    id SERIAL PRIMARY KEY,
    server_id bigint NOT NULL,
    user_id bigint NOT NULL,
    terms text[]
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    guild bigint NOT NULL,
    role bigint NOT NULL
);

ALTER TABLE ONLY roles ADD CONSTRAINT roles_guild_role_key UNIQUE (guild, role);

CREATE TABLE servers (
    id SERIAL,
    server_id bigint PRIMARY KEY,
    welcome boolean DEFAULT false,
    welcome_message text,
    welcome_role bigint,
    welcome_channel bigint,
    leave_message text,
    prefix character varying(5) DEFAULT '//'::character varying,
    mod_log integer DEFAULT 0,
    mod_channel bigint,
    levels integer DEFAULT 0,
    edits integer DEFAULT 0,
    starboard_channel bigint,
    modlog_perm character varying(36),
    star_limit integer DEFAULT 3,
    starboard_emoji text,
    flags integer DEFAULT 0
);

CREATE TABLE starboard (
    id SERIAL PRIMARY KEY,
    message_id bigint,
    star_id bigint
);


CREATE TABLE tags (
    id SERIAL,
    tag_id character varying(32) PRIMARY KEY,
    name text,
    owner_id bigint,
    content text,
    guild_id bigint,
    used integer DEFAULT 0
);

CREATE TABLE user_backgrounds (
    id SERIAL PRIMARY KEY,
    user_id bigint NOT NULL,
    name character varying(36) NOT NULL
);

ALTER TABLE ONLY user_backgrounds ADD CONSTRAINT user_backgrounds_user_id_name_key UNIQUE (user_id, name);

CREATE TABLE user_emblems (
    id SERIAL PRIMARY KEY,
    user_id bigint NOT NULL,
    emblem character varying(32) NOT NULL
);

ALTER TABLE ONLY user_emblems ADD CONSTRAINT user_emblems_user_id_emblem_key UNIQUE (user_id, emblem);

CREATE TABLE users (
    id SERIAL,
    user_id bigint PRIMARY KEY,
    credits bigint DEFAULT 0,
    daily_time boolean DEFAULT true,
    used integer DEFAULT 0,
    highfives integer DEFAULT 0,
    blacklisted boolean DEFAULT false,
    xp integer DEFAULT 0,
    level integer DEFAULT 0,
    next integer DEFAULT 1024,
    warns integer DEFAULT 0,
    cookie_time boolean DEFAULT true,
    cookies integer DEFAULT 0,
    background character varying(36),
    emblem character varying(32),
    token character varying(32),
    flags integer DEFAULT 0,
    xp_cool bigint,
    last_fm_name text
);