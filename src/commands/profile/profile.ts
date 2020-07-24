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
    let img = await fetch(`${config.imageAPI.url}/profile`, {
      headers: {
        user_id: member!.id,
        user_avatar: member!.avatarUrl,
        color: `#${member!.color.toString(16)}`,
        authorization: config.imageAPI.password,
      },
    })
      .then((d) => d.json())
      .catch(console.error);
    ctx.reply({
      content: `${member!.username}'s profile.`,
      file: {
        value: Buffer.from(img.buffer),
        filename: 'profile.png',
      },
    });
  },
};
