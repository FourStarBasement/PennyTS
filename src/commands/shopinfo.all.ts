import { Context } from 'detritus-client/lib/command';
import { Page } from '../modules/paginator';
import { items, ItemInfo } from '../modules/shop';
import { shopEmbed } from '../modules/utils';

export const shopinfoAll = {
  name: 'shopinfo all',
  run: async (ctx: Context) => {
    let pages = new Array<Page>();
    let shopKeys = Object.keys(items);

    shopKeys.forEach((element: string) => {
      var currItem: ItemInfo = items[element];

      pages.push(shopEmbed(ctx, currItem));
    });

    ctx.commandClient.paginate(ctx, pages);
  },
};
