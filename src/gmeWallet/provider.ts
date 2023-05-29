import Web3 from "web3";
import { walletServices } from "../walletServices";
import { IpcProvider } from "web3-core";
import { ConnectProviders, ErrorType } from "../command";
import { Send } from '../interface';
import { ConnectProvides } from '../providers';


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
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: _props.chainId ?? 1}],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if ((switchError as any)?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: _props.chainId,
                chainName: process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_CHAINNAME_${_props.chainId}` ],
                rpcUrls: [process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_${_props.chainId}` ]] /* ... */,
              },
            ],
          });
        } catch (addError) {
          throw  addError
        }
      } else {
        throw  switchError
      }
    }
    await (provider.send as Send)("eth_requestAccounts");
    const web3 = new Web3(provider as any);
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