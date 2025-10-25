import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@radix-ui/react-button";
import { Input } from "@radix-ui/react-input";

export default function RevenueSplitDialog({ open, onOpenChange, creators, editShares, setEditShares, setCreators, walletAddress, dao }) {
  function saveRevenueSplit() {
    const total = editShares.reduce((s, e) => {
      const share = parseFloat(e.share);
      return isNaN(share) ? s : s + share;
    }, 0);
    const normalized = editShares.map(e => {
      const share = parseFloat(e.share);
      return { ...e, share: total > 0 && !isNaN(share) ? Number((share / total).toFixed(4)) : 0 };
    });
    const change = { type: "revenueSplit", newCreators: normalized.map(n => ({ id: n.id, share: n.share })) };
    dao.submitChange(change, walletAddress);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Adjust Revenue Split</DialogTitle>
          <DialogDescription className="text-sm text-white/70">
            Set how payouts should be shared. Requires vote and approval.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {editShares.map(es => (
            <div key={es.id} className="flex items-center justify-between gap-3">
              <div className="w-2/3">
                <div className="font-medium">{creators.find(c => c.id === es.id)?.name}</div>
                <div className="text-xs text-white/60">{creators.find(c => c.id === es.id)?.role}</div>
              </div>
              <Input
                value={es.share}
                onChange={(e) => setEditShares(prev => prev.map(p => p.id === es.id ? { ...p, share: e.target.value } : p))}
                className="w-1/3 bg-white/10 text-white p-2 rounded"
                type="number"
                step="0.01"
                disabled={!walletAddress || !authorizedCollaborators.includes(walletAddress)}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-transparent border border-white/20 text-white px-4 py-2 rounded hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={saveRevenueSplit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={!walletAddress || !authorizedCollaborators.includes(walletAddress)}
            >
              Submit for Vote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}