import { Context } from 'detritus-client/lib/command';
import config from '../modules/config';
import { Member } from 'detritus-client/lib/structures';
import search from 'youtube-search';
import { Page } from '../modules/paginator';

export const listening = {
  name: 'listening',
  run: async (ctx: Context) => {
    let opts = {
      maxResults: 10,
      key: config.youtube.key,
    };
    let member = ctx.commandClient.fetchGuildMember(ctx) || ctx.member;
    if (!member) {
      ctx.reply('I cannot find that user.');
      return;
    }

    let pre = member!.presence?.activities;
    if (pre!.filter((g) => g.isOnSpotify).length < 1) {
      ctx.reply(`${member.name} is not listening to anything.`);
      return;
    }

    let thing = pre!.find((g) => g.isOnSpotify);
    let album: Array<Member> = [];
    let artist: Array<Member> = [];
    let listening: Array<Member> = [];
    let users = ctx.guild?.members.filter((m) => {
      if (m.bot || m.id === member?.id) return false;
      let mPresence = m.presence?.activities.find((g) => g.isOnSpotify);
      if (mPresence) {
        if (mPresence.details === thing?.details) {
          listening.push(m);
          return mPresence.details === thing?.details;
        } else if (mPresence.assets?.largeText === thing?.assets?.largeText) {
          album.push(m);
          return mPresence.assets?.largeText === thing?.assets?.largeText;
        } else if (mPresence.state === thing?.state) {
          artist.push(m);
          return mPresence.state === thing?.state;
        }
      }
      return false;
    });
    let s = await search(`${thing?.details} by ${thing?.state}`, opts);

    let embed: Page = {
      title: thing!.details,
      thumbnail: {
        url: thing!.assets!.largeImageUrl!,
      },
      color: 2021216,
      description: `By: ${thing?.state}\nAlbum: ${thing?.assets?.largeText}\n[Youtube](${s.results[0].link})`,
      fields: [],
    };
    if (users!.length > 0) {
      let listeners: Array<string> = [];
      let albums: Array<string> = [];
      let artists: Array<string> = [];
      users!.forEach((u) => {
        if (listening.includes(u)) listeners.push(u.username);
        else if (album.includes(u)) albums.push(u.username);
        else if (artist.includes(u)) artists.push(u.username);
      });
      if (listening.length > 0) {
        if (listening.length === 1)
          embed.fields!.push({
            name: `Listening with ${listening.length} other.`,
            value: listeners.toString(),
          });
        else
          embed.fields!.push({
            name: `Listening with ${listening.length} others.`,
            value: listeners.toString(),
          });
      } else if (album.length > 0) {
        if (album.length > 1)
          embed.fields!.push({
            name: `${album.length} others are listening to this album.`,
            value: albums.join(', ').toString(),
          });
        else
          embed.fields!.push({
            name: `${album.length} other is listening to this album.`,
            value: albums.toString(),
          });
      }
      if (artist.length > 0) {
        if (artist.length === 1)
          embed.fields!.push({
            name: `${artist.length} other is listening to this artist.`,
            value: artists.toString(),
          });
        else
          embed.fields!.push({
            name: `${artist.length} others are listening to this artist.`,
            value: artists.join(', ').toString(),
          });
      }
    }
    ctx.reply({
      embed: embed,
    });
  },
};
