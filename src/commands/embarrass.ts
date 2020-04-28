import { Context } from 'detritus-client/lib/command';
import { Webhook } from 'detritus-client/lib/structures';
import images from '../modules/images';

export const embarrass = {
  name: 'embarrass',
  metadata: {
    description: 'Yes',
  },
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
  let content =
    images.embarrass[Math.floor(Math.random() * images.embarrass.length)];
  return hook.createMessage({
    content: content,
    avatarUrl: avatarUrl,
  });
}
