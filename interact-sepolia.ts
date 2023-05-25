import run from "./interact"
import readline from "readline";
import {ethers} from "ethers";
const compiledContractInterface = require('./artifacts/Library.json')

async function interact() {
    type promptCallback = (answer: string) => void;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = (query : string) => new Promise((resolve : promptCallback) => rl.question(query,  resolve));
    let networkUrl: string = "";
    let infuraKey: string = "";
    let contractAddress: string = "0xf071786c9Ab0585d64b0E53d7d027B3E30310324";
    let walletPk: string = "";
    let validInfuraKey: boolean = false;
    let validWalletPk: boolean = false;

    //validate url
    while(!validInfuraKey) {
        infuraKey = await prompt("Enter Infura key: ");
        if(validateInputInfuraKey(infuraKey)) {
            validInfuraKey = true;
            networkUrl = `https://sepolia.infura.io/v3/${infuraKey}`;
        } else {
            console.log("Bad key!")
        }
    }

    //validate wallet pk
    while (!validWalletPk) {
        walletPk = (await prompt("Enter wallet privet key: ")) || "";
        if(validateInputPK(walletPk)){
            validWalletPk = true;
        }else{
            console.log("Bad private key format!");
        }
    }

    const provider = new ethers.JsonRpcProvider(networkUrl);
    const wallet = new ethers.Wallet(walletPk, provider);
    const contract = new ethers.Contract(contractAddress, compiledContractInterface.abi, wallet);

    if(!ethers.isAddress(contractAddress)) {
        console.log('Error: contractAddress is not valid.');
        process.exitCode = 1;
    }
    if(!ethers.isAddress(wallet.address)) {
        console.log('Error wallet address is not valid');
        process.exitCode = 1;
    }

    await run(provider, contract, wallet)

    rl.close();
    rl.on('close', () => process.exit(0));

}

interact().catch((error) => {
    console.error(error);
    process.exit(1);
})

function validateInputPK(pk: string) {
    return (/[0-9a-fA-F]{64}$/i.test(pk));
}

function validateInputInfuraKey(key: string)  {
    return (/[0-9a-fA-F]{32}$/i).test(key)
}
