import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';

export const messageReactionAdd = {
  event: ClientEvents.MESSAGE_REACTION_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.MessageReactionAdd
  ) => {
    if (
      !payload.guildId ||
      payload.reaction.emoji.name !== '⭐' ||
      payload.message?.channel!.nsfw ||
      payload.user?.bot
    ) {
      return;
    }

    let message = payload.message || (await client);
    let author = payload.message?.author!;
    let channel = payload.message?.channel;
    let me = payload.message?.guild?.me!;

    await client.checkGuild(payload.guildId, () => {
      if (payload.userId === me.id && client) {
      }
    });
  },
};
