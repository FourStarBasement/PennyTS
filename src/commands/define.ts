import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

interface CommandArgs {
  define: string;
}

export const define = {
  name: 'define',
  metadata: {
    description: 'Gets a definition for a word from urban dictionary.',
    checks: ['embed'],
  },
  arg: { name: 'word' },
  run: async (ctx: Context, args: CommandArgs) => {
    try {
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
            text: `Requested by ${ctx.member}`,
            iconUrl: ctx.member!.avatarUrl,
          },
          color: 9043849,
        },
      });
    } catch (e) {
      console.log(e);
    }
  },
};
