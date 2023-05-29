import {Contract, Provider, Signer} from "ethers";
import {Sdk} from "./sdk";

export default async function run(provider : Provider, contract: Contract, signer: Signer) {
    const sdk = new Sdk(provider, contract, signer);
    const signerAddress = await sdk.getSignerAddress();
    const balance = await sdk.getBalance(signerAddress);
    //print wallet info
    printSeparator();
    console.log(`Connected : ${signerAddress}`);
    console.log(`Balance   : ${balance} ETH`);

    //print total books info
    printSeparator();
    let booksCount: BigInt = await sdk.getBooksCount();
    //add books for interaction
    if (booksCount == BigInt(0)) {
        await sdk.addBook("test book 1", "test author", 1);
        await sdk.addBook("test book 2", "test author", 2)
    }
    booksCount = await sdk.getBooksCount();
    
    //print available books
    console.log(`Total books count in library is : ${booksCount.toString()}`);
    printSeparator();
    let availableBooks: string[] = await showAvailableBooks(sdk);
    
    // borrow book
    printSeparator();
    console.log(`Borrow book with id : ${availableBooks[0]}`)
    let spinnerInterval: NodeJS.Timeout = startSpinner();
    await sdk.borrowBook(availableBooks[0]);
    stopSpinner(spinnerInterval);
    
    //print available books after borrow the firs one
    printSeparator();
    await showAvailableBooks(sdk);
    
    //print users current books
    printSeparator();
    let currentBooks: string[] = await showUserCurrentBooks(sdk, signerAddress);
    
    //return book
    printSeparator()
    console.log(`Return book with id : ${currentBooks[0]}`);
    spinnerInterval = startSpinner();
    await sdk.returnBook(currentBooks[0]);
    stopSpinner(spinnerInterval);

    //print available books after return
    printSeparator();
    await showAvailableBooks(sdk);
    printSeparator();
}

function printSeparator() {
    console.log('------------------------------------------------------------------------')
}

async function showAvailableBooks(sdk: Sdk) {
    let availableBookIds: string[] = await sdk.showAvailableBooks();
    console.log(`Available books are : `);
    await Promise.all(availableBookIds.map(async (bookId) => {
        await printBook(sdk, bookId);
    }));
    return availableBookIds;
}

async function showUserCurrentBooks(sdk: Sdk, userAddress: string) {
    console.log(`Current books for user with address ${userAddress} are :`);
    let currentBooksIds: string[] = await sdk.showCurrentBooks(userAddress);
    await Promise.all(currentBooksIds.map(async (bookId) => {
        await printBook(sdk, bookId);
    }));
    return currentBooksIds;
}

async function printBook(sdk: Sdk, bookId: string) {
    let book: any[] = await sdk.books(bookId);
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