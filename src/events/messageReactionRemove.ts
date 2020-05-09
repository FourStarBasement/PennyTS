import { ClientEvents } from 'detritus-client/lib/constants';
import {
  CommandClient,
  GatewayClientEvents,
  ShardClient,
} from 'detritus-client';
import { Message, User } from 'detritus-client/lib/structures';
import { Page, convertEmbed } from '../modules/utils';

export const messageReactionRemove = {
  event: ClientEvents.MESSAGE_REACTION_REMOVE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.MessageReactionRemove
  ) => {
    const shardClient = client.client as ShardClient;

    let channel = shardClient.channels.get(payload.channelId)!;
    let message: Message =
      payload.message || (await channel.fetchMessage(payload.messageId));
    let author = message.author;

    if (
      !payload.guildId ||
      payload.reaction.emoji.name !== '⭐' ||
      payload.user!.bot
    ) {
      return;
    }

    // Drop-in Replacement for Embed
    let embed: Page = {
      title: author.name,
      thumbnail: { url: author.avatarUrl },
      color: 9043849,
      fields: [
        {
          name: 'Jump to this message',
          value: `[Jump!](${message.jumpLink})`,
        },
      ],
    };

    await client.checkGuild(payload.guildId).then(() => {
      embed = convertEmbed(author, message, embed);
      client.starQueue.push(wrap(client, message, payload.user!, embed));
    });
  },
};

function wrap(
  client: CommandClient,
  message: Message,
  reacted: User,
  embed: Page
) {
  return async () => {
    console.log(`ReactionRemove/Starboard G#${message.guildId}: Running.`);
    try {
      await prepare(client, message, reacted, embed);
    } catch (error) {
      return console.log(
        `ReactionRemove/Starboard G#${message.guildId}: Error:`,
        error
      );
    }
    console.log(`ReactionRemove/Starboard G#${message.guildId}: Complete.`);
  };
}

async function prepare(
  client: CommandClient,
  message: Message,
  reacted: User,
  embed: Page
) {
  let r = await client.fetchStarData(message);
  let stars = parseInt(r.starred?.content.split(' ')[1]!);
  let reaction = r.original?.reactions.find((v, k) => v.emoji.name === '⭐')!;
  if ((await reaction.fetchUsers()).has(reacted.id)) {
    console.log(
      `ReactionRemove/Starboard G#${message.guildId}: Dupe-star M#${
        r.starred!.id
      } U#${reacted.id}`
    );
    return;
  }
  if (stars < 2) {
    await r.starred!.delete().catch(() => null);
  } else {
    await r.starred!.edit({
      content: `⭐ ${stars - 1} stars in ${r.original?.channel?.mention}`,
      embed: embed,
    });
  }
  console.log(
    `ReactionRemove/Starboard G#${
      message.guildId
    }: Starboard Message Edited: C#${r.starboard!.id} M#${r.starred!.id}`
  );
}
