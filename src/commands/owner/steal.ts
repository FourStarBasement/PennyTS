import { Context, CommandOptions } from 'detritus-client/lib/command';
import { Message } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';
import { MessageCollector } from '../../modules/collectors/messageCollector';

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
    } else if (!args.steal) {
      // get message before
      let messages = await ctx.channel?.fetchMessages({
        limit: 2,
      });
      message = messages!.toArray()[1];
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
      ctx.reply('Why are there no names.');
      return;
    }
    let index = 0;

    if (r.length > 1) {
      let s = '';
      emojis.forEach((e, i) => {
        s += `(${i + 1}) ${e}\n`;
      });

      ctx.reply(`More than one emoji detected! Which emoji do you want?\n${s}`);
      let filter = (m: Message) => m.author.id === ctx.member!.id;
      let collector = new MessageCollector(ctx, 120000, filter);
      collector.on('collect', async (m: Message) => {
        let content = m.content.toLowerCase();

        if (content === 'all') {
          collector.destroy();
          let toSay = [];
          for (let i of [...Array(r!.length).keys()]) {
            toSay.push((await createEmoji(ctx, emojis, r!, i, false))!.format);
          }

          ctx.reply(`I've added ${toSay.join(', ')} now. Now leave me alone!`);
        } else if (content === 'none') {
          collector.destroy();
          ctx.reply("Then why'd you call me here?!");
        } else {
          console.log(content);
          let wantedIndex = parseInt(content) || undefined;

          if (!wantedIndex) {
            ctx.reply('Dude can you even type a valid number or option??');
          } else {
            collector.destroy();
            await createEmoji(ctx, emojis, r!, wantedIndex - 1, true);
          }
        }
      });
      collector.on('end', () => {
        ctx.reply('Why do you type so slow dude.');
      });
    } else {
      await createEmoji(ctx, emojis, r, 0, true);
    }
  },
};

async function createEmoji(
  ctx: Context,
  emojis: RegExpMatchArray,
  r: RegExpMatchArray,
  index: number,
  confirm: boolean = false
) {
  let id = emojis[index].match(em_id)?.join('');
  let type = emojis[index].match(animated) !== null ? 'gif' : 'png';

  let img = await fetch(
    `https://cdn.discordapp.com/emojis/${id}.${type}`
  ).then(async (r) => r.buffer());

  return ctx.client.guilds
    .get('377926829643923458')
    ?.createEmoji({
      name: r[index],
      image: img,
      reason: 'Admin steal :>',
    })
    .then((e) => {
      if (confirm) ctx.reply(`I've added ${e.format}. Now leave me alone!`);
      return e;
    });
}
