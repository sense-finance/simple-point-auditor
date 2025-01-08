"use client";

import React, { useState, useEffect } from "react";

// 1. Friendly label map
const pointIdToFriendlyName: Record<string, string> = {
  POINTS_ID_ETHENA_SATS_S3: "Ethena Sats (S3)",
  POINTS_ID_KARAK_S2: "Karak (S2)",
  POINTS_ID_SYMBIOTIC_S1: "Symbiotic (S1)",
  POINTS_ID_EIGENLAYER_S3: "EigenLayer (S3)",
  POINTS_ID_EIGENPIE_S1: "EigenPie (S1)",
  POINTS_ID_MELLOW_S1: "Mellow (S1)",
  POINTS_ID_ZIRCUIT_S3: "Zircuit (S3)",
  POINTS_ID_ETHERFI_S4: "EtherFi (S4)",
  POINTS_ID_VEDA_S1: "Veda (S1)",
};

// 2. Helper to group data by pointsId
function groupByPointsId(rows: any[]): Record<string, any[]> {
  return rows.reduce((acc, row) => {
    const { pointsId } = row;
    if (!acc[pointsId]) {
      acc[pointsId] = [];
    }
    acc[pointsId].push(row);
    return acc;
  }, {} as Record<string, any[]>);
}

export default function PointsAuditByPointsId() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logic
  useEffect(() => {
    fetch(`/api/points-audit`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Error display
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // Grouping the data once we have it
  const groupedData = groupByPointsId(data);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200">
                Points Type
              </th>
              <th className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200">
                Strategy
              </th>
              <th className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200">
                Expected
              </th>
              <th className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200">
                Actual
              </th>
              <th className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200">
                Diff
              </th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? // --------------------------------------
                // LOADING SKELETON
                // We'll simulate multiple groups, each with multiple sub-rows.
                // Feel free to tweak the number of rows or styles.
                // --------------------------------------
                Array.from({ length: 5 }).map((_, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {/* Group Header Skeleton */}
                    <tr className="border-b bg-gray-50">
                      <td
                        className="p-4 font-medium animate-pulse bg-gray-200 text-gray-200"
                        colSpan={5}
                      >
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      </td>
                    </tr>

                    {/* Sub-rows Skeleton */}
                    {Array.from({ length: 3 }).map((__, rowIndex) => (
                      <tr
                        key={`${groupIndex}-${rowIndex}`}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          {/* Empty cell under "Points Type" */}
                        </td>
                        <td className="p-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              : // --------------------------------------
                // RENDER ACTUAL DATA
                // --------------------------------------
                Object.entries(groupedData).map(([pointsId, rows]) => {
                  // Compute an aggregate for the entire group
                  const totalExpected = rows.reduce(
                    (acc, row) => acc + parseFloat(row.expectedPoints),
                    0
                  );
                  const totalActual = rows.reduce(
                    (acc, row) => acc + parseFloat(row.actualPoints),
                    0
                  );
                  const totalDiff = totalActual - totalExpected;
                  const totalDiffPct =
                    totalExpected === 0 ? 0 : (totalDiff / totalExpected) * 100;

                  // Friendly label fallback
                  const displayName =
                    pointIdToFriendlyName[pointsId] || pointsId;

                  return (
                    <React.Fragment key={pointsId}>
                      {/* GROUP HEADER ROW */}
                      <tr className="border-b bg-gray-100">
                        <td className="p-4 font-semibold" colSpan={5}>
                          {displayName}
                        </td>
                      </tr>

                      {/* SUB ROWS */}
                      {rows.map((row, subIndex) => {
                        const actual = parseFloat(row.actualPoints);
                        const expected = parseFloat(row.expectedPoints);
                        const diff = actual - expected;
                        const percentDiff =
                          expected === 0 ? 0 : (diff / expected) * 100;

                        return (
                          <tr
                            key={subIndex}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            {/* empty cell under "Points Type" */}
                            <td className="p-4"></td>

                            {/* Strategy name */}
                            <td className="p-4">
                              <div className="font-medium text-gray-900">
                                {row.strategy}
                              </div>
                            </td>

                            {/* Expected */}
                            <td className="text-right p-4 font-mono text-gray-600">
                              {expected.toFixed(4)}
                            </td>

                            {/* Actual */}
                            <td className="text-right p-4 font-mono text-gray-600">
                              {actual.toFixed(4)}
                            </td>

                            {/* Diff */}
                            <td
                              className={`text-right p-4 font-mono font-medium whitespace-nowrap ${
                                diff < 0
                                  ? "text-red-600 bg-red-50"
                                  : "text-emerald-600 bg-emerald-50"
                              }`}
                            >
                              {Math.abs(diff).toFixed(4)}
                              <span className="ml-1">
                                ({percentDiff.toFixed(1)}%)
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* AGGREGATE ROW */}
                      <tr className="border-b font-mono font-medium">
                        {/* empty cell under "Points Type" */}
                        <td className="p-4"></td>

                        <td className="p-4 text-right text-gray-500">
                          <span className="italic">Group Total</span>
                        </td>

                        <td className="p-4 text-right text-gray-600">
                          {totalExpected.toFixed(4)}
                        </td>

                        <td className="p-4 text-right text-gray-600">
                          {totalActual.toFixed(4)}
                        </td>

                        <td
                          className={`p-4 text-right ${
                            totalDiff < 0
                              ? "text-red-600 bg-red-50"
                              : "text-emerald-600 bg-emerald-50"
                          }`}
                        >
                          {Math.abs(totalDiff).toFixed(4)} (
                          {totalDiffPct.toFixed(1)}%)
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
