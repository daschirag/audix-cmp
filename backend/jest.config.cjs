module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    // Specific fix for the most nested imports
    '\\.\\./\\.\\./\\.\\./lib/redis.js': '<rootDir>/src/lib/redis.js',
    '\\.\\./\\.\\./\\.\\./lib/prisma.js': '<rootDir>/src/lib/prisma.js',
    // Fallback for others
    '^(\\.\\.?/.+)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
};
