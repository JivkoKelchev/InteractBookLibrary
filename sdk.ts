import {Contract, ethers, Provider, Signer} from "ethers";

export class Sdk{
    provider : Provider;
    contract: Contract;
    signer: Signer;

    constructor(provider : Provider, contract: Contract, signer: Signer) {
        this.provider = provider;
        this.contract = contract;
        this.signer = signer;
    }

    async getSignerAddress() {
        return await this.signer.getAddress();
    }

    async getBalance(userAddress: string) {
        let balance = await this.provider.getBalance(userAddress);
        return parseFloat(ethers.formatEther(balance)).toFixed(4); 
    }
    
    async getBooksCount() {
        return await this.contract.booksCount();
    }
    
    async addBook(title: string, author: string, count: number) {
        const addBookTx1 = await this.contract.addBook(title, author, count);
        await addBookTx1.wait();
    }
    
    async showAvailableBooks() {
        return await this.contract.showAvailableBooks();
    }
    
    async books(bookId: string) {
        return await this.contract.books(bookId);
    }
    
    async showCurrentBooks(userAddress: string) {
        return await this.contract.showUserCurrentBooks(userAddress);
    }
    
    async borrowBook(bookId: string) {
        const borrowBookTx = await this.contract.borrowBook(bookId);
        await borrowBookTx.wait();
    }
    
    async returnBook(bookId: string) {
        const returnBookTx = await this.contract.returnBook(bookId);
        await returnBookTx.wait();
    }
} 
