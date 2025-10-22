"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { createFinancesSessionColumns } from "@/components/tables/SessionColumns";
import { createFinancesRevisionColumns } from "@/components/tables/RevisionColumns";
import { SessionsProvider, useSessions } from "@/context/SessionsContext";
import { RevisionsProvider, useRevisions } from "@/context/RevisionsContext";
import { useProfile } from "@/context/ProfileContext";
import { getRevisionPayoutRate } from "@/actions/config";

function AdvisorFinancesPageContent() {
  const { profile } = useProfile();
  const { sessions } = useSessions();
  const { revisions } = useRevisions();
  const [payoutRate, setPayoutRate] = useState<number>(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayoutRate();
  }, []);

  const loadPayoutRate = async () => {
    setLoading(true);

    // Load payout rate
    const rateResult = await getRevisionPayoutRate();
    if (rateResult.success && rateResult.data !== undefined) {
      setPayoutRate(rateResult.data);
    }

    setLoading(false);
  };

  const sessionColumns = createFinancesSessionColumns();
  const revisionColumns = createFinancesRevisionColumns(payoutRate);

  // Filter items for this advisor
  const mySessions = sessions;
  const myRevisions = revisions;

  // Separate by payout status
  const paidSessions = mySessions.filter(s => s.payout_status === "paid_out");
  const pendingSessions = mySessions.filter(s => s.payout_status === "pending");
  const paidRevisions = myRevisions.filter(r => r.payout_status === "paid_out");
  const pendingRevisions = myRevisions.filter(r => r.payout_status === "pending");

  // Calculate totals
  const paidSessionAmount = paidSessions.reduce((sum, session) => {
    return sum + (session.tutor_hourly_rate ? session.units_consumed * session.tutor_hourly_rate : 0);
  }, 0);

  const pendingSessionAmount = pendingSessions.reduce((sum, session) => {
    return sum + (session.tutor_hourly_rate ? session.units_consumed * session.tutor_hourly_rate : 0);
  }, 0);

  const paidRevisionAmount = paidRevisions.length * payoutRate;
  const pendingRevisionAmount = pendingRevisions.length * payoutRate;

  const totalPaidOut = paidSessionAmount + paidRevisionAmount;
  const totalPending = pendingSessionAmount + pendingRevisionAmount;

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
          My Finances
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your earnings for sessions and revisions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 p-6">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
            Total Paid Out
          </h3>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            ${totalPaidOut.toFixed(2)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {paidSessions.length} sessions, {paidRevisions.length} revisions
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 p-6">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
            Total Pending
          </h3>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
            ${totalPending.toFixed(2)}
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            {pendingSessions.length} sessions, {pendingRevisions.length} revisions
          </p>
        </div>
      </div>

      {/* Revisions Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          My Revisions
        </h2>
        {myRevisions.length > 0 ? (
          <DataTable columns={revisionColumns} data={myRevisions} />
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
          My Sessions
        </h2>
        {mySessions.length > 0 ? (
          <DataTable columns={sessionColumns} data={mySessions} />
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

export default function AdvisorFinancesPage() {
  const { profile } = useProfile();

  return (
    <SessionsProvider tutorId={profile.id}>
      <RevisionsProvider tutorId={profile.id}>
        <AdvisorFinancesPageContent />
      </RevisionsProvider>
    </SessionsProvider>
  );
}
