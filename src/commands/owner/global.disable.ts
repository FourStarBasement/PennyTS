import { Context } from 'detritus-client/lib/command';

export const globalDisable = {
  name: 'global disable',
  metadata: {
    description: 'Disable a command globally.',
  },
  arg: { name: 'command' },
  run: async (ctx: Context, args: Record<string, string>) => {
    console.log(args);
    let success = false;
    ctx.commandClient.commands.forEach((c) => {
      if (c.name === args['global disable']) {
        c.metadata.disabled = true;
        ctx.reply(`Disabled ${c.name}.`);
        success = true;
      }
    });
    if (!success) {
      ctx.reply('Command not found.');
    }
  },
};
