import { Context } from 'detritus-client/lib/command';
import { Member } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';

export const ban = {
  name: 'ban',
  metadata: {
    description: 'Ban a user.',
    checks: ['ban'],
  },
  run: async (ctx: Context) => {
    let member: Member = ctx.commandClient.fetchGuildMember(ctx) as Member;

    if (!member) {
      ctx.reply('Please provide a valid user!');
      return;
    }

    if (member.id === ctx.me?.id) {
      ctx.reply('I cannot let you do that.');
      return;
    }

    if (member.id == ctx.member!.id) {
      ctx.reply('You cannot ban yourself!');
      return;
    }

    if (ctx.me && ctx.me.highestRole) {
      if (ctx.me.highestRole.position <= member.highestRole!.position) {
        ctx.reply('I cannot ban this user.');
        return;
      }
    }

    let banImage = undefined;

    if (ctx.channel?.canAttachFiles) {
      let img = await fetch(
        'https://i.makeagif.com/media/6-01-2015/yeWyfV.gif'
      ).then(async (r) => await r.buffer());
      banImage = { filename: 'ban.gif', data: img };
    }

    ctx.guild?.createBan(member.id, {
      reason: `Action done by ${ctx.user.username}.`,
    });
    ctx.reply({
      content: `${member.username} was banned by ${ctx.member!.username}`,
      file: banImage,
    });
  },
};
