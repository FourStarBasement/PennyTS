// Deserialise some starboard stuff
export interface StarData {
  count: number;
  msgID: string;
  starID: string;
}

export interface StarboardInfo {
  starboard: string;
}

// So that linter doesn't complain
export interface FetchedStarData {
  count: number;
  messageID: string;
  starID: string;
  starboard: string;
}
