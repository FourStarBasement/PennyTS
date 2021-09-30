import { ModLogActionFlags } from "./db";

export const ModLogReactions: Record<string, ModLogActionFlags[]> = {
  '0️⃣': [
    ModLogActionFlags.CHANNEL_CREATE,
    ModLogActionFlags.CHANNEL_UPDATE,
    ModLogActionFlags.CHANNEL_DELETE,
  ],
  '1️⃣': [
    ModLogActionFlags.GUILD_ROLE_CREATE,
    ModLogActionFlags.GUILD_ROLE_UPDATE,
    ModLogActionFlags.GUILD_ROLE_DELETE,
  ],
  '2️⃣': [ModLogActionFlags.CHANNEL_PINS_UPDATE],
  '3️⃣': [ModLogActionFlags.GUILD_MEMBER_ADD, ModLogActionFlags.GUILD_MEMBER_REMOVE],
  '4️⃣': [ModLogActionFlags.GUILD_MEMBER_UPDATE],
  '5️⃣': [ModLogActionFlags.GUILD_BAN_ADD, ModLogActionFlags.GUILD_BAN_REMOVE],
  '6️⃣': [ModLogActionFlags.GUILD_EMOJIS_UPDATE],
  '7️⃣': [ModLogActionFlags.INVITE_CREATE, ModLogActionFlags.INVITE_DELETE],
  '8️⃣': [ModLogActionFlags.MESSAGE_DELETE, ModLogActionFlags.MESSAGE_DELETE_BULK],
};
