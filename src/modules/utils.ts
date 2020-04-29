import { Context } from 'detritus-client/lib/command';
import { ItemInfo } from './shop';
import { Page } from './paginator';
import { Duration } from 'moment';
import { CommandClient } from 'detritus-client';

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

export function humanize(duration: Duration) {
  let ret = [];

  let days = duration.days();
  let hours = duration.hours();
  let minutes = duration.minutes();

  if (days > 0) {
    ret.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    ret.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    ret.push(
      `${ret.length > 0 ? 'and ' : ''}${minutes} minute${
        minutes > 1 ? 's' : ''
      }`
    );
  }

  return ret.join(', ');
}

export interface EventHandler {
  event: string;
  listener: (client: CommandClient, payload: any) => void;
}
