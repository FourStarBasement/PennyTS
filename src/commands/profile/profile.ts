import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';
import { Member } from 'detritus-client/lib/structures';

export const profile = {
  name: 'profile',
  metadata: {
    description: "View your's or someone else's profile",
  },
  checks: ['attachments'],
  run: async (ctx: Context) => {
    let member =
      (ctx.commandClient.fetchGuildMember(ctx) as Member) || ctx.member;
    await fetch(
      `${config.imageAPI.url}/profile?id=${member!.id}&avatar_url=${member!.avatarUrl}&color=${member!.color}`, {
      headers: { Authorization: config.imageAPI.password }
    })
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      ctx.reply({
        content: `${member!.username}'s profile.`,
        file: {
          data: Buffer.from(buffer),
          filename: 'profile.png',
        },
      });
    })
    .catch(console.error);
  },
};
