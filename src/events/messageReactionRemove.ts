import { ClientEvents } from 'detritus-client/lib/constants';
import {
  CommandClient,
  GatewayClientEvents,
  ShardClient,
} from 'detritus-client';
import { Message, User, Emoji, Reaction } from 'detritus-client/lib/structures';
import { Page, convertEmbed } from '../modules/utils';
import { QueryType, DBServer } from '../modules/db';

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

    if (!payload.guildId || channel.nsfw || payload.user!.bot) {
      return;
    }

    const server: DBServer = await client.queryOne(
      `SELECT starboard_emoji FROM servers WHERE server_id = ${payload.guildId}`
    );

    if (isNaN(server.starboard_emoji as number)) {
      if (payload.reaction.emoji.name !== server.starboard_emoji) return;
    } else {
      if (server.starboard_emoji !== payload.reaction.emoji.id) return;
    }

    // Drop-in Replacement for Embed
    let embed: Page = {
      title: author.name,
      thumbnail: { url: author.avatarUrl },
      color: author.avgColor
        ? author.avgColor
        : await client.fetchAverageColor(author.avatarUrl),
      fields: [
        {
          name: 'Jump to this message',
          value: `[Jump!](${message.jumpLink})`,
        },
      ],
    };

    await client.checkGuild(payload.guildId).then(() => {
      embed = convertEmbed(author, message, embed);
      client.starQueue.push(
        wrap(
          client,
          message,
          payload.user!,
          embed,
          server,
          payload.reaction.emoji
        )
      );
    });
  },
};

function wrap(
  client: CommandClient,
  message: Message,
  reacted: User,
  embed: Page,
  server: DBServer,
  emoji: Emoji
) {
  return async () => {
    console.log(`ReactionRemove/Starboard G#${message.guildId}: Running.`);
    try {
      await prepare(client, message, reacted, embed, server, emoji);
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
  embed: Page,
  server: DBServer,
  emoji: Emoji
) {
  let r = await client.fetchStarData(message);
  let emote: Emoji = new Emoji(client.client as ShardClient, {
    name: '⭐',
  });

  if (server.starboard_emoji) {
    if (emoji.id) {
      if (message.guild?.emojis.get(server.starboard_emoji as string))
        emote = message.guild!.emojis.get(server.starboard_emoji as string)!;
      else return;
    }
  }
  if (r.original && r.starred) {
    let rs: Reaction[] = Array.from(r.original.reactions.cache.values())
      .concat(Array.from(r.starred.reactions.cache.values()))
      .filter((reaction) => reaction.emoji.name == emote.name);

    let reaction = r.starred.reactions.get(server.starboard_emoji as string);
    let uniqueReactions = new Array<string>();

    for (let reaction of rs) {
      for (let u of (await reaction.fetchUsers()).values()) {
        if (!uniqueReactions.includes(u.id)) {
          uniqueReactions.push(u.id);
        }
      }
    }

    let count = uniqueReactions.length;
    if (reaction && (await reaction.fetchUsers()).has(reacted.id)) {
      console.log(
        `ReactionRemove/Starboard G#${message.guildId}: Dupe-star M#${r.starred.id} U#${reacted.id}`
      );
      return;
    }

    if (count < r.limit!) {
      await r.starred
        .delete()
        .then(async () => {
          await client.preparedQuery(
            'DELETE FROM starboard WHERE message_id = $1',
            [message.id],
            QueryType.Void
          );
        })
        .catch(() => null);
    } else {
      await r.starred.edit({
        content: `${emote} ${count} ${emote.id ? emote.name : 'reaction'}s in ${
          r.original?.channel?.mention
        }`,
        embed: embed,
      });
    }
    console.log(
      `ReactionRemove/Starboard G#${
        message.guildId
      }: Starboard Message Edited: C#${r.starboard!.id} M#${r.starred.id}`
    );
  }
}
