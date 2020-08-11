
import fs from 'fs';
export interface Card {
  name: string;
  rarity: number;
  series: string;
  //packs?: string[];
}
export enum RARITIES {
  SUPER_COMMON = 100,
  COMMON = 80,
  RARE = 40,
  SUPER_RARE = 20,
  ULTRA_RARE = 10,
  SUPER_ULTRA_RARE = 5,
  IMPOSSIBLE = 1,
}
// ty sharon for helping me understand this
export const RARITY_COLORS: { [index: string]: number } = {
  'SUPER_COMMON': 16777214, // Discord won't display FFFFF in an embed :/
  'COMMON': 9228799,
  'RARE': 6052351,
  'SUPER_RARE': 14916863,
  'ULTRA_RARE': 16753057,
  'SUPER_ULTRA_RARE': 16555454,
  'IMPOSSIBLE': 16735324,
}
export function getCards(): Card[] {
  let cards = require('../trading_cards/cards.json');
  return cards as Card[];
}

let saveCards = function (cards: Card[]) {
  fs.writeFile('./src/trading_cards/cards.json', JSON.stringify(cards, null, 1), (er) => {
    if (er)
      throw new Error(er.stack);

    console.log('Saved cards.json file');
  })
}

export function sortCards(cards: Card[]) {
  let sorted = cards.sort((a, b) => b.rarity - a.rarity);
  saveCards(sorted);
}
