import React, { Component } from 'react'
import Blockies from 'react-blockies'
import ReactEcharts from 'echarts-for-react';
import { Grid, Row, Col } from 'react-flexbox-grid'

import './App.css'
import getWeb3 from './utils/getWeb3'
import abi from './compiled_contracts/abi.json'

const MISO_TOKEN_ADDRESS = '0xF0287086B4Ee10d109052cCBB0e377D81ED7698C'

class FeedingChart extends Component {
  shouldComponentUpdate = (nextProps, nextState) => {
    return JSON.stringify(nextProps.feedHistory) !== JSON.stringify(this.props.feedHistory)
  }

  render () {
    const { feedHistory } = this.props

    if (feedHistory.length <= 0) {
      return (
        <div style={{paddingTop: '150px'}}>
          No data to construct chart
        </div>
      )
    }

    const feedHistoryInt = feedHistory.map((x) => parseInt(x, 10))
    const feedHistoryDict = feedHistoryInt.reduce((acc, i) => {
      acc[i] = 1
      return acc
    }, {})
    const startInt = feedHistoryInt[0] - 1
    const endInt = feedHistoryInt[feedHistory.length - 1] + 1

    const xAxis = Array(endInt - startInt).fill(0).map((_, idx) => idx + startInt)
    const seriesData = xAxis.map((x) => {
      return feedHistoryDict[x] || 0
    })

    const option = {
      xAxis: {
        type: 'category',
        data: xAxis,
        name: 'Block No'
      },
      yAxis: {
        name: 'Feed (Yes: 1, No: 0)',
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      series: [{
        data: seriesData,
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
    accounts: [],
    claimableTokens: 0,
    selectedAccountIndex: 0,
    balance: 0,
    blocksTillClaim: 0,
    feedHistory: [],
    blocksPerClaim: 0,
    tokensPerFeed: 0,
    dailyTokensNo: 0
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const contract = new web3.eth.Contract(abi, MISO_TOKEN_ADDRESS)
      contract.setProvider(web3.currentProvider);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract }, this.syncDappData);

      // Auto sync data every second
      this.interval = setInterval(() => this.syncDappData(), 1000);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
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
      .getFeedingHistory()
      .call()

    const blocksTillClaim = await contract.methods
      .getBlocksTillClaimable()
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

    const claimableTokens = await contract.methods
      .getClaimableTokens()
      .call()

    web3.eth.getBlockNumber((err, res) => {
      console.log('block number ' + res)
    })

    this.setState({
      balance,
      feedHistory,
      claimableTokens,
      blocksTillClaim,
      blocksPerClaim,
      tokensPerFeed,
      dailyTokensNo
    })
  }

  claimMisoTokens = () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    contract.methods
      .claim()
      .send({from})
      .then((x) => {
        this.syncDappData()
      })
  }

  feed = () => {
    const { accounts, contract, selectedAccountIndex } = this.state
    const from = accounts[selectedAccountIndex]

    contract.methods
      .feed()
      .send({from})
      .then((x) => {
        this.syncDappData()
      })
  }

  render () {
    const { claimableTokens, tokensPerFeed, dailyTokensNo, blocksPerClaim, balance, feedHistory, blocksTillClaim, accounts, selectedAccountIndex } = this.state

    console.log(feedHistory)

    if (accounts.length <= 0) {
      return (
        <Grid>
          <Row center='xs'>
            Loading...
          </Row>
        </Grid>
      )
    }

    return (
      <Grid>
        <Row center='xs'>
          <Col xs={8}>
            <Blockies
              seed={accounts[selectedAccountIndex]}
              size={25}
            /> <br/> <br/>
            {accounts[selectedAccountIndex]}<br/><br/>

            Miso Token Balance: <strong>{balance}</strong><br/>
            Blocks Till Next Claim: <strong>{blocksTillClaim}</strong><br/>
            Claimable Tokens: <strong>{claimableTokens}</strong><br/><br/>

            <button onClick={this.feed}>
              Feed
            </button>
            &nbsp;
            <button onClick={this.claimMisoTokens}>
              Claim daily tokens
            </button>            
          </Col>
          <Col xs={4}>
            <div style={{borderLeft: '1px solid black', height: '100%', width: '100%', paddingLeft: '20px', paddingTop: '50px', verticalAlign: 'middle'}}>
              <strong>Miso Token Stats</strong><br/><br/>

              Blocks per Claim: <strong>{blocksPerClaim}</strong><br />
              Tokens per Claim: <strong>{dailyTokensNo}</strong><br />
              Tokens per Feed: <strong>{tokensPerFeed}</strong><br />
            </div>
          </Col>
        </Row>

        <Row center='xs'>
          <Col xs={12}>
            <FeedingChart feedHistory={feedHistory}/>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default App
