import { Context } from 'detritus-client/lib/command';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
import { QueryType } from '../../modules/db';
import { Page } from '../../modules/utils';
import {
  Card,
  getCardImage,
  getCards,
  openPack as open,
  RARITIES,
  RARITY_COLORS,
} from '../../trading_cards/cards';

interface args {
  'open pack': string;
}
export const openPack = {
  name: 'open pack',
  arg: {
    name: 'open pack',
  },
  metadata: {
    description: 'Buy and open card packs!',
  },
  run: async (ctx: Context, args: args) => {
    let embeds: Page[] = [];
    let all = getCards();
    let cards = all.filter((c: Card) => {
      return c.series.toLowerCase() === args['open pack'].toLowerCase();
    });
    if (cards.length === 0) {
      ctx.reply("I coudln't find that pack! Please try again.");
      return;
    }
    let selected = open(cards);
    selected.forEach(async (card: Card) => {
      embeds.push(getEmbed(card));
      let id =
        card.name.replace(/ /g, '_').toLowerCase() +
        '_' +
        card.series.replace(/ /g, '_').toLowerCase();
      let c = await ctx.commandClient
        .queryOne(
          `SELECT COUNT(*) as count FROM cards WHERE owner_id = ${ctx.userId} AND card_id = '${id}'`
        )
        .catch(console.error);
      if (c.count > 0) {
        await ctx.commandClient
          .preparedQuery(
            `UPDATE cards SET count = count + 1 WHERE owner_id = $1 AND card_id = $2`,
            [ctx.userId, id],
            QueryType.Void
          )
          .catch(console.error);
      } else {
        await ctx.commandClient
          .preparedQuery(
            `INSERT INTO cards (owner_id, card_id, count) VALUES ($1, $2, 1)`,
            [ctx.userId, id],
            QueryType.Void
          )
          .catch(console.error);
      }
    });
    new EmbedPaginator(ctx, embeds).start();
  },
};

function getEmbed(card: Card): Page {
  return {
    title: `${card.name}`,
    color: RARITY_COLORS[RARITIES[card.rarity]],
    image: {
      url: getCardImage(card),
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
