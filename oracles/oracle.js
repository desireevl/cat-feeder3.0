const Web3 = require('web3')
const ABI = require('./compiled_contracts/abi.json')

const ContractAddress = '0x9AE483271A6215Ff32771eb684A07017b65e1C1F'
const MonitoringAddress = '0xAa9d9cd65C08e1aBAd33AF8f8A13A9D7Ec7D117E'

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws'))
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
const contract = new web3.eth.Contract(ABI, ContractAddress)
contract.setProvider(web3.currentProvider)

console.log('Oracle watching contact at address ' + ContractAddress)
console.log('Looking for events emitted for: ' + MonitoringAddress)

// Filty bug
contract
  .events
  .allEvents({}, (err, res) => {
    if (err) {
      console.log('Error ' + err)
      return
    }

    if (Object.keys(res.returnValues).length <= 0) {
      return
    }

    const retValues = JSON.parse(JSON.stringify(res.returnValues))

    try {
      if (retValues.addr.toLowerCase() === MonitoringAddress.toLowerCase()) {
        console.log('Fed!')
      }
    } catch (e) {

    }
  })
