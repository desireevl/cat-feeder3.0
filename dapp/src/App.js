import React, { Component } from 'react'
import Blockies from 'react-blockies'
import ReactEcharts from 'echarts-for-react';
import { Grid, Row, Col } from 'react-flexbox-grid'

import './App.css'
import 'milligram'
import getWeb3 from './utils/getWeb3'
import abi from './compiled_contracts/abi.json'

const ContractAddress = '0xA086AD99f345cf9EA67552f0DcFbbf17A1EFEb1e'

class FeedingChart extends Component {
  shouldComponentUpdate = (nextProps, nextState) => {
    return JSON.stringify(nextProps.feedHistory) !== JSON.stringify(this.props.feedHistory) || nextProps.latestBlockNo !== this.props.latestBlockNo
  }

  render () {
    const { feedHistory, latestBlockNo } = this.props

    if (feedHistory.length <= 0) {
      return (
        <div style={{paddingTop: '150px'}}>
          No data to construct chart
        </div>
      )
    }

    const feedHistoryInt = feedHistory.map((x) => parseInt(x, 10))

    // Get last 6 hours
    const sixHours = 1000 * 60 * 60 * 6
    const endTime = new Date().getTime()
    const startTime = endTime - sixHours // 6 hours prior

    // Assume each block is 15 seconds
    const blockInterval = 15 * 1000    
    const startBlock = latestBlockNo - (sixHours / blockInterval)

    // Each data interval is 5 minutes
    const timeInterval = 60 * 1000 * 5

    let seriesData = []

    for (let i = startTime; i < endTime; i += timeInterval) {
      const now = new Date(i)
      seriesData.push({
        name: now.toString(),
        value: [
          [now.getHours(), (now.getMinutes() + '').padStart(2, '0')].join(':'),
          0
        ]
      })
    }

    feedHistoryInt.forEach((x) => {
      const blockDif = x - startBlock
      const dataIndex = Math.floor(blockDif / 20)

      if (blockDif > 0 && seriesData[dataIndex] !== undefined){
        seriesData[dataIndex].value[1] = 1
      }
    })

    const xAxisdata = seriesData.map(x => x.value[0])
    const yAxisdata = seriesData.map(x => x.value[1])

    
    const option = {
      xAxis: {
        type: 'category',
        data: xAxisdata,
        splitLine: {
          show: false
        },
        name: 'Time'
      },
      yAxis: {
        name: 'Fed',
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      series: [{
        data: yAxisdata,
        type: 'line',
        step: 'middle'
      }]
    };

    return (
      <div style={{paddingTop: '25px'}}>
        <ReactEcharts option={option} />
      </div>
    )
  }
}

class App extends Component {
  state = {
    web3GetError: false,
    web3InvalidNetwork: false,
    accounts: [],
    claimableTokens: 0,
    selectedAccountIndex: 0,
    balance: 0,
    blocksTillClaim: 0,
    feedHistory: [],
    blocksPerClaim: 0,
    tokensPerFeed: 0,
    dailyTokensNo: 0,
    latestBlockNo: 0,
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const contract = new web3.eth.Contract(abi, ContractAddress)
      contract.setProvider(web3.currentProvider);

      // Get network type
      const networkType = await web3.eth.net.getNetworkType()

      const web3InvalidNetwork = networkType !== 'rinkeby'

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract, web3InvalidNetwork }, this.syncDappData);

      // Auto sync data every second
      this.interval = setInterval(() => this.syncDappData(), 1000);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      this.setState({
        web3GetError: true
      })
      console.log(error);
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  }

  syncDappData = async () => {
    const { web3, accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]
    
    const balance = await contract.methods
      .balanceOf(from)
      .call()

    const feedHistory = await contract.methods
      .getFeedingHistory(from)
      .call()

    const blocksTillClaim = await contract.methods
      .getBlocksTillClaimable(from)
      .call()
    
    const claimableTokens = await contract.methods
      .getClaimableTokens(from)
      .call()
    
    const blocksPerClaim = await contract.methods
      .getBlocksPerClaim()
      .call()

    const tokensPerFeed = await contract.methods
      .getTokensPerFeed()
      .call()

    const dailyTokensNo = await contract.methods
      .getDailyTokensNo()
      .call()
    
    const latestBlockNo = await web3.eth.getBlockNumber()

    this.setState({
      balance,
      feedHistory,
      claimableTokens,
      blocksTillClaim,
      blocksPerClaim,
      tokensPerFeed,
      dailyTokensNo,
      latestBlockNo
    })
  }

  claimMisoTokens = () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    contract.methods
      .claim()
      .send({ gas: '4712388', from })
      .then((x) => {
        this.syncDappData()
      })
  }

  feed = () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    contract.methods
      .feed()
      .send({ gas: '4712388', from })
      .then((x) => {
        this.syncDappData()
      })
  }

  render () {
    const { web3GetError, web3InvalidNetwork, claimableTokens, latestBlockNo, tokensPerFeed, dailyTokensNo, blocksPerClaim, balance, feedHistory, blocksTillClaim, accounts, selectedAccountIndex } = this.state
    const address = accounts[selectedAccountIndex]

    if (accounts.length <= 0 && !web3GetError && !web3InvalidNetwork) {
      return (
        <Grid>
          <Row center='xs'>
            Loading...
          </Row>
        </Grid>
      )
    }

    if (web3GetError) {
      return (
        <Grid>
          <Row center='xs'>
            Unable to get web3. Make sure you have metamask installed if you're using chrome/firefox. If not use brave browser.
          </Row>
        </Grid>
      )
    }

    if (web3InvalidNetwork) {
      return (
        <Grid>
          <Row center='xs'>
            Cat Feeder has only been deployed to Rinkeby network. Please change to the Rinkeby network and refresh.
          </Row>
        </Grid>
      )
    }

    return (
      <Grid>
        <Row center='xs' middle='xs' style={{height: '42px', backgroundColor: '#dfe4ea', borderRadius: '5px'}}>
          <Col xs={12}>
            Network: <strong>Rinkeby</strong>&nbsp;|&nbsp;
            Blocks/claim: <strong>{blocksPerClaim}</strong>&nbsp;|&nbsp;
            Tokens/claim: <strong>{dailyTokensNo}</strong>&nbsp;|&nbsp;
            Tokens/feed: <strong>{tokensPerFeed}</strong>&nbsp;
          </Col>
        </Row>
        <br/><br/>
        <Row center='xs'>
          <Col xs={8}>
            <Blockies
              seed={address}
              size={25}
            />
            
            <br/><br/>

            <h5><a href={'https://rinkeby.etherscan.io/address/'+address}>{address}</a></h5>

            <table>
              <tbody>
                <tr>
                  <td>Balance</td>
                  <td>{balance}</td>
                </tr>
                <tr>
                  <td>Blocks Till Next Claim</td>
                  <td>{blocksTillClaim}</td>
                </tr>
                <tr>
                  <td>Claimable Tokens</td>
                  <td>{claimableTokens}</td>
                </tr>
              </tbody>
            </table>

            <button onClick={this.feed}>
              Feed
            </button>
            &nbsp;
            <button onClick={this.claimMisoTokens}>
              Claim tokens
            </button>            
          </Col>
        </Row>

        <Row center='xs'>
          <Col xs={12}>
            <FeedingChart feedHistory={feedHistory} latestBlockNo={latestBlockNo}/>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default App
