import { Context, Command } from 'detritus-client/lib/command';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { Member, User } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';
import { Embed } from 'detritus-client/lib/utils';
import { Paginator, Page } from './paginator';

declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    shopAll: Map<string, number>;
    query: (query: string) => Promise<any>;
    fetchGuildMember: (ctx: Context) => Member | User | undefined;
    checkImage: (image: string) => Promise<string>;
    paginate: (
      ctx: Context,
      pages: Array<Page>,
      footer?: string
    ) => Promise<Paginator>;
  }
}

export default (client: CommandClient, connection: any) => {
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
    //console.log(image)
    let r = await fetch(image);
    if (r.statusText !== 'OK') return '';

    return image;
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
};
