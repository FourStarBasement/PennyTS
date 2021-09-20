import { Context } from 'detritus-client/lib/command';
import {
  getCards,
  Card,
  RARITY_COLORS,
  RARITIES,
  getCardImage,
} from '../../trading_cards/cards';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
import { Page } from '../../modules/utils';

export const cardTrade = {
  name: 'card trade',
  metadata: {
    description: 'Trade your cards with other people!',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let cards = getCards();
    let pages: Page[] = [];
    cards.forEach((card: Card) => {
      pages.push(embed(card));
    });
    return;
  },
};

function embed(card: Card): Page {
  return {
    title: card.name,
    color: RARITY_COLORS[RARITIES[card.rarity]],
    image: {
      url: getCardImage(card),
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
