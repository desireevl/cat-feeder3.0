
const Web3 = require('web3')
const { abi, bytecode } = require('./compile')

const web3 = new Web3('http://127.0.0.1:8545')

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  console.log('Attempting to deploy from account', accounts[0])

  const result = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({ data: bytecode, arguments: [Math.pow(2, 256) - 1, 'Miso Token', 4, 'MISO'] })
    .send({ gas: '4712388', gasPrice: '100000000000', from: accounts[0] })

  console.log('Contract deployed to', result.options.address)
}

deploy()
