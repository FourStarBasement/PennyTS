import { Context } from 'detritus-client/lib/command';
import {
  getCards,
  Card,
  RARITY_COLORS,
  RARITIES,
} from '../../trading_cards/cards';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
import { Page } from '../../modules/utils';

export const cardList = {
  name: 'card list',
  metadata: {
    description: 'List all cards',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let cards = getCards();
    let pages: Page[] = [];
    cards.forEach((card: Card) => {
      pages.push(embed(card));
    });
    new EmbedPaginator(ctx, pages).start();
    return;
  },
};

function embed(card: Card): Page {
  return {
    title: card.name,
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
