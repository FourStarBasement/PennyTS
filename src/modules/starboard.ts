import {
  Message,
  ChannelGuildText,
  User,
} from 'detritus-client/lib/structures';
import { Page } from './paginator';

// Deserialise some starboard stuff
export interface StarData {
  count: number;
  msgID: string;
  starID: string;
}

export interface StarboardInfo {
  starboard: string;
}

// So that linter doesn't complain
export interface FetchedStarData {
  original?: Message;
  starred?: Message;
  starboard?: ChannelGuildText;
}

const urlReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

export function convertEmbed(me: User, message: Message, embed: Page) {
  if (message.author.id === me.id && message.embeds.size > 0) {
    let msgEmbed = message.embeds.get(0)!;
    embed.image = msgEmbed.image; // Can be Respective Object OR undefined
    embed.description = msgEmbed.description;
    embed.thumbnail = msgEmbed.thumbnail;
  } else {
    if (urlReg.test(message.content)) {
      embed.image = {
        url: message.content.match(urlReg)![0],
      };
    } else if (message.attachments.size > 0) {
      embed.image = {
        url: message.attachments.first()!.url!,
      };
    }
    if (message.content.length > 0) {
      embed.description = message.content;
    }
  }
  return embed;
}
