import { Context } from 'detritus-client/lib/command';
import { ModLogActions, ModLogReactions } from '../../modules/modlog';
import { ReactionCollector } from '../../modules/collectors/reactionCollector';
import { Reaction, User, Message } from 'detritus-client/lib/structures';
import { Page } from '../../modules/utils';

const reactions = Object.keys(ModLogReactions);

export const modLog = {
  name: 'mod log',
  metadata: {
    checks: ['userAdmin'],
  },
  run: async (ctx: Context) => {
    let bits: ModLogActions = ctx.guild?.modLog!;

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
            .query(`UPDATE \`servers\` SET \`ModLogPerm\` = '${bits}'`)
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
  },
};

function addReactions(msg: Message, i: number = 0) {
  if (i === reactions.length) {
    msg.react('⏹️');
    return;
  }
  msg.react(reactions[i]).then(() => addReactions(msg, ++i));
}

function makeEmbed(bits: ModLogActions): Page {
  let description = `What events would you like to toggle?
${check(
  (ModLogActions.CHANNEL_CREATE & bits) === ModLogActions.CHANNEL_CREATE
)} 0️⃣ Channel Changes
${check(
  (ModLogActions.GUILD_ROLE_CREATE & bits) === ModLogActions.GUILD_ROLE_CREATE
)} 1️⃣ Role Changes
${check(
  (ModLogActions.CHANNEL_PINS_UPDATE & bits) ===
    ModLogActions.CHANNEL_PINS_UPDATE
)} 2️⃣ Message Pins
${check(
  (ModLogActions.GUILD_MEMBER_ADD & bits) === ModLogActions.GUILD_MEMBER_ADD
)} 3️⃣ Bots Added & Member Kicks
${check(
  (ModLogActions.GUILD_MEMBER_UPDATE & bits) ===
    ModLogActions.GUILD_MEMBER_UPDATE
)} 4️⃣ Member Changes
${check(
  (ModLogActions.GUILD_BAN_ADD & bits) === ModLogActions.GUILD_BAN_ADD
)} 5️⃣ Bans
${check(
  (ModLogActions.GUILD_EMOJIS_UPDATE & bits) ===
    ModLogActions.GUILD_EMOJIS_UPDATE
)} 6️⃣ Emoji Changes
${check(
  (ModLogActions.INVITE_CREATE & bits) === ModLogActions.INVITE_CREATE
)} 7️⃣ Invite Changes
${check(
  (ModLogActions.MESSAGE_DELETE & bits) === ModLogActions.MESSAGE_DELETE
)} 8️⃣ Messages Deleted`;

  return {
    description: description,
  };
}

function check(cond: boolean) {
  return cond ? '✅' : '❎';
}
