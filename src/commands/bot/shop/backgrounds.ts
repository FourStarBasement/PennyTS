import { Context } from 'detritus-client/lib/command';
import { EmbedPaginator } from '../../../modules/collectors/embedPaginator';
import { DBUserBackgrounds, DBUser } from '../../../modules/db';

export const backgrounds = {
  name: 'backgrounds',
  metadata: {
    description: 'View the background(s) you have purchased.',
    checks: ['embed'],
  },
  aliases: ['background'],
  run: async (ctx: Context) => {
    let bg: Array<any> = [];
    let i = 0;
    let data: DBUserBackgrounds[] = await ctx.commandClient
      .query(`SELECT * FROM user_backgrounds WHERE user_id = ${ctx.member!.id}`)
      .catch(console.error);
    if (!data || data.length < 1) {
      ctx.reply('You do not own any backgrounds.');
      return;
    }

    data.forEach((element: DBUserBackgrounds) => {
      if (element.name !== 'default') {
        bg.push(embed(element.name));
      }
    });

    new EmbedPaginator(ctx, bg).start();
    return;
  },
};

function embed(bg: any) {
  return {
    title: bg,
    color: 9043849,
    image: {
      url: `https://penny.wiggy.dev/assets/backgrounds/${bg}.png`,
    },
  };
}
