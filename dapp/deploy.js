
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const { abi, bytecode } = require('./compile')

const InfuraApiKey = process.env.INFURA_API_KEY
const Mnemonic = process.env.ETH_MNEMONIC_KEY

const deployLocalHost = (InfuraApiKey === undefined || Mnemonic === undefined)

let web3
if (deployLocalHost) {
  console.log('Deploying to localhost')
  web3 = new Web3('http://127.0.0.1:8545')
} else {
  console.log('Deloying to Rinkeby')
  web3 = new Web3(new HDWalletProvider(Mnemonic, 'https://rinkeby.infura.io/' + InfuraApiKey))
}

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()
  const prefix = deployLocalHost ? '' : '0x'

  console.log('Attempting to deploy from account', accounts[0])

  const result = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({ data: prefix + bytecode, arguments: [Math.pow(2, 256) - 1, 'Miso Token', 4, 'MISO'] })
    .send({ gas: 4712388, gasLimit: 200000, gasPrice: 100000000000, from: accounts[0] })

  console.log('Contract deployed to', result.options.address)
}

deploy()
