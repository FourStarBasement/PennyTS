import { Context } from 'detritus-client/lib/command';
import { transpile } from 'typescript';
import { inspect } from 'util';

interface CommandArgs {
  evaluate: string;
}

export const evaluate = {
  name: 'evaluate',
  aliases: ['eval'],
  metadata: {
    description: 'evAAAAAAAAAAAAAAAAAAAAAl',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let lang = '';
    let body = '';

    if (!args.evaluate) {
      ctx.reply('what do you want to eval moron');
      return;
    }

    if (args.evaluate.startsWith('```')) {
      let toParse = args.evaluate
        .substr(3, args.evaluate.length - 6)
        .split('\n');

      if (toParse.length < 2) {
        ctx.reply('???');
        return;
      }

      lang = toParse.shift()!;
      body = toParse.join('\n');
    }

    if (lang === 'ts') {
      body = transpile(body);
    }

    console.log(body);

    body = body
      .replace('ctx$', 'arguments[0]')
      .replace('client$', 'arguments[1]')
      .replace('cmdClient$', 'arguments[2]')
      .replace('query$', 'arguments[3]');

    var func = Function(
      '"use strict";var _ = () => {' + body + '};return _();'
    );

    var result = func(
      ctx,
      ctx.client,
      ctx.commandClient,
      ctx.commandClient.query
    );

    if (result) {
      if (Promise.resolve(result) === result) {
        await result;
      }

      ctx.reply(inspect(result));
    }

    ctx.message.react('✅');
  },
};
