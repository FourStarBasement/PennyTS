import { Context, Command } from 'detritus-client/lib/command';
import { Page } from '../modules/paginator';

interface CommandArgs {
  help: string;
}

export const help = {
  name: 'help',
  metadata: {
    description: 'Does what you think it does.',
  },
  arg: { name: 'command' },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.help) {
      let pages = new Array<Page>();

      let commandSlices = new Array<Array<Command>>();

      for (let i = 0; i < ctx.commandClient.commands.length; i += 5) {
        commandSlices.push(ctx.commandClient.commands.slice(i, i + 5));
      }

      commandSlices.forEach((commands: Array<Command>) => {
        pages.push(embed(ctx, commands));
      });

      ctx.commandClient.paginate(ctx, pages, 'PennyBot by Lilwiggy');
    }
  },
};

function embed(ctx: Context, commands: Array<Command>): Page {
  let e: Page = {
    title: 'Official server',
    author: {
      iconUrl: ctx.me!.avatarUrl,
    },
    fields: [],
    color: 9043849,
    url: 'https://discord.gg/kwcd9dq',
  };

  commands.forEach((c) => {
    e.fields?.push({
      name: ctx.prefix + c.name,
      value: c.metadata.description ? c.metadata.description : 'Not Found.',
    });
  });

  return e;
}
