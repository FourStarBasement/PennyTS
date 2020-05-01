import { Context } from 'detritus-client/lib/command';
import { items, ItemInfo } from '../modules/shop';
import { Page, shopEmbed } from '../modules/utils';
import { EmbedPaginator } from '../modules/collectors/embedPaginator';

export const shopinfoEmblems = {
  name: 'shopinfo emblems',
  metadata: {
    description: 'View all emblems available at the shop.',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let pages = new Array<Page>();
    let shopKeys = Object.keys(items);

    shopKeys.forEach((element: string) => {
      var currItem: ItemInfo = items[element];

      if (currItem.type !== 'emblem') {
        return;
      }

      pages.push(shopEmbed(ctx, currItem));
    });

    new EmbedPaginator(ctx, pages).start();
  },
};
