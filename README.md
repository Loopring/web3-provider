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

## 🚀 Quick Start

```bash
// with yarn
yarn install @loopring-web/web3-provider
```

## 🛒 Support Provider

- Metamask
- WallectConnet
- Coinbase
- GameStop Wallet

## 🪧Demo

- [Vue](https://codesandbox.io/s/vue-8nco78)
- [React](https://codesandbox.io/s/react-4v50ft)

## Configuration

### env.product
- React .env.${DOMAIN}

```.env.product
# Get your projectId at https://cloud.walletconnect.com
REACT_APP_WALLET_CONNECT_V2_ID=""
REACT_APP_RPC_URL_1=https://mainnet.eth.loopring.io
REACT_APP_RPC_URL_5=https://goerli.infura.io/v3/b951a403f3d3426fb2008c6923254dbc
#self-rely
#REACT_APP_WALLET_CONNECT_WSS_BRIDGE
#REACT_APP_WALLET_CONNECT_PING
#legacy walletConnect V1
#REACT_APP_WALLET_CONNECT_BRIDGE=https://wcbridge.loopring.io
#REACT_APP_WALLET_CONNECT_PING=https://wcbridge.loopring.io/hello
```

- Vue .env.${DOMAIN}

```.env.product
# Get your projectId at https://cloud.walletconnect.com
VUE_APP_WALLET_CONNECT_V2_ID=""
VUE_APP_RPC_URL_1=https://mainnet.eth.loopring.io
VUE_APP_RPC_URL_5=https://goerli.infura.io/v3/b951a403f3d3426fb2008c6923254dbc
#self-rely
#VUE_APP_WALLET_CONNECT_WSS_BRIDGE
#VUE_APP_WALLET_CONNECT_PING
#legacy walletConnect V1
#VUE_APP_WALLET_CONNECT_BRIDGE=https://wcbridge.loopring.io
#VUE_APP_WALLET_CONNECT_PING=https://wcbridge.loopring.io/hello

```

```ts
 /*DEFAULET is "REACT_APP_" */
ConnectProvides.APP_FRAEWORK = "VUE_APP_";
```

- Network extension

```.env
# ${APP_FRAEWORK}RPC_URL_OTHERS
REACT_APP_RPC_OTHERS=${NETWORK_ID1},${NETWORK_ID2}
REACT_APP_RPC_URL_${NETWORK_ID1}=https://xxxx
REACT_APP_RPC_URL_${NETWORK_ID2}=https://xxxx
REACT_APP_RPC_CHAINNAME_${NETWORK_ID1}=xxxx
REACT_APP_RPC_CHAINNAME_${NETWORK_ID2}=xxxx
REACT_APP_WALLET_CONNECT_WSS_BRIDGE
REACT_APP_WALLET_CONNECT_PING
...
``` 

## webpack

```ts
// babelLoader.include = [
//     babelLoader.include,
//     path.resolve(__dirname, "../../node_modules/@walletconnect"),
//     path.resolve(__dirname, "../../node_modules/@web3modal"),
// ];
config.module.rules = [
  ...
    {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: [
        ...
          // add node_modules/@walletconnect and node_modules/@web3modal to babelLoader rules  
          path.resolve(__dirname, "../../node_modules/@walletconnect"),
        path.resolve(__dirname, "../../node_modules/@web3modal"),
      ],
      ...
    },
  ...
]


```

## 👉 [What is Loopring?](https://loopring.org/#/)

## 🫂 Community

- [Loopring Website](https://loopring.org/)
- [Loopring Exchange](https://loopring.io/#/layer2)
- [Loopring Reddit](https://www.reddit.com/r/loopringorg/)
- [Loopring Medium](https://medium.com/loopring-protocol)
- [Loopring Twitter](https://twitter.com/loopringorg)
- [Loopring Telegram](https://t.me/loopring_en)


## 👺 For Developer
- We appreciate any improvements or initiatives for Loopring Layer2 website, please view the source code in `./packages/component-lib`.
- The project contains a separate lib "web3-provider", which is a third-party ETH web3 wallet provider service (wallectConnect & metamask),
- You are welcome to reuse it or integrate your provider service with our website.
- Feel free to leave suggestions or ideas.

### 📒 API & SDK
- [JS SDK](https://loopring.github.io/loopring_sdk)
- [Python](https://github.com/Loopring/hello_loopring)
- [APIs](https://docs.loopring.io/en/)


## 🙋 Protocol & Architecture

- [Whitepaper](https://loopring.org/resources/en_whitepaper.pdf)
- [Design Docs](https://github.com/LoopringSecondary/docs/wiki/Loopring3_Design)

## ❓[Help](https://desk.zoho.com/portal/loopring/en/home)

## 🔑 Security

- [Wallet](https://security.loopring.io/)
- [Protocol Audit](https://loopring.org/resources/loopring1.0_audit.pdf)

## Release Process

alpha.loopring.io, beta.loopring.io, static.loopring.io, and loopring.io are now auto deployed using Vercel.

## Error Code

700002: Global ethereum is not Coinbase, Please disable other Wallet Plugin 700003: Unknown 700004: User not installed
GameStop extension 700202: wallet switch Ethereum Chain is not allowed 700201: user manually closed walletConnect modal,
Connection request reset. Please try again 