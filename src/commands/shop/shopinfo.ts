import { Context } from 'detritus-client/lib/command';
import { items, ItemInfo } from '../../modules/shop';
import { Page, shopEmbed } from '../../modules/utils';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';

const validSubcommands = ['all', 'backgrounds', 'emblems'];

let categories = new Array<string>();

let values: ItemInfo[] = Object.values(items);

values.forEach((element: ItemInfo) => {
  if (!categories.includes(element.meta.c.toLowerCase())) {
    categories.push(element.meta.c.toLowerCase());
  }
});

interface CommandArgs {
  shopinfo: string;
}

export const shopinfo = {
  name: 'shopinfo',
  metadata: {
    description: 'View an item or a certain category of items at the shop.',
    checks: ['embeds'],
  },
  arg: { name: 'subcommand' },
  run: async (ctx: Context, arg: CommandArgs) => {
    if (!arg.shopinfo) {
      ctx.reply(
        `Usage: ${ctx.prefix}shopinfo {backgrounds/emblems/all/category}`
      );
      return;
    } else if (validSubcommands.includes(arg.shopinfo)) {
      return;
    }

    if (categories.includes(arg.shopinfo.toLowerCase())) {
      let pages = new Array<Page>();

      values.forEach((element: ItemInfo) => {
        if (element.meta.c === arg.shopinfo.toLowerCase()) {
          pages.push(shopEmbed(ctx, element));
        }
      });

      new EmbedPaginator(ctx, pages).start();
    } else {
      let found = false;
      values.forEach((element: ItemInfo) => {
        if (element.name.toLowerCase() === arg.shopinfo.toLowerCase()) {
          ctx.reply({ embed: shopEmbed(ctx, element) });
          found = true;
        }
      });
      if (!found) {
        ctx.reply('I could not find the item you were looking for.');
      }
    }
  },
};
