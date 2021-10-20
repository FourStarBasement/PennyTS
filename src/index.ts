import config from './modules/config';
import commands from './commands/index';
import ownerCommands from './commands/bot/owner/index';
import slashCommands from './commands/slash/index';
import functions from './modules/functions';
import {
  PresenceStatuses,
  ActivityTypes,
} from 'detritus-client/lib/constants';

import {
  CommandClient,
  ShardClient,
  InteractionCommandClient,
} from 'detritus-client';
import events from './events';
import { Range } from 'node-schedule';

import fetch from 'node-fetch';

import pgPromise, { IBaseProtocol } from 'pg-promise';
import { GatewayIntents } from 'detritus-client-socket/lib/constants';
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
        name: 'https://penny.wiggy.dev',
        type: ActivityTypes.PLAYING,
      },
      status: PresenceStatuses.ONLINE,
    },
    loadAllMembers: true,
    intents: 1543
  },
  useClusterClient: false,
});
const interactionClient = new InteractionCommandClient(cmdClient);
functions(cmdClient, connection, interactionClient);
//cmdClient.addMultipleIn('../src/commands');
cmdClient.addMultiple(commands);
interactionClient.addMultiple(slashCommands);

cmdClient.addOwnerOnly(ownerCommands);
cmdClient.addEvents(events);

(async () => {
  const client = await cmdClient.run();
  await interactionClient.uploadApplicationCommands().catch(console.error); // Upload slash commands if any
  await interactionClient.run().catch(console.error);

  const shardClient = client as ShardClient;
  // client has received the READY payload, do stuff now
  // this should (in theory) allow for sharding as the command client (to my knowledge) handles sharding already :)
  console.log(`Online with ${client.shardCount} shards`);
  cmdClient.ready = true;

  // Add owners from config
  config.owners.forEach((uid: string) => {
    const user = shardClient.users.get(uid);
    if (!user) {
      /*
       * Try to fetch from the API
       * TODO: fetching from API the best option here? perhaps make a fake user and fill in later
       * Or maybe get from the gateway? a few options here...
       */
      shardClient.rest
        .fetchUser(uid)
        .then((apiUser) => {
          shardClient.owners.set(apiUser.id, apiUser);
          console.log(`Found ${apiUser.name} from the API, added as owner!`);
        })
        .catch((_) =>
          console.error(
            `Failed to add ${uid} as an owner, could not find them!`
          )
        );
      return;
    }

    shardClient.owners.set(user.id, user);
    console.log(`Added ${user.name} as an owner!`);
  });

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
      let statuses = [
        `Online with ${shardClient.guilds.size} guilds`,
        'Salutations!',
        'https://penny.wiggy.dev',
        `${shardClient.users.size} users`,
      ];
      shardClient.gateway.setPresence({
        activity: {
          name: statuses[Math.floor(Math.random() * statuses.length)],
          type: ActivityTypes.PLAYING,
        },
      });
      await fetch(`https://top.gg/api/bots/309531399789215744/stats`, {
        method: 'POST',
        headers: {
          Authorization: config.topgg.token,
        },
        body: JSON.stringify({
          server_count: shardClient.guilds.size,
          shard_count: shardClient.shardCount,
        }),
      })
        .then((_) =>
          console.log(
            `[Top-GG_Interval] Posted ${shardClient.guilds.size} guilds to top.gg!`
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
            guildCount: shardClient.guilds.size,
            shardCount: shardClient.shardCount,
          }),
        }
      )
        .then((_) =>
          console.log(
            `[Discord Bots.GG_Interval] Posted ${shardClient.guilds.size} guilds to discord.bots.gg!`
          )
        )
        .catch(console.error);
    }, 60000 * 60);
  else
    console.log(
      '[Bot stats_Interval] Not posting server stats due to no token set in config!'
    );
})();
