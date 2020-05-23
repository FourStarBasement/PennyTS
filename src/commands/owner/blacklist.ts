import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';

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

    if (mentioned!.blacklisted === undefined) {
      let data = await ctx.commandClient.query(
        `SELECT * FROM User WHERE User_ID = '${blacklistArgs[0]}'`
      );
      mentioned!.blacklisted = Boolean(data[0].Blacklisted);
    }

    if (mentioned?.blacklisted) {
      await ctx.commandClient.query(
        `UPDATE User SET Blacklisted = 0 WHERE User_ID = '${blacklistArgs[0]}'`
      );

      ctx.reply(`${mentioned} has been unblacklisted`);
      mentioned!.blacklisted = false;

      ctx.client.channels
        .get('708062124160581683')
        ?.createMessage(`${mentioned?.username} was unblacklisted.`);
    } else {
      let reason = stringExtractor(args.blacklist)[0];

      await ctx.commandClient.query(
        `UPDATE User SET Blacklisted = 1 WHERE User_ID = '${blacklistArgs[0]}'`
      );

      ctx.reply(`${mentioned} has been blacklisted`);
      mentioned!.blacklisted = true;

      mentioned?.createMessage(
        'I have come to inform you that you have been blacklisted from penny. You can find out more here: https://discord.gg/kwcd9dq'
      );

      ctx.client.channels
        .get('708062124160581683')
        ?.createMessage(
          `${mentioned?.username} was just blacklisted for the following reason:\n${reason}`
        );
    }
  },
};
