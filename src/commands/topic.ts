import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

export const topic = {
  name: 'topic',
  run: async (ctx: Context) => {
    await fetch('https://www.conversationstarters.com/random.php')
      .then(async (r) => await r.text())
      .then((r) => {
        ctx.reply(r.split('>')[1]);
      });
  },
};
