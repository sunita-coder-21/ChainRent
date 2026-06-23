import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { TransactionService } from '../services/transactionService';
import { WalletService } from '../services/walletService';
import { CardSkeleton } from '../components/FeedbackStates';
import { useToast } from '../context/ToastContext';

export const WalletPage: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, refreshWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      showToast('Address Copied', 'success', 'Stellar wallet address copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const claimFaucet = async () => {
    if (!wallet.connected) {
      showToast('Authentication Required', 'warning', 'Please connect your Stellar wallet first.');
      return;
    }
    
    setFaucetLoading(true);
    showToast('Requesting XLM', 'info', 'Contacting the Testnet Friendbot ledger...');
    
    try {
      const { hash } = await WalletService.fundAccount();
      
      // Add transaction
      TransactionService.addTransaction(
        'deposit_released',
        10000,
        'G_FAUCET_POOL_STELLAR_NETWORK',
        wallet.address || '',
        hash
      );
      
      await refreshWallet();
      setFaucetLoading(false);
      showToast(
        'Faucet Funded', 
        'success', 
        'Received 10,000 Testnet XLM from the Stellar Friendbot laboratory.'
      );
    } catch (err: any) {
      setFaucetLoading(false);
      showToast(
        'Funding Failed',
        'error',
        err.message || 'Failed to request testnet assets.'
      );
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface">Stellar Wallet Hub</h2>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
          Manage your connected Stellar account credentials and fund your wallets on Testnet.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <div>
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Wallet Connection Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant dark:border-outline pb-4">
                <h3 className="font-label-md text-label-md font-bold text-on-surface dark:text-on-surface">Account Credentials</h3>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                  wallet.connected ? 'bg-green-500 text-white' : 'bg-outline-variant text-on-surface-variant dark:bg-surface-container-high'
                }`}>
                  {wallet.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {wallet.connected ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Wallet Provider</p>
                      <p className="font-label-md text-label-md font-bold mt-1 text-on-surface dark:text-on-surface">{wallet.provider}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Stellar Network</p>
                      <p className="font-label-md text-label-md font-bold mt-1 text-on-surface dark:text-on-surface">{wallet.network}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Public Address (G...)</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        id="wallet-public-address"
                        type="text"
                        readOnly
                        value={wallet.address || ''}
                        className="w-full px-4 py-2 bg-surface dark:bg-surface-container-high border border-outline-variant dark:border-outline rounded-lg font-mono text-xs text-on-surface outline-none"
                        aria-label="Your wallet public address"
                      />
                      <button
                        onClick={handleCopy}
                        className="p-2 border border-outline-variant dark:border-outline hover:bg-surface-variant/50 rounded-lg text-on-surface transition-colors flex items-center focus:ring-2 focus:ring-primary outline-none"
                        title="Copy Address"
                        aria-label="Copy public address to clipboard"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {copied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant dark:border-outline flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-on-surface-variant">Spendable Balance</p>
                      <p className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed mt-1">{wallet.balance.toLocaleString()} XLM</p>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="border border-error text-error hover:bg-error-container/20 font-label-sm text-label-sm px-6 py-3 rounded-lg active:scale-95 transition-all focus:ring-2 focus:ring-error outline-none"
                      aria-label="Disconnect Stellar session"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <span className="material-symbols-outlined text-5xl text-outline-variant" aria-hidden="true">account_balance_wallet</span>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant">
                    Your wallet is currently disconnected. Please choose a provider to authenticate.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => connectWallet('Freighter')}
                      className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all focus:ring-2 focus:ring-primary outline-none"
                      aria-label="Connect Freighter wallet"
                    >
                      Freighter
                    </button>
                    <button
                      onClick={() => connectWallet('xBull')}
                      className="bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all focus:ring-2 focus:ring-secondary outline-none"
                      aria-label="Connect xBull wallet"
                    >
                      xBull
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Testnet Faucet / Laboratory Card */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface border-b border-outline-variant dark:border-outline pb-3">
                Developer Laboratory
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                Use this tool to simulate Stellar's official Friendbot laboratory. Request free test assets (XLM) to check platform contract locks and payment releases.
              </p>

              <button
                onClick={claimFaucet}
                disabled={faucetLoading || !wallet.connected}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3.5 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-primary outline-none"
                aria-label="Claim testnet assets from Friendbot faucet"
              >
                {faucetLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                    Contacting Friendbot ledger...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" aria-hidden="true">rocket_launch</span>
                    Claim 1,000 Testnet XLM
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
