"use client";

import React, { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

type HistoricalData = {
  actualPoints: string;
  created_at: string;
}[];

function InfoTooltip({
  owner,
  dataSourceURLs,
  pointsBySource,
}: {
  owner: string;
  dataSourceURLs: string[];
  pointsBySource: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const truncateUrl = (url: string) => {
    if (url.length <= 40) return url;

    const start = url.slice(0, 20);
    const end = url.slice(-20);
    return `${start}...${end}`;
  };

  return (
    <div
      className="relative ml-2 inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="cursor-help text-gray-400 hover:text-gray-600 transition-colors">
        ℹ
      </span>

      {open && (
        <div className="absolute z-10 w-96 p-4 mt-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg -translate-x-1/2 left-1/2">
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45" />

          <div className="mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <a
              href={`https://etherscan.io/address/${owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View tracked address on Etherscan
            </a>
          </div>

          <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
            Data Sources
          </div>
          <div className="space-y-1.5">
            {dataSourceURLs.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                title={url}
              >
                {truncateUrl(url)}{" "}
                <span className="text-gray-400">
                  ({Number(pointsBySource[url]).toFixed(4)})
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [historicalData, setHistoricalData] = useState<
    Record<string, HistoricalData>
  >({});

  // Fetch logic
  useEffect(() => {
    Promise.all([
      fetch("/api/points-audit").then((r) => r.json()),
      fetch("/api/points-audit-history").then((r) => r.json()),
    ])
      .then(([pointsData, historyData]) => {
        setData(pointsData);
        setHistoricalData(historyData);
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
      <div className="p-8 max-w-7xl mx-auto" role="alert" aria-live="assertive">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  console.log("historicalData", historicalData);

  // Grouping the data once we have it
  const groupedData = groupByPointsId(data);

  /**
   * -------------------------
   * 1) LOADING State
   * -------------------------
   * We'll handle a skeleton for both table and the card layout.
   */
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto" aria-busy="true" role="status">
        {/* TABLE SKELETON (Visible on md screens and up) */}
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200"
                >
                  Points Type
                </th>
                <th
                  scope="col"
                  className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200"
                >
                  Strategy
                </th>
                <th
                  scope="col"
                  className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
                >
                  Expected
                </th>
                <th
                  scope="col"
                  className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
                >
                  Actual
                </th>
                <th
                  scope="col"
                  className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
                >
                  Diff
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  <tr className="border-b bg-gray-50">
                    <td
                      className="p-4 font-medium animate-pulse bg-gray-200 text-gray-200"
                      colSpan={5}
                    >
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <tr
                      key={`${groupIndex}-${rowIndex}`}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4" />
                      <td className="p-4">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARD SKELETON (Visible on mobile screens) */}
        <div className="block sm:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
              {Array.from({ length: 3 }).map((__, rIdx) => (
                <div key={rIdx} className="flex justify-between mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * -------------------------
   * 2) ACTUAL DATA RENDER
   * -------------------------
   */
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ---------- TABLE Layout (hidden on small screens) ---------- */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table
          className="w-full border-collapse bg-white"
          aria-label="Points Audit Table"
        >
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200"
              >
                Points Type
              </th>
              <th
                scope="col"
                className="p-4 text-left text-gray-700 font-semibold border-b border-gray-200"
              >
                Strategy
              </th>
              <th
                scope="col"
                className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
              >
                Expected
              </th>
              <th
                scope="col"
                className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
              >
                Actual
              </th>
              <th
                scope="col"
                className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
              >
                Diff
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedData).map(([pointsId, rows]) => {
              // Friendly label fallback
              const displayName = pointIdToFriendlyName[pointsId] || pointsId;

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
                        <td className="p-4" />
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            <span className="text-gray-900 truncate max-w-[180px]">
                              {row.strategy}
                            </span>
                            <InfoTooltip
                              owner={row.owner}
                              dataSourceURLs={row.dataSourceURLs}
                              pointsBySource={row.pointsBySource}
                            />
                          </div>
                        </td>
                        <td className="text-right p-4 font-mono text-gray-600">
                          {expected.toFixed(4)}
                        </td>
                        <td className="text-right p-4 font-mono text-gray-600">
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <span className="cursor-pointer border-b border-dotted border-gray-400 hover:border-black transition-colors">
                                  {actual.toFixed(4)}
                                </span>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                                  sideOffset={5}
                                >
                                  {historicalData[
                                    `${row.strategy}-${row.pointsId}`
                                  ] && (
                                    <div className="w-64">
                                      <div className="text-xs text-gray-500 mb-2">
                                        Historical Points
                                      </div>
                                      <div className="space-y-1 whitespace-nowrap">
                                        {historicalData[
                                          `${row.strategy}-${row.pointsId}`
                                        ].map((d, i) => (
                                          <div
                                            key={i}
                                            className="flex justify-between text-sm"
                                          >
                                            <span className="text-gray-600">
                                              {new Date(
                                                d.created_at
                                              ).toLocaleString("en-US", {
                                                dateStyle: "short",
                                                timeStyle: "medium",
                                              })}
                                              :
                                            </span>
                                            <span className="font-medium">
                                              {parseFloat(
                                                d.actualPoints
                                              ).toFixed(4)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <Tooltip.Arrow className="fill-white" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        </td>
                        <td
                          className={`text-right p-4 font-mono font-medium whitespace-nowrap ${
                            Math.abs(percentDiff) < 0.1
                              ? "text-indigo-600 bg-indigo-50"
                              : diff < 0
                              ? "text-red-600 bg-red-50"
                              : "text-emerald-600 bg-emerald-50"
                          }`}
                        >
                          {Math.abs(percentDiff) < 0.1 && "⭐"}{" "}
                          {Math.abs(diff).toFixed(4)}
                          <span className="ml-1">
                            ({percentDiff.toFixed(1)}%){" "}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- CARD Layout (only shown on small screens) ---------- */}
      <div className="block sm:hidden space-y-6">
        {Object.entries(groupedData).map(([pointsId, rows]) => {
          // Friendly label
          const displayName = pointIdToFriendlyName[pointsId] || pointsId;

          return (
            <div
              key={pointsId}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow"
            >
              {/* GROUP HEADER */}
              <h2 className="text-lg font-semibold mb-4">{displayName}</h2>

              {/* SUB ROWS AS CARDS */}
              <div className="space-y-2">
                {rows.map((row, subIndex) => {
                  const actual = parseFloat(row.actualPoints);
                  const expected = parseFloat(row.expectedPoints);
                  const diff = actual - expected;
                  const percentDiff =
                    expected === 0 ? 0 : (diff / expected) * 100;

                  return (
                    <div
                      key={subIndex}
                      className="p-3 rounded-md border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          Strategy
                        </span>
                        <span className="text-gray-900 truncate max-w-[180px]">
                          {row.strategy}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          Expected
                        </span>
                        <span className="font-mono text-gray-600">
                          {expected.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          Actual
                        </span>
                        <span className="font-mono text-gray-600">
                          {actual.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Diff</span>
                        <span
                          className={`font-mono font-medium ${
                            Math.abs(percentDiff) < 0.1
                              ? "text-indigo-600 bg-indigo-50 px-2 rounded"
                              : diff < 0
                              ? "text-red-600 bg-red-50 px-2 rounded"
                              : "text-emerald-600 bg-emerald-50 px-2 rounded"
                          }`}
                        >
                          {Math.abs(diff).toFixed(4)} ({percentDiff.toFixed(1)}
                          %)
                          {Math.abs(percentDiff) < 0.1 && " ⭐"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
