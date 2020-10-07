import { Context } from 'detritus-client/lib/command';
import { getCards, RARITIES, RARITY_COLORS } from '../../trading_cards/cards';
import { DBCard } from '../../modules/db';
import { Page } from '../../modules/utils';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';

export const inventory = {
  name: 'inventory',
  metadata: {
    description: 'Show your card inventory',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let data: DBCard[] = await ctx.commandClient.query(
      `SELECT * FROM cards WHERE owner_id = ${ctx.userId}`
    );
    if (!data || data.length < 1) {
      ctx.reply('You have no cards!');
      return;
    }
    let allCards: Page[] = [];
    data
      .sort((a, b) => a.count - b.count)
      .forEach((c: DBCard) => {
        allCards.push(embed(c));
      });
    new EmbedPaginator(ctx, allCards).start();
    return;
  },
};

function embed(dbCard: DBCard): Page {
  let cards = getCards();
  let card = cards[dbCard.card_id];
  return {
    title: `${card.name} (${dbCard.count} owned)`,
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
        name: 'Rarity',
        value: `${card.rarity}/100`,
      },
      {
        name: 'Series',
        value: card.series,
      },
    ],
  };
}
