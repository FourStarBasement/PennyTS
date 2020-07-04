import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';
import { Member } from 'detritus-client/lib/structures';
import { UrlQuery } from 'detritus-client/lib/utils'

export const profile = {
  name: 'profile',
  metadata: {
    description: "View your's or someone else's profile",
  },
  checks: ['attachments'],
  run: async (ctx: Context) => {
    let member =
      (ctx.commandClient.fetchGuildMember(ctx) as Member) || ctx.member;
    let urlQuery: UrlQuery = {
      'size': 2048
    };
    await fetch(
      `${config.imageAPI.url}/profile?id=${member!.id}&avatar_url=${member!.avatarUrlFormat('png', urlQuery)}&color=${member!.color}`, {
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
