import { Context } from 'detritus-client/lib/command';
import { chanReg, roleReg } from '../../../modules/utils';
import {
  Channel,
  ChannelGuildText,
  Role,
} from 'detritus-client/lib/structures';
import { QueryType, ServerFlags } from '../../../modules/db';

export const setWelcome = {
  name: 'set welcome',
  metadata: {
    description: 'Set the welcome channel, message, or role.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: Record<string, string>) => {
    if (!args['set welcome']) {
      ctx.reply(
        `Usage: ${ctx.prefix}set welcome {message/role/channel/off/on} [value]`
      );
      return;
    }
    let splitArgs = args['set welcome'].split(' ');
    let attr = splitArgs.shift();
    let value = splitArgs.join(' ');

    if (attr === 'on') {
      ctx.guild!.flags |= ServerFlags.WELCOMES;
      ctx.commandClient
        .query(
          `UPDATE servers SET flags = ${ctx.guild!.flags} WHERE server_id = ${
            ctx.guildId
          }`
        )
        .then(() => {
          ctx.reply('Successfully turned on welcome messages.');
        });
      return;
    }

    if (attr === 'off') {
      ctx.guild!.flags &= ~ServerFlags.WELCOMES;
      ctx.commandClient
        .query(
          `UPDATE servers SET flags = ${ctx.guild!.flags} WHERE server_id = ${
            ctx.guildId
          }`
        )
        .then(() => {
          ctx.reply('Successfully turned off welcome messages.');
        });
      return;
    }

    if (!value) {
      ctx.reply(`Please provide a value!`);
      return;
    }

    if (attr === 'message') {
      let welcome_message = value;
      if (
        welcome_message.includes('@everyone') &&
        welcome_message.includes('@here')
      ) {
        ctx.reply(
          "Welcome Message: I'm sorry but I can't add an everyone mention."
        );
      } else {
        await ctx.commandClient
          .preparedQuery(
            'UPDATE servers SET welcome_message = $1 WHERE server_id = $2',
            [welcome_message, ctx.guildId],
            QueryType.Void
          )
          .then(() => {
            ctx.reply('Welcome Message: Successfully set!');
          });
      }
      return;
    }

    if (attr === 'channel') {
      let channel: Channel | undefined;

      if (value.startsWith('<#') && value.endsWith('>')) {
        // Channel Mention
        var channelID = chanReg.exec(value)![1];
        channel = ctx.guild!.channels.get(channelID);
      } else if (isNaN(Number(value))) {
        // Channel Name
        channel = ctx.guild!.channels.find((v, k) => v.name === value);
      } else {
        // Channel ID (Last Resort)
        channel = ctx.guild!.channels.get(value);
      }

      if (!channel) {
        ctx.reply(
          "Welcome Channel: Sorry, I couldn't find the channel you provided!"
        );
      } else {
        await ctx.commandClient
          .query(
            `UPDATE servers SET welcome_channel = ${channel.id} WHERE server_id = ${ctx.guildId}`
          )
          .then(() =>
            ctx.reply(
              `Welcome Channel: Successfully set as ${channel!.mention}!`
            )
          );
      }
      return;
    }

    if (attr === 'role') {
      let role: Role | undefined;
      let unset = false;

      if (value === '$none') {
        await ctx.commandClient
          .query(
            `UPDATE servers SET welcome_role = NULL WHERE server_id = ${ctx.guildId}`
          )
          .then(() => {
            unset = true;
          });
      } else if (value.startsWith('<@&') && value.startsWith('>')) {
        // Role Mention
        var roleID = roleReg.exec(value)![1];
        role = ctx.guild!.roles.get(roleID);
      } else if (isNaN(Number(value))) {
        // Role Name
        role = ctx.guild!.roles.find((v) => v.name === value);
      } else {
        // Role ID (Last Resort)
        role = ctx.guild!.roles.get(value);
      }

      if (!role && !unset) {
        ctx.reply(
          "Welcome Role: Sorry, I couldn't find the role you provided!"
        );
      } else if (role && !unset) {
        await ctx.commandClient
          .query(
            `UPDATE servers SET welcome_role = '${role.id}' WHERE server_id = ${ctx.guildId}`
          )
          .then(() =>
            ctx.reply(`Welcome Role: Successfully set as ${role!.name}!`)
          );
      } else {
        ctx.reply('Welcome Role: Successfully unset!');
      }
      return;
    }

    ctx.reply(
      `Usage: ${ctx.prefix}set welcome {message/role/channel/off/on} [value]`
    );
  },
};
