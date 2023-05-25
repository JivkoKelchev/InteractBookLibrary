import run from "./run"
import readline from "readline";
import {ethers} from "ethers";
const compiledContractInterface = require('./artifacts/Library.json')

async function interact() {
    type promptCallback = (answer: string) => void;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = (query : string) => new Promise((resolve : promptCallback) => rl.question(query,  resolve));
    let networkUrl: string = "";
    let contractAddress: string = "";
    let walletPk: string = "";
    let validUrl: boolean = false;
    let validContractAddress: boolean = false;
    let validWalletPk: boolean = false;

    //validate url
    while(!validUrl) {
        networkUrl = await prompt("Enter network url: ");
        if(networkUrl.startsWith("http://")) {
            validUrl = true;
        } else {
            console.log("Bad url!")
        }
    }   
    //validate contract address
    while (!validContractAddress) {
        contractAddress = (await prompt("Enter contract address: ") || "");
        if(validateInputAddresses(contractAddress)) {
            validContractAddress = true;
        }else{
            console.log("Bad address format!")
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

function validateInputAddresses(address: string) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}

function validateInputPK(pk: string) {
    return (/^(0x){1}[0-9a-fA-F]{64}$/i.test(pk));
}

interact().catch((error) => {
    console.error(error);
    process.exit(1);
})
