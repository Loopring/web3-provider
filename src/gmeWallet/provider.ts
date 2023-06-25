import Web3 from "web3";
import { walletServices } from "../walletServices";
import { IpcProvider } from "web3-core";
import { ConnectProviders, ErrorType, onChainChange } from "../command";
import { Send } from '../interface';


export const GameStop = async ( _props?: any): Promise<
  { provider: IpcProvider; web3: Web3 } | undefined
> => {
  try {
    // @ts-ignore
    if (!window.gamestop) {
      throw new Error("User not installed GameStop extension");
    }
    // @ts-ignore
    const provider = window.gamestop;
    const web3 = new Web3(provider as any);
    await (provider.send as Send)("eth_requestAccounts");
    try {
      await onChainChange(provider, _props.chainId);
    } catch (error) {
      console.log('wallet switch Ethereum Chain is not allowed');
      walletServices.sendError(ErrorType.FailedConnect, {
        connectName: ConnectProviders.GameStop,
        error: {
          code: 700202,
          message: (error as any).message,
        },
      });
    }
    walletServices.sendConnect(web3, provider);
    return {provider, web3};
  } catch (error) {
    console.error("Error happen at connect wallet with GameStop:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.GameStop,
      error: {
        code:
          (error as any).message === `User not installed GameStop extension`
            ? 700004
            : 700003,
        message: (error as any).message,
      },
    });
  }
};