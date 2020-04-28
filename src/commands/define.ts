import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

interface CommandArgs {
  define: string;
}

export const define = {
  name: 'define',
  metadata: {
    description: 'Gets a definition for a word from urban dictionary.',
  },
  arg: { name: 'word' },
  run: async (ctx: Context, args: CommandArgs) => {
    try {
      if (!ctx.channel?.canEmbedLinks) {
        ctx.reply('I cannot send embeds in this chat.');
        return;
      }

      if (!args.define) {
        ctx.reply(`Usage: ${ctx.prefix}define {word to define}`);
        return;
      }

      let url = `http://api.urbandictionary.com/v0/define?term=${args.define}`;
      let result = await fetch(url).then(async (r) => await r.json());

      if (result.list.length === 0) {
        ctx.reply("It seems that word doesn't have a definition.");
        return;
      }

      ctx.reply({
        embed: {
          fields: [
            {
              name: `Definition for: ${args.define}`,
              value: result.list[0].definition,
            },
          ],
          footer: {
            text: `Requested by ${ctx.message.author}`,
            iconUrl: ctx.message.author.avatarUrl,
          },
          color: 9043849,
        },
      });
    } catch (e) {
      console.log(e);
    }
  },
};
