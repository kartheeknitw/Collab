const Web3 = require("web3");
const abi = require('./consts/abi.json');
const ethers = require("ethers");
const bech32 = require("bech32");

require('dotenv').config()

// Globals.
let network = process.env.HARMONY_MAINNET_API;
let corporatePrivateKey = process.env.CORPORATE_PRIVATE_KEY;
let terraAddress = process.env.TERRA_WALLET_ADDRESS;
let newAccount, corporateAccount;
let web3 = new Web3(new Web3.providers.HttpProvider(network));
let gasFunding = web3.utils.toWei('0.01', 'ether'); /* Update according to platform */
let ustToken = process.env.HARMONY_UST_CONTRACT;
let bridgeAmount = web3.utils.toWei('1', 'ether');

// Create new user account.
async function createNewAccount() {
    try {
        newAccount = web3.eth.accounts.create();
        console.log(newAccount);
    } catch (e) {
        console.log("Connection error!!", e);
    }
}

// Setup corporate account for gas funding.
async function setupCorporateAccount() {
    corporateAccount = web3.eth.accounts.privateKeyToAccount(corporatePrivateKey);
    console.log(await web3.eth.getBalance(corporateAccount.address));
}

// Fund the user new account with gas amount.
async function fundAccount(fromAccount, toAccount, txAmount) {
    try {
        const createTransaction = await web3.eth.accounts.signTransaction({ from: fromAccount.address, to: toAccount.address, value: txAmount, gas: '21000' }, fromAccount.privateKey);
        const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
        console.log(`Transaction successful with hash: ${createReceipt.transactionHash}`);
    } catch (e) {
        console.log("Funding error!!", e);
    }
}

// Get balance of platform coin like ether or one.
async function getBalance(account) {
    console.log(await web3.eth.getBalance(account.address));
}

// Test terra shuttle bridge ETH/HMY => TERRA.
async function testBridge(userAccount, sendAmount, toAddress) {
    try {
        let provider = new ethers.providers.JsonRpcProvider(network);
        let signer = new ethers.Wallet(userAccount.privateKey, provider);
        let contract = new ethers.Contract(ustToken, abi, provider);
        let withSigner = contract.connect(signer);

        let balance = await contract.balanceOf(userAccount.address);
        console.log("Balance of user: " + userAccount.address + " balance: " + balance.toString());

        const { words } = bech32.decode(toAddress);
        const data = bech32.fromWords(words);
        let decoded = '0x' + Buffer.from(data).toString('hex');

        const hash = await withSigner.burn(sendAmount, decoded.padEnd(66, '0'), { gasPrice: ethers.utils.parseUnits('100', 'gwei'), gasLimit: 1000000 });
        console.log(hash);
    } catch (e) {
        console.log(e);
    }
}

// Test code.
async function testCode() {
    try {
        // await createNewAccount();
        await setupCorporateAccount();
        // await fundAccount(corporateAccount, newAccount, gasFunding);
        // await getBalance(corporateAccount);
        await getBalance(corporateAccount);
        await testBridge(corporateAccount, bridgeAmount, terraAddress);
    } catch (e) {
        console.log("Error occured!!", e);
    }
}

testCode();