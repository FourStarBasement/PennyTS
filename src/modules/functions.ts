import {
  Context,
  Command,
  CommandOptions,
  CommandEvents,
} from 'detritus-client/lib/command';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { Member, User, Message, Guild } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';
import { Job } from 'node-schedule';
import config from './config';
import pgPromise from 'pg-promise';
import { PreparedStatement } from 'pg-promise';
import { EventHandler, chanReg, FetchedStarData } from './utils';
import { UserFlags, DBUser, DBServer, StarData, DBTags, QueryType } from './db';
import { ClientEvents } from 'detritus-client/lib/constants';
import { ModLogActions } from './modlog';
import { ShardClient } from 'detritus-client/lib/client';
import { type } from 'os';

// Additional properties/functions to access on the Guild
declare module 'detritus-client/lib/structures/guild' {
  interface Guild {
    waifuArr: Array<string>;
    nsfwArr: Array<string>;
    prefix: string;
    levels: number;
    modLog: ModLogActions;
    checked: boolean;
    avgColor: number;
  }
}

declare module 'detritus-client/lib/structures/user' {
  interface User {
    checked: boolean;
    blacklisted: boolean;
    avgColor: number;
  }
}

// Additional properties/functions to access on the commandClient
declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    query: (query: string) => Promise<any>; // Promise based queries
    queryOne: (query: string) => Promise<any>;
    preparedQuery: (
      query: string,
      values: Array<any>,
      typ: QueryType
    ) => Promise<any>;
    fetchGuildMember: (ctx: Context) => Member | User | undefined; // Easier method to fetch guild members
    checkImage: (image: string) => Promise<string>; // Checks if an image returns OK before sending
    checkGuild: (id: string) => Promise<void>; // Checks if a guild is in the database before making SQL calls
    checkUser: (context: Context, id: string) => Promise<DBUser>; // Checks if a user is in the database before making SQL calls
    hasFlag: (flags: number, flag: UserFlags) => Boolean;
    addOwnerOnly: (commands?: CommandOptions[]) => CommandClient; // Loads in commands from ./commands/owner/
    addEvents: (events: EventHandler[]) => CommandClient; // Load in events from ./events/
    fetchStarData: (message: Message) => Promise<FetchedStarData>; // Fetches data for starboard
    emoteCheck: (emoteID: string, serverID: string) => Promise<void>; // Checks if an emote is in the database before checking stats
    fetchAverageColor: (image: string) => Promise<number>; // Fetches an image's average color
    job: Job; // Resets everyone's daily/cookie count at midnight on the server host
    starQueue: any[]; // A queue of starboard data to process
    starInterval: Job; // An interval of when to process starboard data
  }
}

