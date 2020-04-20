import { CommandOptions, Context } from 'detritus-client/lib/command';

export const test = {
  name: 'test',
  run: async (context: Context) => {
    context.reply('I am running.');
  },
};
