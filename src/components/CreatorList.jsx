import React from "react";
import { Users, PlusCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@radix-ui/react-card";
import { Button } from "@radix-ui/react-button";

export default function CreatorList({ creators, formatPercent, setRevenueSplitOpen, setEditShares, walletAddress, dao }) {
  const totalShare = creators.reduce((s, c) => s + c.share, 0);

  function openRevenueModal() {
    setEditShares(creators.map(c => ({ id: c.id, share: c.share })));
    setRevenueSplitOpen(true);
  }

  const requestPayout = () => {
    if (walletAddress) {
      const creator = creators.find(c => c.wallet === walletAddress);
      if (creator) {
        const amount = dao.treasury * creator.share;
        dao.submitChange({ type: "treasuryWithdraw", amount, creatorId: creator.id }, walletAddress);
      }
    }
  };

  return (
    <>
      <Card className="bg-white/10 p-4 rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users size={18} /> Creators
            </span>
            <Button
              size="sm"
              onClick={openRevenueModal}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={!walletAddress || !authorizedCollaborators.includes(walletAddress)}
            >
              <PlusCircle size={14} /> Edit Split
            </Button>
          </CardTitle>
          <CardDescription className="text-sm text-white/70">
            Current revenue split among creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {creators.map(c => (
              <li key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-white/60">{c.role}</div>
                </div>
                <div className="text-sm font-semibold">{formatPercent(c.share)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-white/70">Total: {formatPercent(totalShare)}</div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 p-4 rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={18} /> Treasury
          </CardTitle>
          <CardDescription className="text-sm text-white/70">Available funds for proposals & payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold">${dao.treasury.toFixed(2)}</div>
              <div className="text-xs text-white/60">Founder’s 5% Share: ${(dao.treasury * 0.05).toFixed(2)}</div>
            </div>
            <div>
              <Button
                onClick={requestPayout}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!walletAddress || !creators.some(c => c.wallet === walletAddress)}
              >
                Request Payout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}