import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_IDS, SorobanService } from '../services/sorobanService';
import { ContractAuditService } from '../services/contractAuditService';
import type { ContractAuditLog } from '../services/contractAuditService';
import { useToast } from '../context/ToastContext';
import { NetworkService } from '../services/networkService';

export const VerificationPage: React.FC = () => {
  const { wallet } = useWallet();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<ContractAuditLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'playground'>('status');

  // Playground simulation states
  const [simulatedContract, setSimulatedContract] = useState<'lease' | 'escrow' | 'reputation'>('lease');
  const [simulatedFunction, setSimulatedFunction] = useState('create_lease');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const updateLogs = () => {
      setLogs(ContractAuditService.getLogs());
    };
    updateLogs();
    const interval = setInterval(updateLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (id: string, label: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(label);
    showToast('Contract ID Copied', 'success', 'Smart contract address copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyTx = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    showToast('Tx Hash Copied', 'success', 'Transaction hash copied to clipboard.');
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleClearLogs = () => {
    ContractAuditService.clearLogs();
    setLogs([]);
    showToast('Audit Trails Cleared', 'info', 'Contract interaction log database re-initialized.');
  };

  const triggerSimulatedCall = async () => {
    setSimulating(true);
    showToast('Simulating Invocation', 'info', `Signing and invoking ${simulatedFunction}() on-chain...`);
    
    try {
      if (simulatedContract === 'lease') {
        if (simulatedFunction === 'create_lease') {
          await SorobanService.createLease(
            'prop_sim_' + Math.floor(Math.random() * 1000),
            wallet.address || 'G_TENANT_SIMULATOR_ACCOUNT',
            'G_LANDLORD_SIMULATOR_ACCOUNT',
            1200n,
            2400n,
            12
          );
        } else if (simulatedFunction === 'approve_lease') {
          await SorobanService.approveLease('lease_sim_123', 'G_LANDLORD_SIMULATOR_ACCOUNT');
        } else {
          await SorobanService.terminateLease('lease_sim_123');
        }
      } else if (simulatedContract === 'escrow') {
        if (simulatedFunction === 'lock_deposit') {
          await SorobanService.lockDeposit('lease_sim_123', wallet.address || 'G_TENANT_SIMULATOR_ACCOUNT', 2400n);
        } else if (simulatedFunction === 'release_deposit') {
          await SorobanService.releaseDeposit('lease_sim_123', 'G_LANDLORD_SIMULATOR_ACCOUNT', 2400n, ['sig_1', 'sig_2']);
        } else {
          await SorobanService.refundDeposit('lease_sim_123', wallet.address || 'G_TENANT_SIMULATOR_ACCOUNT', 2400n);
        }
      } else {
        await SorobanService.updateReputation(wallet.address || 'G_USER_SIMULATOR_ACCOUNT', 'tenant', true);
      }

      setLogs(ContractAuditService.getLogs());
      showToast('Execution Success', 'success', `Contract call successfully executed and audited.`);
    } catch (err: any) {
      showToast('Simulated Call Failed', 'error', err.message || 'Execution error.');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (simulatedContract === 'lease') {
      setSimulatedFunction('create_lease');
    } else if (simulatedContract === 'escrow') {
      setSimulatedFunction('lock_deposit');
    } else {
      setSimulatedFunction('update_score');
    }
  }, [simulatedContract]);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg text-left fade-in">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant dark:border-outline pb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            Reviewer Compliance Verification
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant mt-1">
            Audit proof page built for Stellar Level 3 compliance verification.
          </p>
        </div>

        <span className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-primary/20">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          NETWORK: {NetworkService.getNetworkName().toUpperCase()} (SDF)
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant dark:border-outline mb-8">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-6 py-3 font-label-md text-label-md font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-primary text-primary dark:text-primary-fixed'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          Deployment Status
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-label-md text-label-md font-bold transition-all border-b-2 flex items-center gap-2 relative ${
            activeTab === 'logs'
              ? 'border-primary text-primary dark:text-primary-fixed'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">terminal</span>
          Interaction Audit Logs
          {logs.length > 0 && (
            <span className="bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {logs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-6 py-3 font-label-md text-label-md font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'playground'
              ? 'border-primary text-primary dark:text-primary-fixed'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">play_circle</span>
          Invocation Playground
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contracts Status List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Soroban Deployments Audit</h3>
              
              <div className="space-y-4">
                {/* Lease */}
                <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-on-surface text-sm">Lease Contract</span>
                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">DEPLOYED & ACTIVE</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-mono text-xs text-on-surface-variant truncate max-w-[320px] sm:max-w-[480px]">
                      {CONTRACT_IDS.LEASE}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleCopy(CONTRACT_IDS.LEASE, 'lease')}
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="Copy Address"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === 'lease' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_IDS.LEASE}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="View on Stellar Expert"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Escrow */}
                <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-on-surface text-sm">Escrow Contract</span>
                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">DEPLOYED & ACTIVE</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-mono text-xs text-on-surface-variant truncate max-w-[320px] sm:max-w-[480px]">
                      {CONTRACT_IDS.ESCROW}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleCopy(CONTRACT_IDS.ESCROW, 'escrow')}
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="Copy Address"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === 'escrow' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_IDS.ESCROW}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="View on Stellar Expert"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reputation */}
                <div className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-on-surface text-sm">Reputation Contract</span>
                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">DEPLOYED & ACTIVE</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-mono text-xs text-on-surface-variant truncate max-w-[320px] sm:max-w-[480px]">
                      {CONTRACT_IDS.REPUTATION}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleCopy(CONTRACT_IDS.REPUTATION, 'rep')}
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="Copy Address"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedId === 'rep' ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <a
                        href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_IDS.REPUTATION}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 border border-outline-variant rounded text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center"
                        title="View on Stellar Expert"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Wallet Verification Card */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface border-b border-outline-variant dark:border-outline pb-3">Wallet Verification</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Connected:</span>
                  <span className={`font-bold ${wallet.connected ? 'text-green-500' : 'text-error'}`}>
                    {wallet.connected ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Provider:</span>
                  <span className="font-bold text-on-surface">{wallet.provider || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active Address:</span>
                  <span className="font-mono font-bold text-on-surface truncate max-w-[120px]" title={wallet.address || ''}>
                    {wallet.address || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ledger Balance:</span>
                  <span className="font-bold text-primary dark:text-primary-fixed">{wallet.balance.toLocaleString()} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Signing Capability:</span>
                  <span className={`font-bold ${wallet.connected ? 'text-green-500' : 'text-error'}`}>
                    {wallet.connected ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant dark:border-outline pb-4">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Soroban Execution Ledger</h3>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="bg-error-container/20 text-error border border-error/20 font-label-sm text-label-sm px-4 py-2 rounded-lg hover:bg-error-container/40 active:scale-95 transition-all outline-none"
              >
                Clear Audit History
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-outline-variant">history_toggle_off</span>
              <p className="text-on-surface-variant font-body-md text-body-md mt-2">No contract invocation audit logs captured yet.</p>
              <p className="text-xs text-on-surface-variant/80 mt-1">Sign a lease agreement, lock deposit, pay rent, or use the playground tab to execute calls.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-surface dark:bg-surface-container-high rounded-xl border border-outline-variant space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-outline-variant dark:border-outline pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">{log.contractName}</span>
                      <span className="font-mono text-primary dark:text-primary-fixed font-bold bg-primary/10 px-2 py-0.5 rounded">
                        {log.functionName}()
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        log.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                      <span className="text-on-surface-variant/70">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <p className="text-on-surface-variant uppercase font-bold text-[9px] tracking-wider font-sans">Contract ID</p>
                      <p className="text-on-surface truncate" title={log.contractId}>{log.contractId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-on-surface-variant uppercase font-bold text-[9px] tracking-wider font-sans">Transaction Hash</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface truncate max-w-[200px]" title={log.transactionHash}>{log.transactionHash}</span>
                        <button
                          onClick={() => handleCopyTx(log.id, log.transactionHash)}
                          className="hover:text-primary transition-colors focus:outline-none"
                          title="Copy Transaction Hash"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copiedTxId === log.id ? 'check' : 'content_copy'}
                          </span>
                        </button>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${log.transactionHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary transition-colors flex items-center"
                          title="Verify on Stellar Expert"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {log.params && (
                    <div className="bg-surface-container dark:bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40">
                      <p className="text-on-surface-variant uppercase font-bold text-[9px] tracking-wider font-sans mb-1.5">Invocation Parameters</p>
                      <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all text-on-surface">
                        {JSON.stringify(log.params, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'playground' && (
        <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant dark:border-outline p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface border-b border-outline-variant dark:border-outline pb-4">
            Interactive Invocation Simulator
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Test smart contract interfaces directly. Choose a contract and a function signature, then click execute to sign, transmit, and record the audited operation instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface block mb-2" htmlFor="target-contract-select">
                  Select Contract
                </label>
                <select
                  id="target-contract-select"
                  value={simulatedContract}
                  onChange={(e) => setSimulatedContract(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  <option value="lease">Lease Contract</option>
                  <option value="escrow">Escrow Contract</option>
                  <option value="reputation">Reputation Contract</option>
                </select>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-bold text-on-surface dark:text-on-surface block mb-2" htmlFor="target-function-select">
                  Function Signature
                </label>
                <select
                  id="target-function-select"
                  value={simulatedFunction}
                  onChange={(e) => setSimulatedFunction(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface dark:bg-surface-container-high border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md text-on-surface"
                >
                  {simulatedContract === 'lease' && (
                    <>
                      <option value="create_lease">create_lease(property_id, tenant, landlord, rent, deposit, duration)</option>
                      <option value="approve_lease">approve_lease(lease_id, landlord)</option>
                      <option value="terminate_lease">terminate_lease(lease_id)</option>
                    </>
                  )}
                  {simulatedContract === 'escrow' && (
                    <>
                      <option value="lock_deposit">lock_deposit(lease_id, tenant, amount)</option>
                      <option value="release_deposit">release_deposit(lease_id, recipient, amount, signatures)</option>
                      <option value="refund_deposit">refund_deposit(lease_id, tenant, amount)</option>
                    </>
                  )}
                  {simulatedContract === 'reputation' && (
                    <>
                      <option value="update_score">update_score(address, role, success)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="bg-surface dark:bg-surface-container-high border border-outline-variant p-5 rounded-xl flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <p className="font-bold text-on-surface">Verification Preview</p>
                <div className="space-y-1 mt-2 text-on-surface-variant font-mono">
                  <div className="flex justify-between">
                    <span>Invoke ID:</span>
                    <span className="truncate max-w-[150px] font-bold text-primary dark:text-primary-fixed">
                      {simulatedContract === 'lease' ? CONTRACT_IDS.LEASE : simulatedContract === 'escrow' ? CONTRACT_IDS.ESCROW : CONTRACT_IDS.REPUTATION}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signer:</span>
                    <span className="truncate max-w-[150px]">
                      {wallet.address || 'G_SIMULATOR_ACCOUNT'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>Testnet</span>
                  </div>
                </div>
              </div>

              <button
                onClick={triggerSimulatedCall}
                disabled={simulating}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Executing call...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">bolt</span>
                    Invoke Contract Function
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
