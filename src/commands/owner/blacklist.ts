import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  blacklist: string;
}

export const blacklist = {
  name: 'blacklist',
  metadata: {
    description: 'Blacklist a user from Penny',
  },
  arg: {
    name: 'blacklist',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.blacklist) {
      ctx.reply(
        "How am I meant to know what user I am supposed to blacklist if you don't provide an ID? Fucking moron."
      );
      return;
    }
    let blacklistArgs = args.blacklist.split(' ');

    let mentioned = ctx.users.get(blacklistArgs[0]);

    if (mentioned!.blacklisted) {
      await ctx.commandClient.preparedQuery(
        'UPDATE users SET blacklisted = false WHERE user_id = $1',
        [blacklistArgs[0]],
        QueryType.Void
      );

      ctx.reply(`${mentioned} has been unblacklisted`);
      mentioned!.blacklisted = false;

      ctx.client.channels
        .get('708062124160581683')
        ?.createMessage(`${mentioned?.username} was unblacklisted.`);
      return;
    }
    mentioned!.blacklisted = true;
    let reason = stringExtractor(args.blacklist)[0];

    await ctx.commandClient.preparedQuery(
      'UPDATE users SET blacklisted = true WHERE user_id = $1',
      [blacklistArgs[0]],
      QueryType.Void
    );

    ctx.reply(`${mentioned} has been blacklisted`);

    mentioned?.createMessage(
      'I have come to inform you that you have been blacklisted from penny. You can find out more here: https://discord.gg/kwcd9dq'
    );

    ctx.client.channels
      .get('708062124160581683')
      ?.createMessage(
        `${mentioned?.username} was just blacklisted for the following reason:\n${reason}`
      );
  },
};
