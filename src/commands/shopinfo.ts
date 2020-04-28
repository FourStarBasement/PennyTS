import { Context } from 'detritus-client/lib/command';
import { items, ItemInfo } from '../modules/shop';
import { Page } from '../modules/paginator';
import { shopEmbed } from '../modules/utils';

const validSubcommands = ['all', 'backgrounds', 'emblems'];

let categories = new Array<string>();

let values: ItemInfo[] = Object.values(items);

values.forEach((element: ItemInfo) => {
  if (!categories.includes(element.meta.c)) {
    categories.push(element.meta.c);
  }
});

interface CommandArgs {
  shopinfo: string;
}

export const shopinfo = {
  name: 'shopinfo',
  metadata: {
    description: 'View an item or a certain category of items at the shop.',
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

    if (categories.includes(arg.shopinfo)) {
      let pages = new Array<Page>();

      values.forEach((element: ItemInfo) => {
        if (element.meta.c === arg.shopinfo) {
          pages.push(shopEmbed(ctx, element));
        }
      });

      ctx.commandClient.paginate(ctx, pages);
    } else {
      let found = false;
      values.forEach((element: ItemInfo) => {
        if (element.name === arg.shopinfo) {
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
