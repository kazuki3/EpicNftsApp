import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'dokidoki_konbu';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xf7CDf131ADe33313C8CFF3609FC2dDE949099451";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    console.log("currentAccount: ", currentAccount);

    const checkIfWalletIsConected = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("Make sure you have MetaMask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("Connected to chain " + chainId);
        const rinkerbyChainId = "0x4";
        if (chainId !== rinkerbyChainId) {
            alert("You are not connected to the Rinkeby Test Network!");
            return;
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
            setupEventListener();
        } else {
            console.log("No authorized account found");
        }
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);

            setupEventListener();
        } catch (error) {
            console.log(error);
        }
    }

    const   setupEventListener = () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(
                  CONTRACT_ADDRESS,
                  myEpicNft.abi,
                  signer
                );
                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                  console.log(from, tokenId.toNumber());
                  alert(
                    `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
                  );
                });
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(
                  CONTRACT_ADDRESS,
                  myEpicNft.abi,
                  signer
                );
                console.log("Going to pop wallet now to pay gas...");
                let nftTxn = await connectedContract.makeAnEpicNFT();
                console.log("Mining...please wait.");
                await nftTxn.wait();
                console.log(
                    `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
                  );
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const renderNotConnectedContainer = () => (
        <button  onClick={ connectWallet } className="cta-button connect-wallet-button">
        Connect to Wallet
        </button>
    );

    useEffect(() => checkIfWalletIsConected(), []);

    return (
        <div className="App">
        <div className="container">
            <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
                あなただけの特別な NFT を Mint しよう💫
            </p>
            {currentAccount === "" ? (
                renderNotConnectedContainer()
            ) : (
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
                </button>
            )}
            </div>
            <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
                className="footer-text"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
            </div>
        </div>
        </div>
    );
};

export default App;
