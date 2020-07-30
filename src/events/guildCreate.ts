import { ClientEvents } from 'detritus-client/lib/constants';
import { CommandClient, ShardClient } from 'detritus-client';
import fetch from 'node-fetch';
import config from '../modules/config';

export const guildCreate = {
  event: ClientEvents.GUILD_CREATE,
  listener: async (cmdClient: CommandClient) => {
    if (!cmdClient.ready) return;
    await fetch(`https://top.gg/api/bots/309531399789215744/stats`, {
      method: 'POST',
      headers: {
        Authorization: config.topgg.token,
      },
      body: JSON.stringify({
        server_count: (cmdClient.client as ShardClient).guilds.size,
      }),
    }).catch(console.error);
  },
};
