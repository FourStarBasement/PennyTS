import { Context } from 'detritus-client/lib/command';
import { Webhook } from 'detritus-client/lib/structures';
import stuff from '../modules/embarrass';

export const embarrass = {
  name: 'embarrass',
  run: async (ctx: Context) => {
    if (!ctx.me?.canManageWebhooks) {
      ctx.reply(
        "I don't have permissions to make a webhook. Please change this in your guild settings."
      );
      return;
    }

    ctx.channel
      ?.createWebhook({ name: ctx.message.author.name })
      .then(async (hook) =>
        sendMessage(hook, ctx.message.author.avatarUrl).then(async (hook) =>
          hook?.delete()
        )
      )
      .catch(() => {
        ctx.channel?.fetchWebhooks().then(async (hooks) => {
          hooks[0].delete();
          ctx.channel
            ?.createWebhook({ name: ctx.message.author.name })
            .then(async (hook) =>
              sendMessage(
                hook,
                ctx.message.author.avatarUrl
              ).then(async (hook) => hook?.delete())
            );
        });
      });
  },
};

async function sendMessage(hook: Webhook, avatarUrl: string) {
  let content = stuff.things[Math.floor(Math.random() * stuff.things.length)];
  return hook.createMessage({
    content: content,
    avatarUrl: avatarUrl,
  });
}
