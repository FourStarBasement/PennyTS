import { CommandClient } from 'detritus-client';
import {
  Message,
  ChannelGuildText,
  User,
  Member,
  Channel,
} from 'detritus-client/lib/structures';
import { Context } from 'detritus-client/lib/command';
import { Duration } from 'moment';
import { ItemInfo } from './shop';
import fetch from 'node-fetch';
import config from './config';
import { ServerFlags } from './db';

export const chanReg = /<#(\d+)>/;
export const roleReg = /<@&(\d+)>/;
export const emojiReg = /^<a?:(\w+):(\d+)>$/;

export interface PageField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface Page {
  author?: {
    iconUrl?: string;
    name?: string;
    url?: string;
  };
  thumbnail?: {
    url: string;
  };
  description?: string;
  title?: string;
  color?: number;
  image?: {
    url: string;
  };
  fields?: PageField[];
  footer?: {
    text: string;
    iconUrl?: string;
  };
  url?: string;
  timestamp?: string;
}

export function shopEmbed(ctx: Context, currItem: ItemInfo): Page {
  return {
    author: {
      url: currItem.oc.url,
      name: `Shop info for ${currItem.name}`,
    },
    title: `Original art by ${currItem.oc.name}`,
    color: 9043849,
    fields: [
      {
        name: 'Price:',
        value: currItem.price,
      },
      {
        name: 'Purchase:',
        value: `${ctx.prefix}set ${currItem.type} ${currItem.name}`,
      },
    ],
    image: {
      url: currItem.image,
    },
  };
}

export function humanize(duration: Duration) {
  let ret = [];

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (days > 0) {
    ret.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    ret.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    ret.push(
      `${ret.length > 0 ? 'and ' : ''}${minutes} minute${
        minutes > 1 ? 's' : ''
      }`
    );
  }

  // We don't want to display seconds if we have days or hours.
  if (days == 0 && hours == 0 && seconds > 0) {
    ret.push(
      `${ret.length > 0 ? 'and ' : ''}${seconds} second${
        seconds > 1 ? 's' : ''
      }`
    );
  }

  return ret.join(', ');
}

export interface EventHandler {
  event: string;
  listener: (client: CommandClient, payload: any) => Promise<void>;
}

// So that linter doesn't complain
export interface FetchedStarData {
  original?: Message;
  starred?: Message;
  starboard?: Channel;
  limit?: number;
}

const URL_REG = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

export function convertEmbed(me: User | Member, message: Message, embed: Page) {
  if (message.author.id === me.id && message.embeds.size > 0) {
    let msgEmbed = message.embeds.get(0)!;
    embed.image = msgEmbed.image; // Can be Respective Object OR undefined
    embed.description = msgEmbed.description;
    embed.thumbnail = msgEmbed.thumbnail;
  } else {
    if (URL_REG.test(message.content)) {
      embed.image = {
        url: message.content.match(URL_REG)![0],
      };
    } else if (message.attachments.size > 0) {
      embed.image = {
        url: message.attachments.first()!.url!,
      };
    }
    if (message.content.length > 0) {
      embed.description = message.content;
    }
  }
  return embed;
}

const ESCAPE_MARKDOWN = /([_\\~|\*`]|>(?:>>)?\s)/g;

export function escapeMarkdown(text: string): string {
  return text.replace(ESCAPE_MARKDOWN, '\\$1');
}

export function stringExtractor(str: string, quotes: string[] = ['"', "'"]) {
  let startIndex = 0,
    nextIndex = 0;
  let finalStrings = [];
  str = str
    .replace('‘', "'")
    .replace('’', "'")
    .replace('”', '"')
    .replace('“', '"');
  for (const char of str) {
    if (quotes.includes(char)) {
      if (startIndex == 0) startIndex = nextIndex + 1;
      else {
        finalStrings.push(str.slice(startIndex, nextIndex));
        startIndex = 0;
      }
    }

    nextIndex += 1;
  }

  return finalStrings;
}

export async function fetchRandomNumber(
  length?: number
): Promise<number | number[]> {
  let l = length || 1;
  let res = await fetch(
    `https://qrng.anu.edu.au/API/jsonI.php?length=${l}&type=uint8`
  ).then((d) => d.json());
  if (!res.success) throw new Error('No number returned!');
  if (l === 1) return res.data[0] as number;
  else return res.data;
}

export function decimalToHex(number: number) {
  let hexyBoi = number.toString(16);
  return hexyBoi.length % 2 ? '0' + hexyBoi : hexyBoi;
}

