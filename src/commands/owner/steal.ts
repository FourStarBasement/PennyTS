import { Context, CommandOptions } from 'detritus-client/lib/command';
import { Message } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';

const jumpLinkReg = /https?:\/\/discordapp.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
const em = /<a?:\w+:\d+>/g;
const em_name = /(?!a:)\w+(?=:)/gi;
const em_id = /\d{18}/g;
const animated = /(?!<)[a](?=:)/g;

interface CommandArgs {
  j: string; // jumplink
  i: string; // index
  steal: string; // ID
}

export const steal: CommandOptions = {
  name: 'steal',
  metadata: {
    description: 'Steal an emoji!',
  },
  args: [
    { default: undefined, name: 'j' },
    { default: undefined, name: 'i' },
  ],
  run: async (ctx: Context, args: CommandArgs) => {
    let message: Message;

    if (args.j) {
      // -j https://discordapp.com/channels/:id/:id/:id
      if (jumpLinkReg.test(args.j)) {
        let result = jumpLinkReg.exec(args.j);
        let guildId = result![1];
        let channelId = result![2];
        let messageId = result![3];
        let channel = ctx.client.guilds.get(guildId)!.channels.get(channelId);
        if (!channel) {
          ctx.reply('Uh oh! Channel not found!');
          return;
        }
        message = await channel.fetchMessage(messageId)!;
      }
    } else if (args.i) {
      // -i ^5
      let index = parseInt(args.i.substr(1, args.i.length));
      let messages = await ctx.channel?.fetchMessages({
        limit: index + 1,
      });
      message = messages!.toArray()[index]!;
    } else {
      // :id
      let splitArgs = args.steal.split(' ');
      let id = splitArgs[0];
      message = await ctx.channel?.fetchMessage(id);
    }

    if (!em.test(message!.content)) {
      ctx.reply('Uh oh! No emojis found. Did you copy the right ID?');
      return;
    }
    let r = message!.content.match(em_name);
    let emojis = message!.content.match(em)!;

    if (r === null) {
      ctx.reply('What.');
      return;
    }

    if (r.length > 1) {
      ctx.reply(
        "Uh oh! Can't handle multiple emojis yet because someone forgot to program it!"
      );
    } else {
      let id = emojis[0].match(em_id)?.join('');
      let type = emojis[0].match(animated) !== null ? 'gif' : 'png';

      console.log(id, r[0], type);

      let img = await fetch(
        `https://cdn.discordapp.com/emojis/${id}.${type}`
      ).then(async (r) => r.buffer());

      ctx.client.guilds
        .get('309531752014151690')
        ?.createEmoji({
          name: r[0],
          image: img,
          reason: 'Admin steal :>',
        })
        .then((e) => {
          ctx.reply(`I've added ${e.format} now. Now leave me alone!`);
        });
    }
  },
};
