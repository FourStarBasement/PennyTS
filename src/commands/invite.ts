import { Context } from 'detritus-client/lib/command';

export const invite = {
  name: 'invite',
  metadata: {
    description: 'Invite Penny to your server!',
  },
  run: async (ctx: Context) => {
    let invite = ctx.client.application?.oauth2UrlFormat({
      scope: ['bot'],
      permissions: 314432,
    });
    ctx.reply(`I'm combat ready! <${invite}>`);
  },
};
