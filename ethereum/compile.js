const path = require('path')
const fs = require('fs')
const solc = require('solc')
const compiledPath = path.resolve(__dirname, 'compiled_contracts')

const resolveSol = (x) => {
  const contractsPath = path.resolve(__dirname, 'contracts', x)
  return fs.readFileSync(contractsPath, 'utf8')
}

const writeCompiled = (x, data) => {
  const f = path.resolve(compiledPath, x)
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

const mainContract = compiled.contracts['MisoToken.sol:MisoToken']

// Write data
writeCompiled('abi.json', mainContract.interface)

module.exports = {
  abi: mainContract.interface,
  bytecode: mainContract.bytecode
}
