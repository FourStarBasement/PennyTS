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

declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    query: (query: string) => Promise<any>;
    fetchGuildMember: (ctx: Context) => Member | User | undefined;
    checkImage: (image: string) => Promise<string>;
    checkGuild: (id: string, callback: Function) => Promise<void>;
    paginate: (
      ctx: Context,
      pages: Array<Page>,
      footer?: string
    ) => Promise<Paginator>;
    addEvents: (events: EventHandler[]) => CommandClient;
    fetchStarData: (message: Message) => Promise<FetchedStarData>;

    job: Job;
    starQueue: any[];
    starInterval: Job;
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

  client.checkImage = async (image: string) => {
    let r = await fetch(image);
    if (r.statusText !== 'OK') return '';

    return image;
  };

  // Check if the guild is in the DB before doing anything
  client.checkGuild = async (id: string, callback: Function) => {
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
    callback();
  };

  client.onPrefixCheck = async (context: Context) => {
    if (!context.user.bot && context.guildId) {
      let prefix = '!!';
      if (context.message.content.indexOf(prefix) === 0) return prefix;
    }
    return '';
  };

  client.paginate = async (
    ctx: Context,
    pages: Array<Page>,
    footer: string = ''
  ) => {
    let p = new Paginator(ctx, pages, footer);
    await p.start();

    return p;
  };
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
  client.on('commandRan', (cmd) => {
    console.log(
      `Ran command ${cmd.command.name} by ${cmd.context.member!.username}`
    );
  });
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

  client.addMultiple = (commands?: CommandOptions[]) => {
    commands?.forEach((command) => {
      client.add(command);
      console.log('Loaded Command', command.name);
    });
    return client;
  };

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

  client.starQueue = [];
};
