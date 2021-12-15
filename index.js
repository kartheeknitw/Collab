const Web3 = require("web3");
require('dotenv').config()

// ALCHEMY API: Currently provider is kovan testnet, change it to mainnet.
let network = "https://eth-kovan.alchemyapi.io/v2/VwjmlTmdVJC-Mr9gtuwuuPtrQOXi7VC_";
// Private key of faucet account.
let faucetPrivateKey = process.env.PRIVATE_KEY;
let web3, tempAccount, faucetAccount;

async function setupTempAccount() {
    try {
        web3 = new Web3(new Web3.providers.HttpProvider(network));
        tempAccount = web3.eth.accounts.create();
        console.log(tempAccount);
        console.log(await web3.eth.getBalance(tempAccount.address));
    } catch (e) {
        console.log("Connection error!", e);
    }
}

async function setupFaucetAccount() {
    faucetAccount = web3.eth.accounts.privateKeyToAccount(faucetPrivateKey);
    console.log(await web3.eth.getBalance(faucetAccount.address));
}

async function fundTempAccount() {
    const createTransaction = await web3.eth.accounts.signTransaction({ from: faucetAccount.address, to: tempAccount.address, value: web3.utils.toWei('0.0000000001', 'ether'), gas: '21000', }, faucetPrivateKey);
    const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    console.log(`Transaction successful with hash: ${createReceipt.transactionHash}`);
}

async function getBalances() {
    console.log(await web3.eth.getBalance(tempAccount.address));
    console.log(await web3.eth.getBalance(faucetAccount.address));
}

async function testCode() {
    try {
        await setupTempAccount();
        await setupFaucetAccount();
        await fundTempAccount();
        await getBalances();
    } catch (e) {
        console.log("Error occured!!", e);
    }
}

testCode();