import { Context } from 'detritus-client/lib/command';
import { getCards, RARITIES } from '../../trading_cards/cards';
import { DBCards, QueryType } from '../../modules/db';
import { Emoji } from 'detritus-client/lib/structures';
//import { fetchRandomNumber } from '../../modules/utils';

export const inventory = {
  name: 'inventory',
  metadata: {
    description: 'Show your card inventory',
  },
  run: async (ctx: Context) => {
    let cards = getCards();
    let data: DBCards[] = await ctx.commandClient.query(
      `SELECT * FROM cards WHERE owner_id = ${ctx.userId}`
    );
    if (!data || data.length < 1) {
      ctx.reply('You have no cards!');
      return;
    }
    let allCards: string[] = [];
    data
      .sort((a, b) => a.count - b.count)
      .forEach((c: DBCards) => {
        let rarity: Emoji = ctx.client.emojis.find(
          (e) => e.name === RARITIES[cards[c.card_id].rarity]
        )!;
        allCards.push(
          `${rarity} ${cards[c.card_id].name}: ${c.count} owned. (ID: ${
            c.card_id
          })`
        );
      });

    ctx.reply(allCards.join('\n'));
  },
};
