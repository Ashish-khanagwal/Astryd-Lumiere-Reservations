// Export the exact frontend demo content; no browser or production services involved.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
global.localStorage = { getItem: () => null, setItem: () => {} };
global.window = { addEventListener: () => {} };
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(compiled.outputText, filename);
};
const { buildSeed } = require('../src/mocks/seed.ts');
const destination = process.argv[2];
if (!destination) throw new Error('Provide an output JSON path');
fs.writeFileSync(path.resolve(destination), JSON.stringify(buildSeed(), null, 2));
console.log('Exported frontend demo content.');
