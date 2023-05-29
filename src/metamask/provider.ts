import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { ConnectProviders, ErrorType } from "../command";
import { IsMobile } from "../utilities";
import { Web3Provider } from "@ethersproject/providers";
import { ProviderChainId } from '@walletconnect/ethereum-provider/dist/types/types';
import { ConnectProvides } from '../providers';

export const MetaMaskProvide = async (
  _props: { darkMode?: boolean, chainId?: ProviderChainId }
): Promise<{ provider: Web3Provider; web3: Web3 } | undefined> => {
  try {
    // @ts-ignore
    if (!window.ethereum?.isMetaMask && !IsMobile.any()) {
      throw new Error(
        `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
      );
    }
    let provider: any = await detectEthereumProvider({
      mustBeMetaMask: !IsMobile.any(),
    });
    const ethereum: any = window.ethereum;

    if (!IsMobile.any() && provider?.providerMap) {
      provider = provider?.providerMap?.get('MetaMask') ?? provider;
    }

    if (provider && ethereum) {
      const web3 = new Web3(provider as any);
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: _props.chainId ?? 1}],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((switchError as any)?.code === 4902) {
          try {
            await ethereum.request({
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
      await (provider ?? ethereum).request({method: "eth_requestAccounts"});
      walletServices.sendConnect(web3, provider);
      // @ts-ignore
      return {provider, web3};
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(
      "Error happen at connect wallet with MetaMask:",
      (error as any)?.message
    );
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.MetaMask,
      error: {
        code:
          (error as any)?.message ===
          `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
            ? 700002
            : 700003,
        message: (error as any)?.message,
      },
    });
  }
};
