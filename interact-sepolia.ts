import run from "./run"
import {ethers} from "ethers";
const compiledContractInterface = require('./artifacts/Library.json')
// @ts-ignore
import MetaMaskSDK from '@metamask/sdk';

async function interact() {
    const MMSDK = new MetaMaskSDK({dappMetadata : {name: "My Dapp"}});
    const ethereum = MMSDK.getProvider();
    await ethereum.request({ method: 'eth_requestAccounts', params: [] });

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    
    let contractAddress: string = "0xf071786c9Ab0585d64b0E53d7d027B3E30310324"; //contract on sepolia
    const contract = new ethers.Contract(contractAddress, compiledContractInterface.abi, signer);
    
    await run(provider, contract, signer);
    process.exit(0);
}

interact().catch((error) => {
    console.error(error);
    process.exit(1);
})