export default (
  client: CommandClient,
  connection: pgPromise.IBaseProtocol<{}>
) => {
  // SQL queries to return promises so we can await them
  client.query = (query: string) => {
    return connection.query(query);
  };

  client.queryOne = (query: string) => {
    return connection.one(query);
  };

  /*
   * Makes a prepared statement with the query and values.
   * Last paramater specifies the type of query we want to make
   */
  client.preparedQuery = (
    query: string,
    values: Array<any>,
    typ: QueryType
  ) => {
    const preparedStatement = new PreparedStatement({
      text: query,
      values: values,
    });
    switch (typ) {
      case QueryType.Single:
        return connection.one(preparedStatement);
      case QueryType.Multi:
        return connection.query(preparedStatement);
      case QueryType.Void:
        return connection.none(preparedStatement);
    }
  };

  // Used for fetching guild member objects easier.
  client.fetchGuildMember = (ctx: Context) => {
    let msg = ctx.message;
    let args = msg.content.slice(ctx.prefix?.length).split(' ');

    if (!args[1]) return undefined;

    let m =
      msg.mentions.first() ||
      msg.guild?.members.get(args[1]) ||
      msg.guild?.members.find(
        (m) => m.username.toLowerCase() === args[1].toLowerCase()
      ) ||
      msg.guild?.members.find(
        (m) => m.nick?.toLowerCase() === args[1].toLowerCase()
      );
    return m;
  };

  // Is the image OK?
  client.checkImage = async (image: string) => {
    let r = await fetch(image);
    if (r.statusText !== 'OK') return 'failed';

    return image;
  };

  // Check if a DBUser has a flag set
  client.hasFlag = (flags: number, flag: UserFlags) => {
    return ((flags & flag.valueOf()) == flag.valueOf())
  };

  // Check if user is in the DB before doing anything
  client.checkUser = async (ctx: Context, id: string) => {
    // TODO: Monitor for performance hits
    let result: DBUser = await client
      .queryOne(`
      WITH e AS(
          INSERT INTO users (user_id) VALUES (${id})
          ON CONFLICT("user_id") DO NOTHING
          RETURNING blacklisted
      )
      SELECT blacklisted FROM e
      UNION
          SELECT blacklisted FROM users WHERE user_id = ${id};
      `)
      .catch(console.error);

    return result;
  };

  // Check if the guild is in the DB before doing anything
  client.checkGuild = async (id: string) => {
    const guild = (client.client as ShardClient).guilds.get(id);

    if (!guild) return;
    let result: DBServer = await client
      .queryOne(
        `SELECT server_id, modlog_perm FROM servers WHERE server_id = ${id}`
      )
      .catch(console.error);

    if (!result) {
      await client
        .query(`INSERT INTO servers (server_id) VALUES (${id})`)
        .catch(console.error);
      if (!guild?.modLog) {
        guild!.modLog = 0;
      }
    } else {
      if (!guild?.modLog) {
        guild!.modLog = parseInt(result.modlog_perm);
      }
    }
    guild!.checked = true;
  };

  // This handles all the stuff like levels and custom prefixes
  client.onPrefixCheck = async (context: Context) => {
    if (context.user.bot) return '';
    if (!context.user.checked) {
      await client.checkUser(context, context.user.id).then(results => {
        context.user.checked = true;
        context.user.blacklisted = results.blacklisted;
      });

      if (context.user.blacklisted) return '';
    }
    if (context.guild && context.guildId) {
      let prefix: string;
      // Check if the prefix is cached
      if (context.guild?.prefix) {
        prefix = context.guild.prefix;
      } else {
        // If the prefix is not cached we cache it
        await client.checkGuild(context.guildId);
        let data: DBServer = await client
          .queryOne(
            `SELECT prefix, levels FROM servers WHERE server_id = ${context.guildId}`
          )
          .catch(console.error);
        console.log(data);
        context.guild!.levels = data.levels;
        prefix = data.prefix;
        context.guild!.prefix = prefix;
      }
      // This grabs the emote stats
      let em = /<a?:\w+:\d+>/g;
      if (em.test(context.message.content)) {
        let em_id = /[0-9]/g;
        let r = context.message.content.match(em_id)!.join('');
        if (r.length > 18) {
          if (context.guild!.emojis.get(r.substr(0, 18)))
            client.emoteCheck(r.substr(0, 18), context.guildId);
        } else if (context.guild!.emojis.get(r)) {
          client.emoteCheck(r, context.guildId);
        }
      }
      // Add XP to a user if it is needed
      //xpAdd(context, context.guild!.levels, d);
      if (context.message.content.indexOf(prefix) === 0) {
        return prefix;
      }
      // Owner prefix checks
      if (context.message.content.indexOf(config.prefixes.owner) === 0)
        return config.prefixes.owner;
    }
    return '';
  };

  // This says a command failed and it sends the error message to a chat
  client.on('commandRunError', (err) => {
    err.context.client.channels
      .get('686714427650736133')
      ?.createMessage(
        `An error occured in command ${err.command.name}.\n${err.error}`
      );
    err.context.reply(
      `An error has occured! This incident and proper context has been reported to my dev team. I apologize for the inconvenience.`
    );
    console.log(err.error.stack);
  });

  // This tells me when someone runs a command. Useful for debugging
  client.on('commandRan', (cmd) => {
    console.log(
      `Ran command ${cmd.command.name} by ${cmd.context.member!.username}\n${
        cmd.context.user.id
      }`
    );
  });

  // This runs checks on commands when they are set in place so we don't have to do it for each file
  client.onCommandCheck = async (ctx: Context, command: Command) => {
    if (command.metadata.disabled) return false;

    if (command.metadata.owner) {
      if (ctx.content.indexOf(config.prefixes.owner) !== 0) {
        return false;
      } else if (!ctx.client.owners.find((v, k) => v.id === ctx.member!.id)) {
        return false;
      }
    }
    if (!command.metadata.checks) {
      return true;
    }

    for (let check of command.metadata.checks) {
      switch (check) {
        case 'userAdmin':
          if (
            !ctx.member?.canAdministrator &&
            !ctx.client.owners.find((v, k) => v.id === ctx.member!.id)
          ) {
            ctx.reply('This command is restricted to server admins.');
            return false;
          }
          break;

        case 'embeds':
          if (!ctx.channel?.canEmbedLinks) {
            ctx.reply('I cannot send embeds in this chat.');
            return false;
          }
          break;

        case 'ban':
          if (!ctx.member?.canBanMembers) {
            ctx.reply('This command is restricted to server mods.');
            return false;
          }
          if (!ctx.me?.canBanMembers) {
            ctx.reply('I cannot ban members!');
            return false;
          }
          break;

        case 'manageMessages':
          if (!ctx.member?.canManageMessages) {
            ctx.reply('This command is restricted to server mods.');
            return false;
          }

          if (!ctx.me?.canManageMessages) {
            ctx.reply('I cannot delete messages in this chat.');
            return false;
          }
          break;

        case 'webhooks':
          if (!ctx.me?.canManageWebhooks) {
            ctx.reply(
              "I don't have permissions to make a webhook. Please change this in your guild settings."
            );
            return false;
          }
          break;

        case 'attachments':
          if (!ctx.channel?.canAttachFiles) {
            ctx.reply("I don't have permissions to send images in this chat.");
            return false;
          }
          break;

        case 'nsfw':
          if (!ctx.channel?.nsfw) {
            ctx.reply('This channel is not marked as NSFW.');
            return false;
          }
          break;

        case 'kick':
          if (!ctx.member?.canKickMembers) {
            ctx.reply('This command is restricted to server mods.');
            return false;
          }

          if (!ctx.me?.canKickMembers) {
            ctx.reply('I cannot kick members!');
            return false;
          }
          break;

        case 'manageRoles':
          // I wanted to check here as well if the highest role position of the user was higher than the highest role position of the bot
          // but I realized that was a per command check as the role needing to be edited is different per command
          if (!ctx.me?.canManageRoles) {
            ctx.reply('I cannot edit roles!');
            return false;
          }
          break;
      }
    }
    return true;
  };

  // This fetches starboard data
  client.fetchStarData = async (message: Message) => {
    let starData: StarData = await client.query(
      `SELECT COUNT(*) AS count, message_id, star_id FROM starboard WHERE message_id = ${message.id} OR star_id = ${message.id} GROUP BY message_id, star_id`
    );
    let starboardInfo: DBServer = await client.query(
      `SELECT starboard FROM servers WHERE server_id = ${message.guild!.id}`
    );

    let channels = message.guild!.channels;
    let starboard = channels.get(starboardInfo.starboard_channel.toString());

    let starMessage;
    let starredMessage;
    if (starData.count) {
      starMessage = await starboard?.fetchMessage(starData.star_id);
      starredMessage = await channels
        .get(chanReg.exec(starMessage.content)![1])
        ?.fetchMessage(starData.message_id);
    }

    return {
      original: starredMessage,
      starred: starMessage,
      starboard: starboard,
    };
  };

  // This adds commands based on classes
  client.addMultiple = (commands?: CommandOptions[]) => {
    commands?.forEach((command) => {
      client.add(command);
      console.log('Loaded Command', command.name);
    });
    return client;
  };

  // Adds all owner commands
  client.addOwnerOnly = (commands?: CommandOptions[]) => {
    commands?.forEach((command) => {
      command.metadata!.owner = true;
      client.add(command);
      console.log('Loaded Owner Only Command', command.name);
    });
    return client;
  };

  // This adds events based on classes
  client.addEvents = (events: EventHandler[]) => {
    events.forEach((el) => {
      client.client.addListener(
        el.event,
        async (payload) =>
          await el.listener(client, payload).catch((r) => console.log(r))
      );
      console.log('Loaded Event Handler', el.event);
    });
    return client;
  };

  // Initiates the starboard queue
  client.starQueue = [];

  // Checks and handles the emote stats
  client.emoteCheck = async (emoteID: string, serverID: string) => {
    let data = await client
      .query(
        `SELECT COUNT(*) AS inD FROM emote WHERE server_id = ${serverID} AND emote_id = ${emoteID}`
      )
      .catch((error) => {
        if (error !== 'Query returned nothing') console.error(error);
      });
    if (data[0].inD === 0) {
      await client.query(
        `INSERT INTO emote (server_id, emote_id) VALUES (${serverID}, ${emoteID})`
      );
    }
    await client.query(
      `UPDATE emote SET used = used + 1 WHERE server_id = ${serverID} AND emote_id = ${emoteID}`
    );
  };

  // Tag handling should be here as it was too much work inside the prefixCheck event
  client.on(
    ClientEvents.COMMAND_NONE,
    async (payload: CommandEvents.CommandNone) => {
      /**
       * Check if the guild is set since this doesn't seem
       * to run through onPrefixCheck in the library.
       */
      if (!payload.context.guild) return;
      if (
        payload.context.message.content.indexOf(
          payload.context.guild.prefix
        ) !== 0
      )
        return;
      // If the command doesn't exist we check if it's a tag
      let content = payload.context.message.content
        .substr(payload.context.guild.prefix!.length)
        .split(/<@!?(\d+)>/);
      let tag: DBTags = await client
        .preparedQuery(
          'SELECT * FROM tags WHERE guild_id = $1 AND name = $2',
          [payload.context.guildId, content[0].trim()],
          QueryType.Single
        )
        .catch(console.error);

      if (!tag) return;
      console.log(tag);
      // Debugging info
      console.log(
        `Ran tag ${content[0].trim()} by ${payload.context.user.username}\n${
          payload.context.user.id
        }`
      );
      // Useful for tag stats
      await client.preparedQuery(
        'UPDATE tags SET used = used + 1 WHERE name = $1',
        [content],
        QueryType.Void
      );
      // This replaces custom bits inside tags like username and mentions.username etc
      let s: string = tag.content.replace(
        /{username}/g,
        payload.context.user.username
      );
      if (/{mentions.username}/g.test(s)) {
        if (!client.fetchGuildMember(payload.context)) {
          payload.context.reply('This tag requires that you mention a user!');
          return;
        }
        s = s.replace(
          /{mentions.username}/g,
          client.fetchGuildMember(payload.context)!.username
        );
      }
      // Make it so you can't mention @ everyone and @ here but can still mention users in a tag
      s = s.replace(/@everyone/g, 'everyone').replace(/@here/, 'here');
      payload.context.reply(s);
    }
  );
  // This is the function that handled adding experience to people. Keeps the prefixCheck clean
  async function xpAdd(ctx: Context, enabled: number, userData: any[]) {
    if (
      userData[0].xpAdd === 1 ||
      userData[0].xpAdd === null ||
      userData[0].xpAdd === undefined
    ) {
      let xp: number = Math.floor(Math.random() * 50); // 50 xp max at random. Just to make leveling up hard as pee pee
      await client.query(
        `UPDATE users SET xp_cool=NOW(), XP=XP + '${xp}' WHERE user_id = ${ctx.user.id}`
      );
      if (userData[0].XP > userData[0].Next && enabled === 1) {
        ctx.reply(
          `Congrats ${ctx.user.username}! You just leveled up to level ${
            userData[0].Level + 1
          }`
        );
        await client.query(
          `UPDATE users SET Level = Level + 1, Next = Next + 500, xp = 0 WHERE user_id = ${ctx.user.id}`
        );
      }
    }
  }

  // This function fetches an image's average color.
  client.fetchAverageColor = async (input: string): Promise<number> => {
    let img = await fetch(`${config.imageAPI.url}/averagecolor`, {
      headers: {
        authorization: config.imageAPI.password,
        image: input,
      },
    }).then((d) => d.json());
    return img.color;
  };
};
