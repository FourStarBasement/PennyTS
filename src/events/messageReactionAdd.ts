import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { ShardClient } from 'detritus-client';
import { Message, User } from 'detritus-client/lib/structures';
import { Page } from '../modules/paginator';

const urlReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
const chanReg = /<#(\d+)>/;

export const messageReactionAdd = {
  event: ClientEvents.MESSAGE_REACTION_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.MessageReactionAdd
  ) => {
    console.log(payload);
    const shardClient = client.client as ShardClient;

    let channel = shardClient.channels.get(payload.channelId)!;
    let message: Message =
      payload.message || (await channel.fetchMessage(payload.messageId));
    let author = message.author;
    let me = channel.guild!.me!;

    if (
      !payload.guildId ||
      payload.reaction.emoji.name !== '⭐' ||
      channel.nsfw ||
      author.bot
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
      if (payload.userId === me.id && message.embeds.length > 0) {
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

      try {
        client.starQueue.push(wrap(client, message, payload.user!, embed));
      } catch (error) {
        console.error('ReactionAdd/Starboard Error:', error);
      }
    });
  },
};

function wrap(
  client: CommandClient,
  message: Message,
  reacted: User,
  embed: Page
) {
  return async () => await prepare(client, message, reacted, embed);
}

async function prepare(
  client: CommandClient,
  message: Message,
  reacted: User,
  embed: Page
) {
  console.log('ReactionAdd/Starboard: Running.');
  let channels = message.guild?.channels!;
  let data = await client.fetchStarData(message);

  if (data.count === 1) {
    // Message in starboard
    let m: Message = await channels
      .get('657753047585390593') // data.starboard
      ?.fetchMessage(data.starID);

    // Original Message
    let ms: Message = await channels
      .get(chanReg.exec(m.content)![1])
      ?.fetchMessage(data.messageID);

    if (reacted.id === ms.author.id) {
      await m.reactions.get('⭐')?.delete(reacted.id);
      await ms.reactions.get('⭐')?.delete(reacted.id);
      return;
    }

    if (message.content.startsWith('⭐') && message.id == data.starID) {
      for (let reaction of ms.reactions.values()) {
        if ((await reaction.fetchUsers()).has(reacted.id)) {
          return;
        }
      }

      embed.title = ms.author.username;
      embed.thumbnail = {
        url: ms.author.avatarUrl,
      };
    }

    let g = m.reactions.find((v, k) => v.emoji.name === '⭐')?.count || 0;

    embed.fields = [
      {
        name: 'Jump to this message',
        value: `[Jump!](${ms.jumpLink})`,
      },
    ];

    await m.edit({
      content: `⭐ ${
        (ms.reactions.find((r) => r.emoji.name === '⭐')?.count || 0) + g
      } stars in ${ms.channel?.mention}`,
      embed: embed,
    });
  } else if (data.starboard) {
    for (let reaction of message.reactions.values()) {
      if (reaction.emoji.name !== '⭐') {
        return;
      }

      let stars = (await reaction.fetchUsers()).filter(
        (v, k) => v.id !== message.author.id
      );
      if (stars.length >= 1) {
        embed.fields = [
          {
            name: 'Jump to this message',
            value: `[Jump!](${message.jumpLink})`,
          },
        ];

        channels
          .get('657753047585390593') // data.starboard
          ?.createMessage({
            content: `⭐ ${stars.length} stars in ${message.channel?.mention}`,
            embed: embed,
          })
          .then(async (m) => {
            await client.query(
              `INSERT INTO \`starboard\` (msgID, starID) VALUES (${message.id}, ${m.id})`
            );
          });
      }
    }
  }
}
