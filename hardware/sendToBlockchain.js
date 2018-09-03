#!/usr/bin/env node
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const ABI = require('./compiled_contracts/abi.json')

const ContractAddress = '0xA086AD99f345cf9EA67552f0DcFbbf17A1EFEb1e'

const InfuraApiKey = process.env.INFURA_API_KEY
const Mnemonic = process.env.ETH_MNEMONIC_KEY

const deployLocalHost = (InfuraApiKey === undefined || Mnemonic === undefined)

let web3
if (deployLocalHost) {
  console.log('Connecting to localhost')
  web3 = new Web3('http://127.0.0.1:8545')
} else {
  console.log('Connecting to Rinkeby')
  web3 = new Web3(new HDWalletProvider(Mnemonic, 'https://rinkeby.infura.io/' + InfuraApiKey))
}

const contract = new web3.eth.Contract(ABI, ContractAddress)
contract.setProvider(web3.currentProvider)

contract.methods
  .feed()
  .send({ gas: '4712388', from: '0x2007a3FA09d42F739ac8D2B58fEc70fE3197A473' })
  .then((x) => {
    console.log(x)
  })