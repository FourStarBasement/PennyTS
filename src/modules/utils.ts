import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { Duration } from 'moment';
import { ItemInfo } from './shop';

export interface PageField {
  name: string;
  value: string;
}

export interface Page {
  author?: {
    iconUrl?: string;
    name?: string;
    url?: string;
  };
  thumbnail?: {
    url: string;
  };
  description?: string;
  title?: string;
  color?: number;
  image?: {
    url: string;
  };
  fields?: PageField[];
  footer?: {
    text: string;
    iconUrl?: string;
  };
  url?: string;
}

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
  listener: (client: CommandClient, payload: any) => Promise<void>;
}
