import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { ShardClient } from 'detritus-client';
import { Message, User, Reaction, Emoji } from 'detritus-client/lib/structures';
import { Page, convertEmbed } from '../modules/utils';
import { QueryType, DBServer } from '../modules/db';

export const messageReactionAdd = {
  event: ClientEvents.MESSAGE_REACTION_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.MessageReactionAdd
  ) => {
    const shardClient = client.client as ShardClient;

    let channel = shardClient.channels.get(payload.channelId)!;
    let message: Message =
      payload.message || (await channel.fetchMessage(payload.messageId));
    let author = message.author;

    if (!payload.guildId || channel.nsfw || payload.member!.bot) {
      return;
    }

    let server: DBServer = await client.queryOne(
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
    console.log(`ReactionAdd/Starboard G#${message.guildId}: Running.`);
    try {
      await prepare(client, message, reacted, embed, server, emoji);
    } catch (error) {
      return console.log(
        `ReactionAdd/Starboard G#${message.guildId}: Error:`,
        error
      );
    }
    console.log(`ReactionAdd/Starboard G#${message.guildId}: Complete.`);
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
    if (reacted.id === r.original.author.id) {
      await r.original.reactions
        .get(server.starboard_emoji as string)
        ?.delete(reacted.id);
      await r.starred.reactions
        .get(server.starboard_emoji as string)
        ?.delete(reacted.id);
      console.log(
        `ReactionAdd/Starboard G#${message.guildId}: Self-star: M#${r.original.id} U#${reacted.id}`
      );
      return;
    }
    // Starboard message
    if (
      (message.content.startsWith(emote.name) ||
        message.content.startsWith(`<`)) &&
      message.id == r.starred.id
    ) {
      for (let reaction of r.original.reactions.values()) {
        if ((await reaction.fetchUsers()).has(reacted.id)) {
          console.log(
            `ReactionAdd/Starboard G#${message.guildId}: Dupe-star: M#${r.starred.id} U#${reacted.id}`
          );
          return;
        }
      }

      embed.title = r.original.author.username;
      embed.thumbnail = {
        url: r.original.author.avatarUrl,
      };
    }

    let rs: Reaction[] = Array.from(r.original.reactions.cache.values()).concat(
      Array.from(r.starred.reactions.cache.values())
    ); // Join reaction lists

    let uniqueReactions = new Array<string>();

    for (let reaction of rs) {
      for (let u of (await reaction.fetchUsers()).values()) {
        if (!uniqueReactions.includes(u.id)) {
          uniqueReactions.push(u.id);
        }
      }
    }

    let count = uniqueReactions.length;

    embed.fields = [
      {
        name: 'Jump to this message',
        value: `[Jump!](${r.original.jumpLink})`,
      },
    ];

    await r.starred.edit({
      content: `${emote} ${count} ${emote.id ? emote.name : 'reaction'}s in ${
        r.original.channel?.mention
      }`,
      embed: embed,
    });
    console.log(
      `ReactionAdd/Starboard G#${message.guildId}: Starboard Message Edited: C#${r.starred?.channelId} M#${r.starred.id}`
    );
  } else if (r.starboard) {
    for (let reaction of message.reactions.values()) {
      if (reaction.emoji.name !== emote.name) {
        continue;
      }

      let stars = (await reaction.fetchUsers()).filter(
        (v, k) => v.id !== message.author.id
      );

      if (stars.length >= r.limit!) {
        embed.fields = [
          {
            name: 'Jump to this message',
            value: `[Jump!](${message.jumpLink})`,
          },
        ];

        if (!r.starboard.canMessage) {
          console.log(
            `ReactionAdd/Starboard G#${message.guildId} C#${r.starboard.id}: Insufficient permissions to post to starboard.`
          );
          return; /* Got rejected from writing to starboard */
        }

        r.starboard
          .createMessage({
            content: `${emote} ${stars.length} ${
              emote.id ? emote.name : 'reaction'
            }s in ${message.channel?.mention}`,
            embed: embed,
          })
          .then(async (m) => {
            await client.preparedQuery(
              'INSERT INTO starboard (message_id, star_id) VALUES ($1, $2)',
              [message.id, m.id],
              QueryType.Void
            );

            console.log(
              `ReactionAdd/Starboard G#${message.guildId} C#${m.channelId}: New Starred Message: M#${m.id}\nAdded to Starboard`
            );
          });
      }
    }
  }
}
