import run from "./run"
import readline from "readline";
import {ethers} from "ethers";
const compiledContractInterface = require('./artifacts/Library.json')

async function interact() {
    type promptCallback = (answer: string) => void;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = (query : string) => new Promise((resolve : promptCallback) => rl.question(query,  resolve));
   
    let contractAddress: string = "";
    let accountAddress: string = "";
    let validContractAddress: boolean = false;
    let validAccountAddress: boolean = false;
    
    //validate contract address
    while (!validContractAddress) {
        contractAddress = (await prompt("Enter contract address: ") || "");
        if(ethers.isAddress(contractAddress)) {
            validContractAddress = true;
        }else{
            console.log("Bad address format!")
        }
    }
    //validate account address
    while (!validAccountAddress) {
        accountAddress = (await prompt("Enter wallet privet key: ")) || "";
        if(ethers.isAddress(accountAddress)){
            validAccountAddress = true;
        }else{
            console.log("Bad private key format!");
        }
    }

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer = await provider.getSigner(accountAddress);
    const contract = new ethers.Contract(contractAddress, compiledContractInterface.abi, signer);
    
    //run main script
    await run(provider, contract, signer)

    rl.on('close', () => process.exit(0));
    rl.close();
    
}

interact().catch((error) => {
    console.error(error);
    process.exit(1);
})
