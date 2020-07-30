import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';
import { User } from 'detritus-client/lib/structures';
import { QueryType } from '../../modules/db';
export const claim = {
  name: 'claim',
  metadata: {
    description: 'Claim your rewards for upvoting Penny on top.gg',
  },
  run: async (ctx: Context) => {
    if (ctx.guildId !== '309531752014151690') {
      ctx.reply(
        'You can only claim rewards in the official server! Join here to claim your rewards:\ndiscord.gg/kwcd9dq'
      );
      return;
    }
    if (ctx.user.claimed) {
      ctx.reply('You already claimed your rewards!');
      return;
    }
    let voted: boolean = false;
    let voters = await fetch(
      `https://top.gg/api/bots/309531399789215744/check?userId=${ctx.userId}`,
      {
        headers: {
          Authorization: config.topgg.token,
        },
      }
    ).then((da) => {
      if (da.status === 429) {
        ctx.reply(
          'We are submitting too many requests! Please try again later.'
        );
        return;
      }
      return da.json();
    });

    if (!voters) return;
    if (voters.voted === 1) voted = true;

    if (!voted) {
      voters = await fetch(`https://top.gg/api/bots/309531399789215744/votes`, {
        headers: {
          Authorization: config.topgg.token,
        },
      }).then((da) => da.json());
      if (
        voters.find((user: User) => {
          return user.id === ctx.userId;
        })
      )
        voted = true;
    }

    if (!voted) {
      ctx.reply(
        'You have not upvoted Penny! Upvote her to claim your rewards https://top.gg/bot/309531399789215744\n\nPlease note: Upvotes do not take immediate effect. Please try again in 2 minutes if you have upvoted but see this message.'
      );
      return;
    }

    ctx.commandClient.preparedQuery(
      'UPDATE users SET credits = credits + 20000, cookies = cookies + 10 WHERE user_id = $1',
      [ctx.userId],
      QueryType.Void
    );
    ctx.member?.addRole('738441920291799070');
    ctx.user.claimed = true;
    ctx.reply(
      'You have received 20 thousand credits, 10 free cookies, and, your custom voter role! If you would like a colored role you can change ask a mod for a role!'
    );
  },
};
