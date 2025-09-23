module.exports = {
  // Lint and format JS/TS/JSX/TSX files in frontend and backend
  'frontend/src/**/*.{js,jsx}': ['npx eslint --fix', 'npx prettier --write'],
  'backend/src/**/*.{ts,js}': ['npx eslint --fix', 'npx prettier --write'],
};