export const GuildFlagReactions: Record<string, ServerFlags> = {
  '0️⃣': ServerFlags.LEVELS,
  '1️⃣': ServerFlags.MOD_LOGS,
  '2️⃣': ServerFlags.AUTO_QUOTE,
  '3️⃣': ServerFlags.AUTO_ROLE,
  '4️⃣': ServerFlags.WELCOMES,
};

interface LastFMImage {
  size: string;
  '#text': string;
}

interface LastFMTrackResponse {
  '@attr': {
    nowplaying?: boolean;
    rank?: number;
  };
  duration?: number;
  playcount?: number;
  artist: {
    name?: string;
    url?: string;
    '#text': string;
    mbid: string;
  };
  album: {
    mbid: string;
    '#text': string;
  };
  image: LastFMImage[];
  mbid: string;
  name: string;
  url: string;
}

export interface LastFMTrack {
  current: boolean;
  rank?: number;
  artist: {
    name: string;
    id: string;
  };
  album?: {
    art: string;
    name: string;
    id: string;
  };
  name: string;
  totalPlays?: number;
  duration?: number;
}

interface LastFMTopTracksResponse {
  error?: number;
  message?: string;
  toptracks: {
    '@attr': {
      page: number;
      perPage: number;
      user: string;
      total: number;
      totalPages: number;
    };
    track: LastFMTrackResponse[];
  };
}

interface LastFMRecentTracksResponse {
  error?: number;
  message?: string;
  recenttracks: {
    '@attr': {
      page: number;
      perPage: number;
      user: string;
      total: number;
      totalPages: number;
    };
    track: LastFMTrackResponse[];
  };
}

interface LastFMUserGetInfoResponse {
  error?: number;
  message?: string;
  user: {
    playlists: number;
    playcount: number;
    gender: string;
    subscriber: number;
    url: string;
    country: string;
    name: string;
    image: LastFMImage[];
    registered: {
      unixtime: number;
      '#text': number;
    };
    type: string;
    age: number;
    realname: string | undefined;
  };
}

export interface LastFMUser {
  username: string;
  avatar: string;
  recentTracks: LastFMTrack[];
  totalPlays: number;
  country: string;
  topTrack: LastFMTrack;
}

export async function fetchLastFMRecentTracks(
  name: string
): Promise<LastFMTrack[]> {
  let data: LastFMRecentTracksResponse = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${name}&api_key=${config.lastFM.key}&format=json`
  ).then((d) => d.json());
  if (data.error)
    throw new Error(
      `Error fetching last.fm user. Error: ${data.error} ${data.message}`
    );
  let tracks: LastFMTrack[] = [];
  for (let track of data.recenttracks.track) {
    tracks.push({
      current: track['@attr'] ? track['@attr'].nowplaying! : false,
      artist: {
        name: track.artist['#text'],
        id: track.artist.mbid,
      },
      album: {
        art: track.image[3]['#text'],
        name: track.album['#text'],
        id: track.album.mbid,
      },
      name: track.name,
    });
  }
  return tracks;
}

export async function fetchLastfmUser(name: string): Promise<LastFMUser> {
  let userData: LastFMUserGetInfoResponse = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${name}&api_key=${config.lastFM.key}&format=json`
  ).then((d) => d.json());
  if (userData.error) {
    throw new Error(
      `Error fetching last.fm user. Error: ${userData.error} ${userData.message}`
    );
  }
  let topTracks = await fetchLastFMTopTracks(name);
  let userTracks = await fetchLastFMRecentTracks(name);
  let user: LastFMUser;
  user = {
    username: userData.user.name,
    avatar: userData.user.image[3]['#text'],
    totalPlays: userData.user.playcount,
    country: userData.user.country,
    recentTracks: userTracks,
    topTrack: topTracks.filter((track) => track.rank == 1)[0],
  };
  return user;
}

export async function fetchLastFMTopTracks(
  name: string
): Promise<LastFMTrack[]> {
  let tracksRes: LastFMTopTracksResponse = await fetch(
    `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${name}&api_key=${config.lastFM.key}&format=json`
  ).then((d) => d.json());
  if (tracksRes.error)
    throw new Error(
      `Error fetching last.fm user. Error: ${tracksRes.error} ${tracksRes.message}`
    );
  let tracks: LastFMTrack[] = [];
  for (let track of tracksRes.toptracks.track) {
    tracks.push({
      current: track['@attr'].nowplaying || false,
      artist: {
        name: track.artist.name!,
        id: track.artist.mbid,
      },
      name: track.name,
      rank: track['@attr'].rank,
      totalPlays: track.playcount,
    });
  }
  return tracks;
}
