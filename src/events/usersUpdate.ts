import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents, CommandClient } from 'detritus-client';

export const usersUpdate = {
  event: ClientEvents.USERS_UPDATE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.UsersUpdate
  ) => {
    if (payload.differences && payload.differences['avatar']) {
      payload.user.avgColor = await client.fetchAverageColor(
        payload.user.avatarUrl
      );
      // TODO: Change this to debug log
      // console.log(
      //  `User avatar update! Changing avgColor to ${payload.user.avgColor} for ${payload.user.username}`
      // );
    }
  },
};
