import { Context } from 'detritus-client/lib/command';
import {
  getCards,
  Card,
  sortCards,
  RARITIES,
  RARITY_COLORS,
} from '../../trading_cards/cards';
import { DBCards, QueryType } from '../../modules/db';
import { Page } from '../../modules/utils';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
//import { fetchRandomNumber } from '../../modules/utils';

export const cardClaim = {
  name: 'card claim',
  metadata: {
    description: 'Claim a card!',
  },
  run: async (ctx: Context) => {
    let cards = getCards();
    sortCards(cards);
    let data: DBCards[] = await ctx.commandClient.query(
      `SELECT * FROM cards WHERE owner_id = ${ctx.userId}`
    );
    let total: number = 0;
    let picked = new Map();
    // ty Ivan for helping me to learn weighted randomness <3
    if (data) {
      data.forEach((dbc: DBCards) => {
        picked.set(dbc.card_id, dbc.count);
        total += dbc.count;
      });
    }
    if (total + 10 > 300) {
      ctx.reply('Your inventory is full! Trade some cards to gain more space.');
      return;
    }
    let weights: number[] = [];
    let sorted = cards.sort((a, b) => b.rarity - a.rarity);
    sorted.forEach((c: Card) => {
      weights.push(c.rarity);
    });
    //console.log(sorted);
    let sum = weights.reduce((acc, cur) => acc + cur, 0);
    let selected: Page[] = [];

    //console.log(((await fetchRandomNumber()) / sum) * cards.length);
    for (let n = 0; n < 10; n++) {
      let remainder = Math.floor(Math.random() * sum);
      for (let i = 0; i < weights.length; i++) {
        remainder -= weights[i];
        if (remainder < 0) {
          let id = cards.indexOf(sorted[i]);
          picked.set(id, picked.get(id) + 1 || 1);
          selected.push(getEmbed(sorted[i], cards));
          //console.log(cards[id], cards);
          let c = await ctx.commandClient.queryOne(
            `SELECT COUNT(*) as count FROM cards WHERE owner_id = ${ctx.userId} AND card_id = ${id}`
          );
          if (c.count > 0) {
            await ctx.commandClient.preparedQuery(
              `UPDATE cards SET count = count + 1 WHERE owner_id = $1 AND card_id = $2`,
              [ctx.userId, id],
              QueryType.Void
            );
          } else {
            await ctx.commandClient.preparedQuery(
              `INSERT INTO cards (owner_id, card_id, count) VALUES ($1, $2, 1)`,
              [ctx.userId, id],
              QueryType.Void
            );
          }
          break;
        }
      }
    }
    new EmbedPaginator(ctx, selected).start();
  },
};

function getEmbed(card: Card, cards: Card[]): Page {
  return {
    title: `${card.name} (${cards.indexOf(card)})`,
    color: RARITY_COLORS[RARITIES[card.rarity]],
    image: {
      url: `https://penny.wiggy.dev/assets/trading-cards/${(
        card.name.replace(/ /g, '_') +
        '_' +
        card.series.replace(/ /g, '_')
      ).toLowerCase()}.png`,
    },
    fields: [
      {
        name: 'Series',
        value: card.series,
      },
      {
        name: 'Rarity',
        value: `${card.rarity}/100`,
      },
    ],
  };
}
