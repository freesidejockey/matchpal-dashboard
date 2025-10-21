"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { createSessionColumns } from "@/components/tables/SessionColumns";
import { createRevisionColumns } from "@/components/tables/RevisionColumns";
import { SessionWithDetails, RevisionWithDetails } from "@/types";
import { getSessions } from "@/actions/sessions";
import { getRevisions } from "@/actions/revisions";
import { getRevisionPayoutRate, updateRevisionPayoutRate } from "@/actions/config";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export default function AdminFinancesPage() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [revisions, setRevisions] = useState<RevisionWithDetails[]>([]);
  const [payoutRate, setPayoutRate] = useState<number>(50);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [editedRate, setEditedRate] = useState<string>("50");
  const [loading, setLoading] = useState(true);
  const [savingRate, setSavingRate] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load sessions
    const sessionsResult = await getSessions();
    if (sessionsResult.success && sessionsResult.data) {
      setSessions(sessionsResult.data);
    }

    // Load revisions
    const revisionsResult = await getRevisions();
    if (revisionsResult.success && revisionsResult.data) {
      setRevisions(revisionsResult.data);
    }

    // Load payout rate
    const rateResult = await getRevisionPayoutRate();
    if (rateResult.success && rateResult.data !== undefined) {
      setPayoutRate(rateResult.data);
      setEditedRate(rateResult.data.toString());
    }

    setLoading(false);
  };

  const handleSaveRate = async () => {
    const newRate = parseFloat(editedRate);
    if (isNaN(newRate) || newRate < 0) {
      alert("Please enter a valid non-negative number");
      return;
    }

    setSavingRate(true);
    const result = await updateRevisionPayoutRate(newRate);
    setSavingRate(false);

    if (result.success) {
      setPayoutRate(newRate);
      setIsEditingRate(false);
    } else {
      alert(`Failed to update payout rate: ${result.error}`);
    }
  };

  const handleCancelEdit = () => {
    setEditedRate(payoutRate.toString());
    setIsEditingRate(false);
  };

  const sessionColumns = createSessionColumns({
    onDelete: async () => ({ success: true }),
    onUpdate: async () => ({ success: true }),
  });

  const revisionColumns = createRevisionColumns(payoutRate);

  // Calculate totals
  const totalSessionHours = sessions.reduce(
    (sum, session) => sum + session.units_consumed,
    0
  );

  const totalRevisions = revisions.length;
  const totalRevisionPayout = totalRevisions * payoutRate;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Finances
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track tutor payouts for sessions and revisions
        </p>
      </div>

      {/* Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuration
        </h2>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <Label>Revision Payout Rate (per revision)</Label>
            {isEditingRate ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedRate}
                    onChange={(e) => setEditedRate(e.target.value)}
                    className="pl-6"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveRate}
                  disabled={savingRate}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  {savingRate ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={savingRate}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${payoutRate.toFixed(2)}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingRate(true)}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Sessions
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sessions.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {totalSessionHours.toFixed(2)} hours total
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Revisions
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalRevisions}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ${totalRevisionPayout.toFixed(2)} total payout
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Combined Activities
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sessions.length + totalRevisions}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Sessions + Revisions
          </p>
        </div>
      </div>

      {/* Revisions Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Revisions
        </h2>
        {revisions.length > 0 ? (
          <DataTable columns={revisionColumns} data={revisions} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No revisions recorded yet
            </p>
          </div>
        )}
      </div>

      {/* Sessions Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Sessions
        </h2>
        {sessions.length > 0 ? (
          <DataTable columns={sessionColumns} data={sessions} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No sessions recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
