import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { ShardClient } from 'detritus-client';
import { Message, User, Reaction } from 'detritus-client/lib/structures';
import { Page } from '../modules/paginator';
import { convertEmbed } from '../modules/starboard';

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

    if (
      !payload.guildId ||
      payload.reaction.emoji.name !== '⭐' ||
      channel.nsfw ||
      payload.member!.bot
    ) {
      return;
    }

    // Drop-in Replacement for Embed
    let embed: Page = {
      title: author.name,
      thumbnail: { url: author.avatarUrl },
      color: 9043849,
    };

    await client.checkGuild(payload.guildId, () => {
      embed = convertEmbed(channel.guild!.me!, message, embed);
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
    console.log(`ReactionAdd/Starboard G#${message.guildId}: Running.`);
    try {
      await prepare(client, message, reacted, embed);
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
  embed: Page
) {
  let r = await client.fetchStarData(message);

  if (r.original && r.starred) {
    if (reacted.id === r.original.author.id) {
      await r.original.reactions.get('⭐')?.delete(reacted.id);
      await r.starred.reactions.get('⭐')?.delete(reacted.id);
      console.log(
        `ReactionAdd/Starboard G#${message.guildId}: Self-star: M#${r.original.id} U#${reacted.id}`
      );
      return;
    }

    // Starboard message
    if (message.content.startsWith('⭐') && message.id == r.starred.id) {
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
      content: `⭐ ${count} stars in ${r.original.channel?.mention}`,
      embed: embed,
    });
    console.log(
      `ReactionAdd/Starboard G#${message.guildId}: Starboard Message Edited: C#${r.starred?.channelId} M#${r.starred.id}`
    );
  } else if (r.starboard) {
    for (let reaction of message.reactions.values()) {
      if (reaction.emoji.name !== '⭐') {
        continue;
      }

      let stars = (await reaction.fetchUsers()).filter(
        (v, k) => v.id !== message.author.id
      );
      if (stars.length >= 2) {
        embed.fields = [
          {
            name: 'Jump to this message',
            value: `[Jump!](${message.jumpLink})`,
          },
        ];

        r.starboard
          .createMessage({
            content: `⭐ ${stars.length} stars in ${message.channel?.mention}`,
            embed: embed,
          })
          .then(async (m) => {
            await client.query(
              `INSERT INTO \`starboard\` (msgID, starID) VALUES (${message.id}, ${m.id})`
            );
            console.log(
              `ReactionAdd/Starboard G#${message.guildId} C#${m.channelId}: New Starred Message: M#${m.id}`
            );
          });
      }
    }
  }
}
