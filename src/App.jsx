import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet } from "lucide-react";
import CreatorList from "./components/CreatorList";
import ProposalList from "./components/ProposalList";
import RevenueSplitDialog from "./components/RevenueSplitDialog";
import ErrorBoundary from "./components/ErrorBoundary";

const initialCreators = [
  { id: 1, name: "Aster Moon", role: "Tarot Artist", share: 0.25, wallet: "0xAsterMoonAddr" },
  { id: 2, name: "Kai Lux", role: "Content Creator", share: 0.35, wallet: "0xKaiLuxAddr" },
  { id: 3, name: "Rowan Vale", role: "Curator", share: 0.15, wallet: "0xRowanValeAddr" },
  { id: 4, name: "Carley B.", role: "Founder", share: 0.05, wallet: "0xe8c8578E2889bB7bFB2869A0DBDA0c65D9f4F8A9" }
];

const authorizedCollaborators = [
  "0xAsterMoonAddr",
  "0xKaiLuxAddr",
  "0xRowanValeAddr",
  "0xe8c8578E2889bB7bFB2869A0DBDA0c65D9f4F8A9"
];

function formatPercent(n) {
  return `${Math.round(n * 100)}%`;
}

function useMockDAO() {
  const [proposals, setProposals] = useState([]);
  const [treasury, setTreasury] = useState(24580); // Initial treasury in USD
  const [pendingChanges, setPendingChanges] = useState([]);
  useEffect(() => {
    setProposals([
      { id: 1, title: "Add new Tarot drop", description: "Funding for 300 limited decks", votesFor: 0, votesAgainst: 0, status: "pending", proposer: null },
      { id: 2, title: "Platform marketing", description: "Paid ads for launch", votesFor: 0, votesAgainst: 0, status: "pending", proposer: null }
    ]);
  }, []);

  const createProposal = (proposal, wallet) => {
    setProposals(prev => [{ ...proposal, id: Date.now(), votesFor: 0, votesAgainst: 0, status: "pending", proposer: wallet }, ...prev]);
  };

  const vote = (id, forIt, wallet) => {
    if (!authorizedCollaborators.includes(wallet)) return;
    setProposals(prev => prev.map(pr => 
      pr.id === id ? { ...pr, votesFor: forIt ? pr.votesFor + 1 : pr.votesFor, votesAgainst: !forIt ? pr.votesAgainst + 1 : pr.votesAgainst } : pr
    ));
  };

  const submitChange = (change, wallet) => {
    if (authorizedCollaborators.includes(wallet)) {
      setPendingChanges(prev => [...prev, { ...change, id: Date.now(), proposer: wallet, votesFor: 0, votesAgainst: 0 }]);
    }
  };

  const approveChange = (id, walletAddress) => {
    const change = pendingChanges.find(c => c.id === id);
    if (change && change.votesFor > authorizedCollaborators.length / 2) {
      if (walletAddress === "0xe8c8578E2889bB7bFB2869A0DBDA0c65D9f4F8A9") {
        setPendingChanges(prev => prev.filter(c => c.id !== id));
        if (change.type === "revenueSplit") setCreators(change.newCreators);
        if (change.type === "treasuryWithdraw") setTreasury(prev => prev - change.amount);
      }
    }
  };

  return { proposals, createProposal, vote, treasury, submitChange, approveChange, pendingChanges };
}

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [creators, setCreators] = useState(initialCreators);
  const [revenueSplitOpen, setRevenueSplitOpen] = useState(false);
  const [editShares, setEditShares] = useState(creators.map(c => ({ id: c.id, share: c.share })));
  const [newProposal, setNewProposal] = useState({ title: "", description: "", amount: "" });
  const dao = useMockDAO();

  async function toggleWallet() {
    if (isConnecting) return;
    if (!walletConnected) {
      setIsConnecting(true);
      setError(null);
      try {
        if (typeof window.ethereum !== "undefined") {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletConnected(true);
          setWalletAddress(address);
        } else {
          setError("Please install MetaMask or another Web3 wallet!");
        }
      } catch (err) {
        console.error("Wallet connection error:", err);
        setError("Failed to connect wallet. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    } else {
      setWalletConnected(false);
      setWalletAddress(null);
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress(null);
        } else {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  const truncatedAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : null;
  const yourShare = dao.treasury * 0.05;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-900 to-amber-900 text-slate-50 p-6 font-sans">
        <header className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">🔮</div>
            <div>
              <h1 className="text-xl font-semibold">
                DAO <span className="text-amber-300">SECRETORIUM</span>
              </h1>
              <p className="text-sm text-white/70">Creator-owned, luxury occult & adult creator DAO</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              onClick={toggleWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              aria-label={walletConnected ? `Connected wallet: ${truncatedAddress}` : "Connect Wallet"}
            >
              <Wallet size={16} />
              {isConnecting ? "Connecting..." : walletConnected ? truncatedAddress : "Connect Wallet"}
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 space-y-4">
            <CreatorList
              creators={creators}
              formatPercent={formatPercent}
              setRevenueSplitOpen={setRevenueSplitOpen}
              setEditShares={setEditShares}
              walletAddress={walletAddress}
              dao={dao}
            />
          </section>
          <section className="lg:col-span-2 space-y-4">
            <ProposalList
              dao={dao}
              walletConnected={walletConnected}
              newProposal={newProposal}
              setNewProposal={setNewProposal}
              walletAddress={walletAddress}
            />
          </section>
        </main>

        <RevenueSplitDialog
          open={revenueSplitOpen}
          onOpenChange={setRevenueSplitOpen}
          creators={creators}
          editShares={editShares}
          setEditShares={setEditShares}
          setCreators={setCreators}
          walletAddress={walletAddress}
          dao={dao}
        />

        <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-white/60">
          Built with ♥ for creators • DAO SECRETORIUM • Integrated with MetaMask via ethers.js • 5% Treasury Share: ${yourShare.toFixed(2)}
        </footer>
      </div>
    </ErrorBoundary>
  );
}