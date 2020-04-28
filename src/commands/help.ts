import { Context, Command } from 'detritus-client/lib/command';
import { Page } from '../modules/paginator';

interface CommandArgs {
  help: string;
}

export const help = {
  name: 'help',
  metadata: {
    description: 'Does what you think it does.',
    checks: ['embed'],
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
      return;
    }

    let command = ctx.commandClient.commands.filter(
      (c) => c.name === args.help
    );

    if (command.length > 0) {
      let c = command[0];
      ctx.reply({
        embed: {
          title: 'Official server',
          author: {
            iconUrl: ctx.me!.avatarUrl,
          },
          fields: [
            {
              name: ctx.prefix + c.name,
              value: c.metadata.description
                ? c.metadata.description
                : 'Not Found.',
            },
          ],
          color: 9043849,
          url: 'https://discord.gg/kwcd9dq',
        },
      });
    } else {
      ctx.reply('I could not find the command you were looking for.');
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
