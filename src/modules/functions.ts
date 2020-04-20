//import { CommandClient } from 'detritus-client';
import { Context } from 'detritus-client/lib/command';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { Member, User } from 'detritus-client/lib/structures';

declare module 'detritus-client/lib/commandclient' {
  interface CommandClient {
    query: (query: string) => Promise<any>;
    fetchGuildMember: (ctx: Context) => Member | User | undefined;
  }
}

export default (client: CommandClient, connection: any) => {
  // SQL queries to return promises so we can await them
  client.query = (query: string) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err: any, res: any) => {
        if (err || res.length < 1) reject(err || 'Query returned nothing');
        resolve(res);
      });
    });
  };

  // Used for fetching guild member objects easier.
  client.fetchGuildMember = (ctx: Context) => {
    let msg = ctx.message;
    let args = msg.content.slice(ctx.prefix?.length).split(' ');

    if (!args[1]) return undefined;

    let m =
      msg.mentions.first() ||
      msg.guild?.members.get(args[1]) ||
      msg.guild?.members.find(
        (m) => m.username.toLowerCase() === args[1].toLowerCase()
      ) ||
      msg.guild?.members.find(
        (m) => m.nick?.toLowerCase() === args[1].toLowerCase()
      );
    return m;
  };
};
