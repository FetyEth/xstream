// CDP AgentKit Settlement Agent for xStream
// Handles automated USDC payouts to creators from platform wallet

import { CdpClient } from "@coinbase/cdp-sdk";

const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export interface SettlementConfig {
  networkId: string; // "base-sepolia" or "base-mainnet"
  minThreshold: number; // Minimum amount to settle (e.g., 10 USDC)
}

class SettlementAgent {
  private cdpClient: CdpClient | null = null;
  private account: any = null; // CDP EVM Account
  private config: SettlementConfig;
  private initialized = false;

  constructor(config: SettlementConfig) {
    this.config = config;
  }

  /**
   * Initialize the CDP Client and create/load account
   * Requires CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET in env
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      // Check if all required environment variables are set
      if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
        throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET environment variables are required. Please add them to your .env file.");
      }
      
      // CDP_WALLET_SECRET is required for wallet operations - check if it's set
      if (!process.env.CDP_WALLET_SECRET) {
        throw new Error("CDP_WALLET_SECRET environment variable is required for wallet operations. Please add it to your .env file.");
      }

      // Initialize CDP Client (reads from environment variables)
      this.cdpClient = new CdpClient();

      // Get or create an EVM account with a persistent name
      // This ensures we always use the same wallet instead of creating new ones
      this.account = await this.cdpClient.evm.getOrCreateAccount({
        name: "xstream-settlement-wallet"
      });

      this.initialized = true;
      console.log("Settlement Agent Wallet Address:", this.account.address);

      return true;
    } catch (error) {
      console.error("Failed to initialize settlement agent:", error);
      throw error;
    }
  }

  /**
   * Send USDC settlement to creator's wallet
   */
  async sendSettlement(
    creatorAddress: string,
    amountUsdc: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.cdpClient || !this.account) {
      throw new Error("Settlement agent not initialized");
    }

    try {
      // Convert USDC amount to smallest unit (6 decimals)
      // Example: 0.50 USDC = 500000 units
      const amountInUnits = BigInt(Math.floor(amountUsdc * 1_000_000));

      // Execute the USDC transfer using CDP SDK V2 transfer method
      const { transactionHash } = await this.account.transfer({
        to: creatorAddress,
        amount: amountInUnits,
        token: "usdc",
        network: this.config.networkId,
      });

      console.log(`Settlement sent to ${creatorAddress}: ${amountUsdc} USDC (tx: ${transactionHash})`);

      return {
        success: true,
        txHash: transactionHash,
      };
    } catch (error: any) {
      console.error("Settlement failed:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  /**
   * Check USDC and ETH balances
   */
  async getBalance(): Promise<{ usdc: string; eth: string }> {
    if (!this.cdpClient || !this.account) {
      throw new Error("Settlement agent not initialized");
    }

    try {
      // Use CDP client to list token balances
      const balancesResponse = await this.cdpClient.evm.listTokenBalances({
        address: this.account.address,
        network: this.config.networkId as any, // Cast to satisfy type
      });

      // Find ETH and USDC balances from the response
      const ethBalance = balancesResponse.balances.find(
        (b: any) => b.token.symbol.toLowerCase() === 'eth'
      );
      const usdcBalance = balancesResponse.balances.find(
        (b: any) => b.token.symbol.toLowerCase() === 'usdc'
      );

      // Convert from smallest units to readable format
      const ethAmount = ethBalance 
        ? (Number(ethBalance.amount.amount) / Math.pow(10, ethBalance.amount.decimals)).toFixed(4)
        : '0.0000';
      const usdcAmount = usdcBalance
        ? (Number(usdcBalance.amount.amount) / Math.pow(10, usdcBalance.amount.decimals)).toFixed(2)
        : '0.00';

      return {
        eth: ethAmount,
        usdc: usdcAmount,
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get wallet address
   */
  async getAddress(): Promise<string> {
    if (!this.account) {
      throw new Error("Settlement agent not initialized");
    }
    return this.account.address;
  }
}

// Singleton instance
let settlementAgent: SettlementAgent | null = null;

export async function getSettlementAgent(config?: SettlementConfig): Promise<SettlementAgent> {
  if (!settlementAgent) {
    settlementAgent = new SettlementAgent(
      config || {
        networkId: "base-sepolia",
        minThreshold: 10
      }
    );
    await settlementAgent.initialize();
  }
  return settlementAgent;
}

export { SettlementAgent };
