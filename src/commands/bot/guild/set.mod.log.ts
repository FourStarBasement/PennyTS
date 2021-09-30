import { Context } from 'detritus-client/lib/command';
import { ModLogReactions } from '../../../modules/modlog';
import { ModLogActionFlags } from '../../../modules/db';
import { ReactionCollector } from '../../../modules/collectors/reactionCollector';
import {
  Reaction,
  User,
  Message,
  ChannelGuildText,
  Channel,
} from 'detritus-client/lib/structures';
import { Page, chanReg } from '../../../modules/utils';

const reactions = Object.keys(ModLogReactions);

export const setModLog = {
  name: 'set mod log',
  metadata: {
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: Record<string, string>) => {
    if (!args['set mod log']) {
      ctx.reply(`Usage: ${ctx.prefix}set mod log {config/channel} [value]`);
      return;
    }
    let splitArgs = args['set mod log'].split(' ');
    let attr = splitArgs.shift();
    let value = splitArgs.join(' ');

    if (attr === 'channel') {
      let channel: Channel | undefined;

      if (value.startsWith('<#') && value.endsWith('>')) {
        // Channel Mention
        var channelID = chanReg.exec(value)![1];
        channel = ctx.guild!.channels.get(channelID);
      } else if (isNaN(Number(value))) {
        // Channel Name
        channel = ctx.guild!.channels.find((v) => v.name === value);
      } else {
        // Channel ID (Last Resort)
        channel = ctx.guild!.channels.get(value);
      }

      if (!channel) {
        ctx.reply(
          "Mod Log Channel: Sorry, I couldn't find the channel you provided!"
        );
      } else {
        await ctx.commandClient
          .query(
            `UPDATE servers SET mod_channel = ${channel.id} WHERE server_id = ${ctx.guildId}`
          )
          .then(() =>
            ctx.reply(
              `Mod Log Channel: Successfully set as ${channel!.mention}!`
            )
          );
      }
      return;
    } else if (attr === 'config') {
      let bits: ModLogActionFlags = ctx.guild?.modLog!;

      let message = await ctx.reply({
        embed: makeEmbed(bits),
      });

      addReactions(message);

      let filter = (r: Reaction, u: User) =>
        ctx.member!.id === u.id && message.id === r.messageId;
      let collector = new ReactionCollector(ctx, 30_0000, message, filter);

      collector.on('collect', (r: Reaction, u: User) => {
        r.delete(u.id);
        let toEnable = ModLogReactions[r.emoji.name];

        if (!toEnable) {
          if (r.emoji.name === '⏹️') {
            collector.destroy();
            ctx.commandClient
              .query(
                `UPDATE servers SET modlog_perm = ${bits} WHERE server_id = ${ctx.guildId}`
              )
              .then(() => {
                message.edit({ content: 'Set!', embed: {} });
                message.deleteReactions();
                ctx.guild!.modLog = bits;
              });

            return;
          }
        } else {
          for (let bit of ModLogReactions[r.emoji.name]) {
            if (bits & bit) {
              bits &= ~bit; // Disable
            } else {
              bits |= bit; // Enable
            }
          }
          message.edit({ embed: makeEmbed(bits) });
        }
      });
      return;
    }

    ctx.reply(`Usage: ${ctx.prefix}set mod log {config/channel} [value]`);
  },
};

function addReactions(msg: Message, i: number = 0) {
  if (i === reactions.length) {
    msg.react('⏹️');
    return;
  }
  msg.react(reactions[i]).then(() => addReactions(msg, ++i));
}

function makeEmbed(bits: ModLogActionFlags): Page {
  let description = `What events would you like to toggle?
${check(
  (ModLogActionFlags.CHANNEL_CREATE & bits) === ModLogActionFlags.CHANNEL_CREATE
)} 0️⃣ Channel Changes
${check(
  (ModLogActionFlags.GUILD_ROLE_CREATE & bits) === ModLogActionFlags.GUILD_ROLE_CREATE
)} 1️⃣ Role Changes
${check(
  (ModLogActionFlags.CHANNEL_PINS_UPDATE & bits) ===
    ModLogActionFlags.CHANNEL_PINS_UPDATE
)} 2️⃣ Message Pins
${check(
  (ModLogActionFlags.GUILD_MEMBER_ADD & bits) === ModLogActionFlags.GUILD_MEMBER_ADD
)} 3️⃣ Bots Added & Member Kicks
${check(
  (ModLogActionFlags.GUILD_MEMBER_UPDATE & bits) ===
    ModLogActionFlags.GUILD_MEMBER_UPDATE
)} 4️⃣ Member Changes
${check(
  (ModLogActionFlags.GUILD_BAN_ADD & bits) === ModLogActionFlags.GUILD_BAN_ADD
)} 5️⃣ Bans
${check(
  (ModLogActionFlags.GUILD_EMOJIS_UPDATE & bits) ===
    ModLogActionFlags.GUILD_EMOJIS_UPDATE
)} 6️⃣ Emoji Changes
${check(
  (ModLogActionFlags.INVITE_CREATE & bits) === ModLogActionFlags.INVITE_CREATE
)} 7️⃣ Invite Changes
${check(
  (ModLogActionFlags.MESSAGE_DELETE & bits) === ModLogActionFlags.MESSAGE_DELETE
)} 8️⃣ Messages Deleted`;

  return {
    description: description,
  };
}

function check(cond: boolean) {
  return cond ? '✅' : '❎';
}
