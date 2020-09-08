import { Context } from 'detritus-client/lib/command';
import config from '../../modules/config';
import { Member } from 'detritus-client/lib/structures';
import search from 'youtube-search';
import { Page, fetchLastFMRecentTracks } from '../../modules/utils';
import { DBUser } from '../../modules/db';

export const listening = {
  name: 'listening',
  metadata: {
    description: 'Shows what you and others are listening to!',
  },
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
      let user: DBUser = await ctx.commandClient.queryOne(
        `SELECT last_fm_name FROM users WHERE user_id = ${member.id}`
      );
      if (user.last_fm_name) {
        let track = (await fetchLastFMRecentTracks(user.last_fm_name))[0];
        if (!track.current) {
          ctx.reply(`${member.name} is not listening to anything.`);
          return;
        }
        let s = await search(`${track.name} by ${track.artist.name}`, opts);
        ctx.reply({
          embed: {
            title: track.name,
            color: await ctx.commandClient.fetchAverageColor(track.album!.art),
            description: `By ${track.artist.name} on ${
              track.album!.name || 'Unknown album'
            }\n[Youtube](${
              s.results[0].link
            })\nInfo from [last.fm](https://www.last.fm/user/${
              user.last_fm_name
            })`,
            thumbnail: { url: track.album!.art },
          },
        });
        return;
      }
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
      color: await ctx.commandClient.fetchAverageColor(
        thing!.assets!.largeImageUrl!
      ),
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
