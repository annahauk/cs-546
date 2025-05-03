

export const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'CS546_Group1_gitMatches',
};

export const authConfig = {
  saltRounds: 15,
  tokenLength: 10,
  tokenCacheLifetime: 3.6e+6, // 1 hour
  tokenMaxAge: 3.6e+6*24, // 24 hours
}