import { Context } from 'detritus-client/lib/command';
import { cards, Card } from '../../trading cards/cards';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
import { Page } from '../../modules/utils';

export const cardList = {
  name: 'card list',
  metadata: {
    description: 'List all cards',
  },
  run: async (ctx: Context) => {
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
    color: 9043849,
    image: {
      url: `https://penny.wiggy.dev/assets/trading-cards/${
        cards.indexOf(card) + 1
      }.png`,
    },
    fields: [
      {
        name: 'Rarity',
        value: card.rarity.toString(),
      },
    ],
  };
}
