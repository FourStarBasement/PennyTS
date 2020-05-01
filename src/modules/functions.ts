import { Context, Command, CommandOptions } from 'detritus-client/lib/command';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { Member, User, Message } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';
import { Job } from 'node-schedule';
import { Paginator, Page } from './paginator';
import { Connection } from 'mysql';
import { StarData, StarboardInfo, FetchedStarData } from './starboard';
import { EventHandler } from './utils';

const chanReg = /<#(\d+)>/;

// Additional properties/functions to access on the commandClient
declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    query: (query: string) => Promise<any>; // Promise based queries
    fetchGuildMember: (ctx: Context) => Member | User | undefined; // Easier method to fetch guild members
    checkImage: (image: string) => Promise<string>; // Checks if an image returns OK before sending
    checkGuild: (id: string) => Promise<void>; // Checks if a guild is in the database before making SQL calls
    checkUser: (id: string) => Promise<void>; // Checks if a user is in the database before making SQL calls
    paginate: (
      ctx: Context,
      pages: Array<Page>,
      footer?: string
    ) => Promise<Paginator>; // Handle reaction collectors and pagination
    addEvents: (events: EventHandler[]) => CommandClient; // Load in events from ./events/
    fetchStarData: (message: Message) => Promise<FetchedStarData>; // Fetches data for starboard
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
  client.checkUser = async (id: string) => {
    let result: any[] = await client
      .query(
        `SELECT COUNT(*) AS \`count\` FROM \`User\` WHERE \`User_ID\` = ${id}`
      )
      .catch(console.error);
    if (result[0].count === 0) {
      await client
        .query(`INSERT INTO \`User\`(\`User_ID\`) VALUES ('${id}')`)
        .catch(console.error);
    }
  };

  // Check if the guild is in the DB before doing anything
  client.checkGuild = async (id: string) => {
    let result: any[] = await client
      .query(
        `SELECT COUNT(*) AS \`count\` FROM \`Servers\` WHERE \`ServerID\` = '${id}'`
      )
      .catch(console.error);

    if (result[0].count === 0) {
      await client
        .query(`INSERT INTO \`Servers\` (\`ServerID\`) VALUES ('${id}')`)
        .catch(console.error);
    }
  };

  // This handles all the stuff like levels and custom prefixes
  client.onPrefixCheck = async (context: Context) => {
    if (context.user.bot) return '';
    await client.checkUser(context.user.id);
    let d = await client
      .query(
        `SELECT *, NOW()-INTERVAL 2 MINUTE > \`xp_cool\` AS xpAdd FROM \`User\` WHERE \`User_ID\` = ${context.user.id}`
      )
      .catch(console.error);
    if (d[0].Blacklisted === 1) return '';
    if (context.guildId) {
      let prefix: string;
      if (context.guild?.prefix) {
        prefix = context.guild.prefix;
      } else {
        await client.checkGuild(context.guildId);
        let data = await client
          .query(
            `SELECT \`Prefix\`, \`levels\` FROM \`Servers\` WHERE \`ServerID\` = ${context.guildId}`
          )
          .catch(console.error);
        context.guild!.levels = data[0].levels;
        prefix = data[0].Prefix;
        context.guild!.prefix = prefix;
      }
      xpAdd(context, context.guild!.levels, d);
      if (context.message.content.indexOf(prefix) === 0) return prefix;
    }
    return '';
  };

  // This is to help commands with pagination features
  client.paginate = async (
    ctx: Context,
    pages: Array<Page>,
    footer: string = ''
  ) => {
    let p = new Paginator(ctx, pages, footer);
    await p.start();

    return p;
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
    if (!command.metadata.checks) {
      return true;
    }

    for (let check of command.metadata.checks) {
      switch (check) {
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
      }
    }
    return true;
  };

  // This fetches starboard data
  client.fetchStarData = async (message: Message) => {
    let starData: StarData[] = await client.query(
      `SELECT COUNT(*) AS \`count\`, \`msgID\`, \`starID\` FROM \`starboard\` WHERE \`msgID\` = ${message.id} OR \`starID\` = ${message.id}`
    );
    let starboardInfo: StarboardInfo[] = await client.query(
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
