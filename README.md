<p align="center" >
  <a href="https://github.com/Loopring/loopring-web-v2" rel="noopener" target="_blank"><img width="150" src="https://loopring.org/images/logo.svg" alt="Loopring-website"></a>
</p>


<h1 align="center">Loopring web3-provider</h1>
<div align="center">
<h2>A lite tool to connect web extension & Dapp</h2>
<p>Open source and free use</p>

[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Loopring/loopring-web-v2/master/LICENSE)

[![type-badge](https://img.shields.io/npm/types/react-data-grid)](https://www.npmjs.com/package/react-data-grid)

</div>

## π Quick Start

```bash
// with yarn
yarn install @loopring-web/web3-provider
```
## π Support Provider 
 - Metamask
 - WallectConnet
 - Coinbase
 - Coming soon

## πͺ§Demo
 - [Vue](https://codesandbox.io/s/vue-8nco78)
 - [React](https://codesandbox.io/s/react-4v50ft)
## env.product
 - React  .env.${DOMAIN}
```.env.product
REACT_APP_RPC_URL_1=https://mainnet.eth.loopring.network
REACT_APP_RPC_URL_5=https://goerli.infura.io/v3/b951a403f3d3426fb2008c6923254dbc
REACT_APP_WALLET_CONNECT_BRIDGE=https://wcbridge.loopring.network
REACT_APP_WALLET_CONNECT_PING=https://wcbridge.loopring.network/hello
```
 - Vue  .env.${DOMAIN}
```.env.product
VUE_APP_RPC_URL_1=https://mainnet.eth.loopring.network
VUE_APP_RPC_URL_5=https://goerli.infura.io/v3/b951a403f3d3426fb2008c6923254dbc
VUE_APP_WALLET_CONNECT_BRIDGE=https://wcbridge.loopring.network
VUE_APP_WALLET_CONNECT_PING=https://wcbridge.loopring.network/hello
```
```ts
 /*DEFAULET is "REACT_APP_" */ 
 ConnectProvides.APP_FRAMeWORK = "VUE_APP_";
```

## π [What is Loopring?](https://loopring.org/#/)

## π« Community
- [Loopring Website](https://loopring.org/)
- [Loopring Exchange](https://loopring.io/#/layer2)
- [Loopring Reddit](https://www.reddit.com/r/loopringorg/)
- [Loopring Medium](https://medium.com/loopring-protocol)
- [Loopring Twitter](https://twitter.com/loopringorg)
- [Loopring Telegram](https://t.me/loopring_en)


## πΊ For Developer
- We appreciate any improvements or initiatives for Loopring Layer2 website, please view the source code in `./packages/component-lib`.
- The project contains a separate lib "web3-provider", which is a third-party ETH web3 wallet provider service (wallectConnect & metamask),
- You are welcome to reuse it or integrate your provider service with our website.
- Feel free to leave suggestions or ideas.

### π API & SDK
- [JS SDK](https://loopring.github.io/loopring_sdk)
- [Python](https://github.com/Loopring/hello_loopring)
- [APIs](https://docs.loopring.io/en/)


## π Protocol & Architecture

- [Whitepaper](https://loopring.org/resources/en_whitepaper.pdf)
- [Design Docs](https://github.com/LoopringSecondary/docs/wiki/Loopring3_Design)

## β[Help](https://desk.zoho.com/portal/loopring/en/home)

## π Security

- [Wallet](https://security.loopring.io/)
- [Protocol Audit](https://loopring.org/resources/loopring1.0_audit.pdf)

## Release Process
alpha.loopring.io, beta.loopring.io, static.loopring.io, and loopring.io are now auto deployed using Vercel.
