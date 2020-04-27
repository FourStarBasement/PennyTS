import { Context } from 'detritus-client/lib/command';
import { ItemInfo } from './shop';
import { Page } from './paginator';

export function shopEmbed(ctx: Context, currItem: ItemInfo): Page {
  return {
    author: {
      url: currItem.oc.url,
      name: `Shop info for ${currItem.name}`,
    },
    title: `Original art by ${currItem.oc.name}`,
    color: 9043849,
    fields: [
      {
        name: 'Price:',
        value: currItem.price,
      },
      {
        name: 'Purchase:',
        value: `${ctx.prefix}set${currItem.type} ${currItem.name}`,
      },
    ],
    image: {
      url: currItem.image,
    },
  };
}
