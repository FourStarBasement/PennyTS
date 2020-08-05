import config from './modules/config';
import commands from './commands/index';
import ownerCommands from './commands/owner/index';
import functions from './modules/functions';
import { PresenceStatuses, ActivityTypes } from 'detritus-client/lib/constants';

import { CommandClient, ShardClient } from 'detritus-client';
import events from './events';
import { Range } from 'node-schedule';

import fetch from 'node-fetch';

import pgPromise, { IBaseProtocol } from 'pg-promise';
const pgp = pgPromise();

// TODO: Perhaps make a custom class wrapper for this?
const connection: IBaseProtocol<{}> = pgp(
  `postgres://${config.sql.username}:${config.sql.password}@${config.sql.host}/${config.sql.db_name}`
);

const cmdClient = new CommandClient(config.token, {
  activateOnEdits: true,
  gateway: {
    presence: {
      activity: {
        name: 'penny.wiggy.dev',
        type: ActivityTypes.PLAYING,
      },
      status: PresenceStatuses.ONLINE,
    },
    loadAllMembers: true,
    identifyProperties: {
      $browser: 'Discord iOS',
    },
  },
  useClusterClient: false,
});

functions(cmdClient, connection);
//cmdClient.addMultipleIn('../src/commands');
cmdClient.addMultiple(commands);
cmdClient.addOwnerOnly(ownerCommands);
cmdClient.addEvents(events);

(async () => {
  const client = await cmdClient.run();
  // client has received the READY payload, do stuff now
  console.log(`Online with ${client.shardCount} shards`);
  cmdClient.ready = true;
  const s = require('node-schedule');

  cmdClient.job = s.scheduleJob({ hour: 0, minute: 0 }, () => {
    cmdClient.query(
      'UPDATE users SET cookie_time = true WHERE cookie_time = false'
    );
    cmdClient.query(
      'UPDATE users SET daily_time = true WHERE daily_time = false'
    );
  });

  cmdClient.starInterval = s.scheduleJob(
    { second: new Range(0, 59, 2) },
    () => {
      if (cmdClient.starQueue.length < 1) return;
      cmdClient.starQueue.shift()();
    }
  );

  if (
    config.topgg.token.length !== 0 ||
    config.discordbotsgg.token.length !== 0
  )
    setInterval(async () => {
      await fetch(`https://top.gg/api/bots/309531399789215744/stats`, {
        method: 'POST',
        headers: {
          Authorization: config.topgg.token,
        },
        body: JSON.stringify({
          server_count: (cmdClient.client as ShardClient).guilds.size,
          shard_count: (cmdClient.client as ShardClient).shardCount,
        }),
      })
        .then((_) =>
          console.log(
            `[Top-GG_Interval] Posted ${
              (cmdClient.client as ShardClient).guilds.size
            } guilds to top.gg!`
          )
        )
        .catch(console.error);
      await fetch(
        `https://discord.bots.gg/api/v1/bots/309531399789215744/stats`,
        {
          method: 'POST',
          headers: {
            Authorization: config.discordbotsgg.token,
          },
          body: JSON.stringify({
            guildCount: (cmdClient.client as ShardClient).guilds.size,
            shardCount: (cmdClient.client as ShardClient).shardCount,
          }),
        }
      )
        .then((_) =>
          console.log(
            `[Discord Bots.GG_Interval] Posted ${
              (cmdClient.client as ShardClient).guilds.size
            } guilds to discord.bots.gg!`
          )
        )
        .catch(console.error);
    }, 60000 * 60);
  else
    console.log(
      '[Bot stats_Interval] Not posting server stats due to no token set in config!'
    );
})();
