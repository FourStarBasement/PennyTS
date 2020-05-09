import {
  Context,
  Command,
  CommandOptions,
  CommandEvents,
} from 'detritus-client/lib/command';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { Member, User, Message } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';
import { Job } from 'node-schedule';
import config from './config';
import { Connection } from 'mysql';
import { EventHandler, chanReg, FetchedStarData } from './utils';
import { DBUser, DBServers, StarData, DBCount, DBTags } from './db';
import { ClientEvents } from 'detritus-client/lib/constants';
import { ModLogActions } from './modlog';
import { ShardClient } from 'detritus-client/lib/client';

// Additional properties/functions to access on the Guild
declare module 'detritus-client/lib/structures/guild' {
  interface Guild {
    waifuArr: Array<string>;
    nsfwArr: Array<string>;
    prefix: string;
    levels: number;
    modLog: ModLogActions;
    checked: boolean;
  }
}

declare module 'detritus-client/lib/structures/user' {
  interface User {
    checked: boolean;
    blacklisted: boolean;
  }
}

// Additional properties/functions to access on the commandClient
declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    query: (query: string) => Promise<any>; // Promise based queries
    fetchGuildMember: (ctx: Context) => Member | User | undefined; // Easier method to fetch guild members
    checkImage: (image: string) => Promise<string>; // Checks if an image returns OK before sending
    checkGuild: (id: string) => Promise<void>; // Checks if a guild is in the database before making SQL calls
    checkUser: (context: Context, id: string) => Promise<void>; // Checks if a user is in the database before making SQL calls
    addOwnerOnly: (commands?: CommandOptions[]) => CommandClient; // Loads in commands from ./commands/owner/
    addEvents: (events: EventHandler[]) => CommandClient; // Load in events from ./events/
    fetchStarData: (message: Message) => Promise<FetchedStarData>; // Fetches data for starboard
    emoteCheck: (emoteID: string, serverID: string) => Promise<void>; // Checks if an emote is in the database before checking stats
    job: Job; // Resets everyone's daily/cookie count at midnight on the server host
    starQueue: any[]; // A queue of starboard data to process
    starInterval: Job; // An interval of when to process starboard data
  }
}

