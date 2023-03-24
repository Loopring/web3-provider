import Web3 from "web3";
import { walletServices } from "./walletServices";
import { ConnectProvides } from "./providers";

export enum Commands {
  ConnectWallet = "ConnectWallet",
  DisConnect = "DisConnect",
  ChangeNetwork = "ChangeNetwork",
  Processing = "Processing",
  Error = "Error",
}
export enum ErrorType {
  FailedConnect = "FailedConnect",
}

export enum ProcessingType {
  waiting = "waiting",
  nextStep = "nextStep",
}

export const ExtensionSubscribe = (provider: any, web3: Web3) => {
  if (provider) {
    provider.on("accountsChanged", (accounts: Array<string>) => {
      if (accounts.length) {
        walletServices.sendConnect(web3, provider);
      } else {
        walletServices.sendDisconnect(-1, "disconnect for no account");
      }
    });
    provider.on("chainChanged", (_chainId: number) => {
      walletServices.sendConnect(web3, provider);
    });
    provider.on("disconnect", (code: number, reason: string) => {
      walletServices.sendDisconnect(code, reason);
    });
  }
};

export const ExtensionUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
    try {
      (provider?.close) ? provider?.close() : provider?.disable ? provider?.disable() : undefined;
    } catch (error) {
      throw error;
    }
  }
};


export const WalletConnectSubscribe = (
  provider: any,
  web3: Web3,
  _account?: string
) => {
  const {connector} = provider;
  if (provider && connector && connector.connected) {
    connector.on("connect", (error: Error | null, payload: any | null) => {
      if (error) {
        walletServices.sendError(ErrorType.FailedConnect, {
          connectName: ConnectProviders.WalletConnect,
          error,
        });
      }
      const {accounts, chainId} = payload.params[ 0 ];
      connector.approveSession({accounts, chainId});
      //
      // // const _accounts = await web3.eth.getAccounts();
      // console.log('accounts:', accounts)
      walletServices.sendConnect(web3, provider);
    });
    connector.on(
      "session_update",
      (error: Error | null, payload: any | null) => {
        const {accounts, chainId} = payload.params[ 0 ];
        if (error) {
          walletServices.sendError(ErrorType.FailedConnect, {
            connectName: ConnectProviders.WalletConnect,
            error,
          });
        }
        connector.updateSession({accounts, chainId});
        walletServices.sendConnect(web3, provider);
      }
    );
    connector.on("disconnect", (error: Error | null, payload: any | null) => {
      const {message} = payload.params[ 0 ];
      if (error) {
        walletServices.sendError(ErrorType.FailedConnect, {
          connectName: ConnectProviders.WalletConnect,
          error,
        });
      }
      walletServices.sendDisconnect("", message);
      console.log("WalletConnect on disconnect");
    });
  }
};

export const WalletConnectUnsubscribe = async (provider: any) => {
  if (provider && provider.connector) {
    const {connector} = provider;
    console.log("WalletConnect on Unsubscribe");
    connector.off("disconnect");
    connector.off("connect");
    connector.off("session_update");
    return;
  }
};

export enum ConnectProviders {
  Unknown = "Unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  // WalletConnectV2 = "WalletConnectV2",
  Coinbase = "Coinbase",
  GameStop = "GameStop",
}

export let _RPC_URLS: { [ chainId: number ]: string } = {
  1: process.env[ `${ConnectProvides.APP_FRAMeWORK}RPC_URL_1` ] as string,
  5: process.env[ `${ConnectProvides.APP_FRAMeWORK}RPC_URL_5` ] as string,
};
if (process.env[ `${ConnectProvides.APP_FRAMeWORK}RPC_URL_OTHERS` ]) {
  const ids = process.env[ `${ConnectProvides.APP_FRAMeWORK}RPC_URL_OTHERS` ]?.split(',') ?? []
  ids.forEach((item) => {
    _RPC_URLS[ Number(item) ] = process.env[ `${ConnectProvides.APP_FRAMeWORK}RPC_URL_${item}` ] as string;
  })
}

export const RPC_URLS = _RPC_URLS
export const AvaiableNetwork = Object.keys(RPC_URLS);

