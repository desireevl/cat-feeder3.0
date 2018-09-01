const path = require('path')
const fs = require('fs')
const solc = require('solc')
const compiledPath = path.resolve(__dirname, 'src/compiled_contracts')
const compiledPath2 = path.resolve(__dirname, '../oracles/compiled_contracts')

const resolveSol = (x) => {
  const contractsPath = path.resolve(__dirname, 'contracts', x)
  return fs.readFileSync(contractsPath, 'utf8')
}

const writeCompiled = (x, data) => {
  const f = path.resolve(compiledPath, x)
  const f2 = path.resolve(compiledPath2, x)

  fs.writeFileSync(f2, data)
  fs.writeFileSync(f, data)
}

const input = {
  'BaseToken.sol': resolveSol('BaseToken.sol'),
  'MisoToken.sol': resolveSol('MisoToken.sol'),
  'SafeMath.sol': resolveSol('SafeMath.sol'),
  'Token.sol': resolveSol('Token.sol')
}

const compiled = solc.compile({ sources: input }, 1)

// Create folder if doesn't exist
if (!fs.existsSync(compiledPath)) {
  fs.mkdirSync(compiledPath)
}

// Create folder if doesn't exist
if (!fs.existsSync(compiledPath2)) {
  fs.mkdirSync(compiledPath2)
}

const mainContract = compiled.contracts['MisoToken.sol:MisoToken']

// Write data
writeCompiled('abi.json', mainContract.interface)

module.exports = {
  abi: mainContract.interface,
  bytecode: mainContract.bytecode
}
