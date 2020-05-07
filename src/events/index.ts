import { messageReactionAdd } from './messageReactionAdd';
import { messageReactionRemove } from './messageReactionRemove';
import { guildMemberAdd } from './guildMemberAdd';
import { guildMemberRemove } from './guildMemberRemove';
import { guildMemberUpdate } from './guildMemberUpdate';
import { guildBanAdd } from './guildBanAdd';
import { guildBanRemove } from './guildBanRemove';

export default [
  messageReactionAdd,
  messageReactionRemove,
  guildMemberAdd,
  guildMemberRemove,
  guildMemberUpdate,
  guildBanAdd,
  guildBanRemove,
];
