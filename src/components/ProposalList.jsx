import React from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@radix-ui/react-card";
import { Button } from "@radix-ui/react-button";
import { Input } from "@radix-ui/react-input";

export default function ProposalList({ dao, walletConnected, newProposal, setNewProposal, walletAddress }) {
  function handleProposalSubmit(e) {
    e.preventDefault();
    if (!newProposal.title || isNaN(parseFloat(newProposal.amount))) return;
    dao.createProposal({ title: newProposal.title, description: newProposal.description, amount: parseFloat(newProposal.amount) }, walletAddress);
    setNewProposal({ title: "", description: "", amount: "" });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-1 md:col-span-2 bg-white/10 p-4 rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PieChart size={18} /> Governance
            </span>
            <span className="text-sm text-white/70">Participatory decision making — creator-first</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleProposalSubmit} className="space-y-2">
              <Input
                placeholder="Proposal title"
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/10 text-white p-2 rounded"
              />
              <Input
                placeholder="Short description"
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/10 text-white p-2 rounded"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Amount (USD)"
                  value={newProposal.amount}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-white/10 text-white p-2 rounded"
                />
                <Button
                  type="submit"
                  disabled={!walletConnected || !authorizedCollaborators.includes(walletAddress)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Create
                </Button>
              </div>
              <div className="text-xs text-white/60">Proposals require majority vote and approval.</div>
            </form>
            <div>
              <h4 className="font-semibold">Quick actions</h4>
              <div className="mt-2 flex gap-2">
                <Button
                  disabled={!walletConnected || !authorizedCollaborators.includes(walletAddress)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Snapshot Vote
                </Button>
              </div>
            </div>
          </div>
          {dao.proposals.map(pr => (
            <Card key={pr.id} className="bg-white/10 p-4 rounded-lg mt-4">
              <CardHeader>
                <CardTitle>{pr.title}</CardTitle>
                <CardDescription className="text-sm text-white/70">{pr.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">For: {pr.votesFor}</div>
                    <div className="text-sm">Against: {pr.votesAgainst}</div>
                    <div className="text-xs text-white/60">Status: {pr.status}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => dao.vote(pr.id, true, walletAddress)}
                      disabled={!walletConnected || !authorizedCollaborators.includes(walletAddress)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Vote For
                    </Button>
                    <Button
                      onClick={() => dao.vote(pr.id, false, walletAddress)}
                      disabled={!walletConnected || !authorizedCollaborators.includes(walletAddress)}
                      className="bg-transparent border border-white/20 text-white px-4 py-2 rounded hover:bg-white/10 disabled:opacity-50"
                    >
                      Vote Against
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {dao.pendingChanges.map(ch => (
            <Card key={ch.id} className="bg-white/10 p-4 rounded-lg mt-4">
              <CardContent>
                <div>Pending Change: {ch.type === "revenueSplit" ? "Revenue Split Update" : "Treasury Withdrawal: $" + ch.amount}</div>
                <div>Votes For: {ch.votesFor}, Against: {ch.votesAgainst}</div>
                <Button
                  onClick={() => dao.approveChange(ch.id, walletAddress)}
                  disabled={walletAddress !== "0xe8c8578E2889bB7bFB2869A0DBDA0c65D9f4F8A9" || ch.votesFor <= authorizedCollaborators.length / 2}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Approve
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}