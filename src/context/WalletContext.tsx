import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Wallet } from '../types';
import { WalletService } from '../services/walletService';
import { useToast } from './ToastContext';

interface WalletContextType {
  wallet: Wallet;
  connectWallet: (provider: 'Freighter' | 'xBull' | 'Albedo') => Promise<void>;
  disconnectWallet: () => void;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet>(() => WalletService.getWallet());
  const { showToast } = useToast();

  const connectWallet = async (provider: 'Freighter' | 'xBull' | 'Albedo') => {
    try {
      showToast('Connecting Wallet', 'info', `Authenticating with ${provider}...`);
      const updated = await WalletService.connect(provider);
      setWallet({ ...updated });
      showToast(
        'Wallet Connected', 
        'success', 
        `Authenticated with ${provider} on Stellar ${updated.network}.`
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        'Connection Failed', 
        'error', 
        err.message || `Failed to connect with ${provider}.`
      );
    }
  };

  const disconnectWallet = () => {
    const updated = WalletService.disconnect();
    setWallet({ ...updated });
    showToast(
      'Wallet Disconnected', 
      'info', 
      'Stellar session terminated successfully.'
    );
  };

  const refreshWallet = async () => {
    try {
      const current = await WalletService.refreshBalance();
      setWallet({ ...current });
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      refreshWallet();
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const current = WalletService.getWallet();
      setWallet({ ...current });
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
