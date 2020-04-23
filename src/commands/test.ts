import { CommandOptions, Context } from 'detritus-client/lib/command';

export const test = {
  name: 'test',
  run: async (context: Context) => {
    const fetch = require('node-fetch');
			let img = await fetch(`${context.member?.avatarUrl}?size=2048`);
			img = await img.buffer();
			context.reply({
				content: 'I\'m running!',
				file: {
					filename: 'test.png',

					data: img
				}
			}).catch(console.error);
  },
};
