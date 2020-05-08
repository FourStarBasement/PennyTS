import { Context } from 'detritus-client/lib/command';

export const set = {
  name: 'set',
  metadata: {
    description:
      'Sets welcome message or welcome channel or leave message or prefix or the starboard chat.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context) => {
    ctx.reply(
      `Usage: ${ctx.prefix}set {welcome/prefix/leave/mod log/background/emblem}`
    );
  },
};
