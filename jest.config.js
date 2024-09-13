module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ["/node_modules/", "/out/"],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      }
    },
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      "^vscode$": "<rootDir>/__mocks__/vscode.js"
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts', 
    ],
    coverageDirectory: 'coverage', 
    coverageReporters: ['json', 'lcov', 'text', 'clover'], 
    coverageThreshold: {
        global: {
            branches: 75, 
            functions: 80,
            lines: 80,
            statements: 80, 
        },
    },

  };
  