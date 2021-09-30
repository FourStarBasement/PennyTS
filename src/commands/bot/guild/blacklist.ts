import { Context } from 'detritus-client/lib/command';
import { Role } from 'detritus-client/lib/structures';
import { DBRole } from '../../modules/db';

let blacklisted: Role[] = [];
let removed: Role[] = [];
export const blacklist = {
  name: 'blacklist',
  metadata: {
    description: 'Blacklist roles from the edit command.',
  },
  run: async (ctx: Context) => {
    let role = ctx.member?.roles.first();
    let response = '';
    await addOrRemoveFromDB(role!, ctx);
    if (blacklisted.length > 0)
      response += `Blacklisted ${blacklisted.length} roles.`;
    if (removed.length > 0)
      response += `Removed ${removed.length} roles from the blacklist.`;
  },
};

async function addOrRemoveFromDB(role: Role, ctx: Context) {
  let res: DBRole[] = await ctx.commandClient?.query(
    `SELECT COUNT(*) AS count FROM roles WHERE guild = ${ctx.guildId} AND role = ${role.id}`
  );

  if (res.length == 0) {
    await ctx.commandClient.query(
      `INSERT INTO roles (role, guild) VALUES (${role.id}, ${ctx.guildId})`
    );
    blacklisted.push(role);
  } else {
    await ctx.commandClient.query(`DELETE FROM roles WHERE role = ${role.id}`);
    removed.push(role);
  }
}
