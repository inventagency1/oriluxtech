/**
 * Forta Agent for Veralix Contract Monitoring
 * Detects suspicious approval patterns and unauthorized transfers
 */

import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

// Veralix contract addresses to monitor
const VERALIX_CONTRACTS = [
  "0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423", // BSC VeralixMasterRegistry
  "0xf23507FD4EE6188B6e0D1b94Fb48f59F3E77e3bB", // CrestChain Veralix
];

// TCT Token (if applicable)
const TCT_CONTRACT = "0x2D8931C368fE34D3d039Ab454aFc131342A339B5";

// Dangerous function signatures
const DANGEROUS_SIGS = {
  approve: "0x095ea7b3",
  setApprovalForAll: "0xa22cb465",
  transferFrom: "0x23b872dd",
  permit: "0xd505accf",
};

// Known malicious addresses (add as discovered)
const BLACKLISTED_ADDRESSES: string[] = [
  // Add 0xb2c0D9c6...2AeF when confirmed
];

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // Check for interactions with Veralix contracts
  const isVeralixTx = VERALIX_CONTRACTS.some(
    (addr) => txEvent.to?.toLowerCase() === addr.toLowerCase()
  );

  // Detect unlimited approvals
  if (txEvent.filterFunction(DANGEROUS_SIGS.approve).length > 0) {
    const approveCalls = txEvent.filterFunction(DANGEROUS_SIGS.approve);
    
    for (const call of approveCalls) {
      const amount = call.args.amount || call.args[1];
      
      // Check for unlimited approval (MaxUint256)
      if (amount && amount.toString() === "115792089237316195423570985008687907853269984665640564039457584007913129639935") {
        findings.push(
          Finding.fromObject({
            name: "Unlimited Token Approval",
            description: `Unlimited approval detected for spender ${call.args.spender || call.args[0]}`,
            alertId: "VERALIX-UNLIMITED-APPROVAL",
            severity: FindingSeverity.High,
            type: FindingType.Suspicious,
            metadata: {
              spender: call.args.spender || call.args[0],
              token: txEvent.to || "",
              txHash: txEvent.hash,
            },
          })
        );
      }
    }
  }

  // Detect setApprovalForAll
  if (txEvent.filterFunction(DANGEROUS_SIGS.setApprovalForAll).length > 0) {
    findings.push(
      Finding.fromObject({
        name: "NFT Approval For All",
        description: "setApprovalForAll called - potential NFT drain risk",
        alertId: "VERALIX-APPROVAL-FOR-ALL",
        severity: FindingSeverity.High,
        type: FindingType.Suspicious,
        metadata: {
          contract: txEvent.to || "",
          txHash: txEvent.hash,
        },
      })
    );
  }

  // Detect transfers to blacklisted addresses
  if (txEvent.to && BLACKLISTED_ADDRESSES.includes(txEvent.to.toLowerCase())) {
    findings.push(
      Finding.fromObject({
        name: "Transfer to Blacklisted Address",
        description: `Transaction to known malicious address: ${txEvent.to}`,
        alertId: "VERALIX-BLACKLIST-TRANSFER",
        severity: FindingSeverity.Critical,
        type: FindingType.Exploit,
        metadata: {
          to: txEvent.to,
          from: txEvent.from,
          txHash: txEvent.hash,
        },
      })
    );
  }

  // Monitor large value transfers from Veralix system wallet
  const SYSTEM_WALLET = process.env.VERALIX_SYSTEM_WALLET;
  if (SYSTEM_WALLET && txEvent.from.toLowerCase() === SYSTEM_WALLET.toLowerCase()) {
    const value = BigInt(txEvent.transaction.value);
    const threshold = BigInt("100000000000000000"); // 0.1 BNB
    
    if (value > threshold) {
      findings.push(
        Finding.fromObject({
          name: "Large Transfer from System Wallet",
          description: `Large value transfer from Veralix system wallet`,
          alertId: "VERALIX-LARGE-SYSTEM-TRANSFER",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            value: value.toString(),
            to: txEvent.to || "",
            txHash: txEvent.hash,
          },
        })
      );
    }
  }

  return findings;
};

export default {
  handleTransaction,
};