export default (client: CommandClient, connection: Connection) => {
  // SQL queries to return promises so we can await them
  client.query = (query: string) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err: any, res: any) => {
        if (err || res.length < 1) reject(err || 'Query returned nothing');
        resolve(res);
      });
    });
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
    if (r.statusText !== 'OK') return '';

    return image;
  };

  // Check if user is in the DB before doing anything
  client.checkUser = async (ctx: Context, id: string) => {
    let result: DBUser[] = await client
      .query(`SELECT * FROM \`User\` WHERE \`User_ID\` = ${id}`)
      .catch(error => {
        if (error !== 'Query returned nothing')
          console.error(error);
      });

    if (!result || !result[0]) {
      await client
        .query(`INSERT INTO \`User\`(\`User_ID\`) VALUES ('${id}')`)
        .catch(console.error);
    }

    ctx.user.checked = true;
    ctx.user.blacklisted = Boolean(result[0].Blacklisted);
  };

  // Check if the guild is in the DB before doing anything
  client.checkGuild = async (id: string) => {
    const guild = (client.client as ShardClient).guilds.get(id);

    if (!guild) return;
    let result: DBServers[] = await client
      .query(
        `SELECT COUNT(*) as \`count\` FROM \`Servers\` WHERE \`ServerID\` = '${id}'`
      )
      .catch(error => {
        if (error !== 'Query returned nothing')
          console.error(error);
      });

    if (result[0].count === 0) {
      await client
        .query(`INSERT INTO \`Servers\` (\`ServerID\`) VALUES ('${id}')`)
        .catch(console.error);
      if (!guild?.modLog) {
        guild!.modLog = 0;
      }
    } else {
      if (!guild?.modLog) {
        guild!.modLog = parseInt(result[0].ModLogPerm);
      }
    }
    guild!.checked = true;
  };

  // This handles all the stuff like levels and custom prefixes
  client.onPrefixCheck = async (context: Context) => {
    if (context.user.bot) return '';
    if (!context.user.checked) await client.checkUser(context, context.user.id);
    if (context.user.blacklisted) return '';
    if (context.guild && context.guildId) {
      let prefix: string;
      // Check if the prefix is cached
      if (context.guild?.prefix) {
        prefix = context.guild.prefix;
      } else {
        // If the prefix is not cached we cache it
        await client.checkGuild(context.guildId);
        let data: DBServers[] = await client
          .query(
            `SELECT \`Prefix\`, \`levels\` FROM \`Servers\` WHERE \`ServerID\` = ${context.guildId}`
          )
          .catch(error => {
            if (error !== 'Query returned nothing')
              console.error(error);
          });
        context.guild!.levels = data[0].levels;
        prefix = data[0].Prefix;
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
  });

  // This tells me when someone runs a command. Useful for debugging
  client.on('commandRan', (cmd) => {
    console.log(
      `Ran command ${cmd.command.name} by ${cmd.context.member!.username}`
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
    let starData: StarData[] = await client.query(
      `SELECT COUNT(*) AS \`count\`, \`msgID\`, \`starID\` FROM \`starboard\` WHERE \`msgID\` = ${message.id} OR \`starID\` = ${message.id}`
    );
    let starboardInfo: DBServers[] = await client.query(
      `SELECT \`starboard\` FROM \`Servers\` WHERE \`ServerID\` = ${
        message.guild!.id
      }`
    );

    let channels = message.guild!.channels;
    let starboard = channels.get(starboardInfo[0].starboard);

    let starMessage;
    let starredMessage;
    if (starData[0].count) {
      starMessage = await starboard?.fetchMessage(starData[0].starID);
      starredMessage = await channels
        .get(chanReg.exec(starMessage.content)![1])
        ?.fetchMessage(starData[0].msgID);
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
        `SELECT COUNT(*) AS inD FROM \`emote\` WHERE \`server_id\` = ${serverID} AND \`emote_id\` = ${emoteID}`
      )
      .catch(error => {
        if (error !== 'Query returned nothing')
          console.error(error);
      });
    if (data[0].inD === 0) {
      await client.query(
        `INSERT INTO \`emote\` (\`server_id\`, \`emote_id\`) VALUES (${serverID}, ${emoteID})`
      );
    }
    await client.query(
      `UPDATE \`emote\` SET \`used\` = \`used\` + 1 WHERE \`server_id\` = ${serverID} AND \`emote_id\` = ${emoteID}`
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
      let content = payload.context.message.content.substr(
        payload.context.guild.prefix!.length
      );
      let tag: DBTags[] = await client
        .query(
          `SELECT * FROM \`tags\` WHERE \`guild\` = ${
            payload.context.guildId
          } AND \`name\` = ${connection.escape(content)}`
        )
        .catch((e) => {
          // Tag doesn't exist
          if (e === 'Query returned nothing') return;
          else console.log(e);
        });
      if (!tag) return;
      // Debugging info
      console.log(`Ran tag ${content} by ${payload.context.user.username}`);
      // Useful for tag stats
      await client.query(
        `UPDATE \`tags\` SET \`used\` = \`used\` + 1 WHERE \`name\` = ${connection.escape(
          content
        )}`
      );
      // This replaces custom bits inside tags like username and mentions.username etc
      let s: string = tag[0].content.replace(
        /{username}/g,
        payload.context.user.username
      );
      if (/{mentions.username}/g.test(s)) {
        if (!client.fetchGuildMember(payload.context)) {
          payload.context.reply('This tag requires that you mention a user!');
          return;
        }
        s = s.replace(
          /mentions.username/g,
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
        `UPDATE \`User\` SET \`xp_cool\`=NOW(), \`XP\`=\`XP\` + '${xp}' WHERE \`User_ID\` = ${ctx.user.id}`
      );
      if (userData[0].XP > userData[0].Next && enabled === 1) {
        ctx.reply(
          `Congrats ${ctx.user.username}! You just leveled up to level ${
            userData[0].Level + 1
          }`
        );
        await client.query(
          `UPDATE \`User\` SET \`Level\` = \`Level\` + 1, \`Next\` = \`Next\` + 500, \`xp\` = 0 WHERE \`User_ID\` = ${ctx.user.id}`
        );
      }
    }
  }
};
