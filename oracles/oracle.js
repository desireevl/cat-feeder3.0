const Web3 = require('web3')
const ABI = require('./compiled_contracts/abi.json')

const ContractAddress = '0xA086AD99f345cf9EA67552f0DcFbbf17A1EFEb1e'
const MonitoringAddress = '0x2007a3FA09d42F739ac8D2B58fEc70fE3197A473'

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
