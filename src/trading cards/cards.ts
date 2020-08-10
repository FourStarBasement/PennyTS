enum RARITIES {
  SUPER_COMMON = 100,
  COMMON = 80,
  RARE = 40,
  SUPER_RARE = 20,
  ULTRA_RARE = 10,
  SUPER_ULTRA_RARE = 5,
  IMPOSSIBLE = 1,
}
export interface Card {
  name: string;
  rarity: number;
  series: string;
  //packs?: string[];
}
export const cards: Card[] = [
  {
    name: 'Miu Iruma',
    rarity: RARITIES.COMMON,
    series: 'Danganronpa',
  },
  {
    name: 'Mirei Mikagura',
    rarity: RARITIES.SUPER_COMMON,
    series: 'Digimon',
  },
  {
    name: 'Corrin',
    rarity: RARITIES.RARE,
    series: 'Fire Emblem',
  },
  {
    name: 'Kasandra',
    rarity: RARITIES.RARE,
    series: 'Xenoblade Chronicles',
  },
  {
    name: 'Mamako Oosuki',
    rarity: RARITIES.RARE,
    series: 'Okaasan Online',
  },
  {
    name: 'Angie Yonaga',
    rarity: RARITIES.SUPER_COMMON,
    series: 'Danganronpa',
  },
  {
    name: 'Komi San',
    rarity: RARITIES.IMPOSSIBLE,
    series: 'Komi-san wa Komyushou Desu',
  },
  {
    name: 'Momo Yaoyorozu',
    rarity: RARITIES.ULTRA_RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Ochako Ururaka',
    rarity: RARITIES.RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Tsuyu Asui',
    rarity: RARITIES.COMMON,
    series: 'My Hero Academia',
  },
  {
    name: 'Kyouka Jiro',
    rarity: RARITIES.RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Mina Ashido',
    rarity: RARITIES.SUPER_RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Himiko Toga',
    rarity: RARITIES.SUPER_ULTRA_RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Camie Utsushimi',
    rarity: RARITIES.SUPER_RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Inko Midoriya',
    rarity: RARITIES.COMMON,
    series: 'My Hero Academia',
  },
  {
    name: 'Mitsuki Bakugo',
    rarity: RARITIES.COMMON,
    series: 'My Hero Academia',
  },
  {
    name: 'Nejire Hado',
    rarity: RARITIES.SUPER_RARE,
    series: 'My Hero Academia',
  },
  {
    name: 'Ibara Shiozaki',
    rarity: RARITIES.COMMON,
    series: 'My Hero Academia',
  },
  {
    name: 'Irina Jelavic',
    rarity: RARITIES.SUPER_RARE,
    series: 'Assassonation Classroom',
  },
  {
    name: 'Kaede Kayano',
    rarity: RARITIES.SUPER_ULTRA_RARE,
    series: 'Assassination Classroom',
  },
  {
    name: 'Chika Fujiwara',
    rarity: RARITIES.SUPER_RARE,
    series: 'Kaguya Sama: Love Is War',
  },
  {
    name: 'Kaguya Shinomiya',
    rarity: RARITIES.IMPOSSIBLE,
    series: 'Kaguya Sama: Love Is War',
  },
  {
    name: 'Judy',
    rarity: RARITIES.RARE,
    series: 'Cowboy Bebop',
  },
  {
    name: 'Faye Valentine',
    rarity: RARITIES.SUPER_RARE, // I really don't like Faye :/
    series: 'Cowboy Bebop',
  },
  {
    name: 'Zero Two',
    rarity: RARITIES.SUPER_RARE,
    series: 'DARLING in the FANXX',
  },
  {
    name: 'Ichigo',
    rarity: RARITIES.RARE,
    series: 'DARLING in the FRANXX',
  },
  {
    name: 'Kokoro',
    rarity: RARITIES.SUPER_RARE,
    series: 'DARLING in the FRANXX',
  },
  {
    name: 'Perona',
    rarity: RARITIES.IMPOSSIBLE,
    series: 'One Piece',
  },
  {
    name: 'Nami',
    rarity: RARITIES.SUPER_RARE,
    series: 'One Piece',
  },
  {
    name: 'Nico Robin',
    rarity: RARITIES.SUPER_ULTRA_RARE,
    series: 'One Piece',
  },
];
