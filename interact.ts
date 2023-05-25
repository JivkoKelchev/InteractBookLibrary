import { Contract, ethers } from "ethers";
import readline from "readline"

const compiledContractInterface = require('./artifacts/Library.json')

async function run() {
    let networkUrl: string;
    let contractAddress: string;
    let walletPk: string;

    type promptCallback = (answer: string) => void;
    
    //use prompt to get all needed params
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = (query : string) => new Promise((resolve : promptCallback) => rl.question(query,  resolve));

    networkUrl = (await prompt("Enter network url: ")) || "";
    contractAddress = (await prompt("Enter contract address: ") || "");
    walletPk = (await prompt("Enter wallet privet key: ")) || "";


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

    //print wallet info
    printSeparator();
    const balance = await provider.getBalance(wallet.address);
    const roundedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);
    console.log(`Connected : ${wallet.address}`);
    console.log(`Balance   : ${roundedBalance} ETH`);

    //print total books info
    printSeparator();
    let booksCount: BigInt = await contract.booksCount();
    //add books for interaction
    if (booksCount == BigInt(0)) {
        const addBookTx1 = await contract.addBook("test book 1", "test author", 1);
        await addBookTx1.wait();
        const addBookTx2 = await contract.addBook("test book 2", "test author", 2);
        await addBookTx2.wait();
    }
    
    //print available books
    console.log(`Total books count in library is : ${booksCount.toString()}`);
    printSeparator();
    let availableBooks: string[] = await showAvailableBooks(contract);
    
    // borrow book
    printSeparator();
    console.log(`Borrow book with id : ${availableBooks[0]}`)
    let spinnerInterval: NodeJS.Timeout = startSpinner();
    const borrowBookTx = await contract.borrowBook(availableBooks[0]);
    await borrowBookTx.wait();
    stopSpinner(spinnerInterval);
    
    //print available books after borrow the firs one
    printSeparator();
    await showAvailableBooks(contract);
    
    //print users current books
    printSeparator();
    let currentBooks: string[] = await showUserCurrentBooks(contract, wallet.address);
    
    //return book
    printSeparator()
    console.log(`Return book with id : ${currentBooks[0]}`);
    spinnerInterval = startSpinner();
    const returnBookTx = await contract.returnBook(currentBooks[0]);
    await returnBookTx.wait();
    stopSpinner(spinnerInterval);

    //print available books after return
    printSeparator();
    await showAvailableBooks(contract);
    printSeparator();

    rl.close();
    rl.on('close', () => process.exit(0));
}

function printSeparator() {
    console.log('------------------------------------------------------------------------')
}

async function showAvailableBooks(contract: Contract) {
    let availableBookIds: string[] = await contract.showAvailableBooks();
    console.log(`Available books are : `);
    await Promise.all(availableBookIds.map(async (bookId) => {
        await printBook(contract, bookId);
    }));
    return availableBookIds;
}

async function showUserCurrentBooks(contract: Contract, userAddress: string) {
    console.log(`Current books for user with address ${userAddress} are :`);
    let currentBooksIds: string[] = await contract.showUserCurrentBooks(userAddress);
    await Promise.all(currentBooksIds.map(async (bookId) => {
        await printBook(contract, bookId);
    }));
    return currentBooksIds;
}

async function printBook(contract: Contract, bookId: string) {
    let book: any[] = await contract.books(bookId);
    console.log(
        `  BookId    : ${bookId} \n  Title     : ${book[0]} \n  Author    : ${book[1]} \n  Available : ${book[2]} copies\n`
    );
}

// Function to start the spinner animation
function startSpinner(): NodeJS.Timeout {
    const spinnerChars = ['|', '/', '-', '\\'];
    let i = 0;

    return setInterval(() => {
        process.stdout.write(`\r${spinnerChars[i]} Processing transaction ...`);
        i = (i + 1) % spinnerChars.length;
    }, 100);
}

// Function to stop the spinner animation
function stopSpinner(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    process.stdout.write('\rDone!                           \n'); // Clear the spinner line
}

console.log('Arguments:', process.argv.slice(2));
run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});