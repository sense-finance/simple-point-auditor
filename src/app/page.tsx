"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { ETH_CONFIG } from "@/app/config/ethStrategies";
import { HYPE_EVM_CONFIG } from "@/app/config/hypeEvmStrategies";

type HistoricalData = {
  actualPoints: string;
  created_at: string;
}[];

function InfoTooltip({
  externalAppURL,
  owner,
  dataSourceURLs,
  pointsBySource,
  selectedNetwork,
}: {
  externalAppURL?: string;
  owner: string;
  dataSourceURLs: string[];
  pointsBySource: Record<string, string>;
  selectedNetwork: string;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (open && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const bottomSpace = viewportHeight - rect.bottom;
      setShowAbove(bottomSpace < 200); // Show above if less than 200px from bottom
    }
  }, [open]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 100); // 100ms delay
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const truncateUrl = (url: string) => {
    if (url.length <= 40) return url;

    const start = url.slice(0, 20);
    const end = url.slice(-20);
    return `${start}...${end}`;
  };

  return (
    <div
      className="relative ml-2 inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="cursor-help text-gray-400 hover:text-gray-600 transition-colors">
        ℹ
      </span>

      {open && (
        <div
          ref={tooltipRef}
          className={`absolute z-10 w-96 p-4 text-sm bg-white border border-gray-200 rounded-lg shadow-lg -translate-x-1/2 left-1/2
            ${showAbove ? "bottom-6" : "mt-2"}`}
        >
          {/* Arrow */}
          <div
            className={`absolute ${
              showAbove ? "-bottom-2 rotate-[225deg]" : "-top-2 rotate-45"
            } left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 transform`}
          />

          <div className="mb-3 flex items-center gap-3">
            {/* DB snapshot badge if applicable */}
            {dataSourceURLs.some((u) => u.includes("via=db")) && (
              <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                Using DB snapshot (rate-limited)
              </div>
            )}
            <a
              href={`https://${
                selectedNetwork === "ethereum" ? "etherscan" : "hyperevmscan"
              }.io/address/${owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-xs text-gray-700 font-medium">
                  View Strategy Owner
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {owner.slice(0, 6)}...{owner.slice(-4)}
                </span>
              </div>
              <svg
                className="w-3 h-3 text-gray-500 group-hover:translate-x-0.5 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H11"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M13 11L21 3" stroke="currentColor" strokeWidth="2" />
                <path d="M16 3H21V8" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>

            {externalAppURL && (
              <a
                href={externalAppURL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 py-1.5 bg-primary-light/10 hover:bg-primary-light/20 rounded-md transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-primary-main font-medium">
                    Strategy
                  </span>
                  <span className="text-xs text-gray-500">
                    View on native app
                  </span>
                </div>
                <svg
                  className="w-3 h-3 text-primary-main group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M13 11L21 3" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 3H21V8" stroke="currentColor" strokeWidth="2" />
                </svg>
              </a>
            )}
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
  POINTS_ID_ETHENA_SATS_S4: "Ethena Sats (S4)",
  POINTS_ID_CAPS_S4: "Cap (S4)",
  POINTS_ID_KARAK_S2: "Karak (S2)",
  POINTS_ID_SYMBIOTIC_S1: "Symbiotic (S1)",
  POINTS_ID_EIGENLAYER_S3: "EigenLayer (S3)",
  POINTS_ID_EIGENPIE_S1: "EigenPie (S1)",
  POINTS_ID_MELLOW_S1: "Mellow (S1)",
  POINTS_ID_ZIRCUIT_S3: "Zircuit (S3)",
  POINTS_ID_ETHERFI_S4: "EtherFi (S4)",
  POINTS_ID_ETHERFI_S5: "EtherFi (S5)",
  POINTS_ID_VEDA_S1: "Veda (S1)",
  POINTS_ID_LOMBARD_LUX_S1: "Lombard Lux (S1)",
  POINTS_ID_RESOLV_S1: "Resolv (S1)",
  POINTS_ID_MERITS_S1: "Merits (S1)",
  POINTS_ID_HYPERBEAT_S1: "Hyperbeat (S1)",
  POINTS_ID_SENTIMENT_S1: "Sentiment (S1)",
  POINTS_ID_UPSHIFT_S1: "Upshift (S1)",
  POINTS_ID_FELIX_S1: "Felix (S1)",
  POINTS_ID_UPSHIFT_S2: "Upshift (S2)",
  POINTS_ID_KINETIQ_S1: "Kinetiq (S1)",
};

// 2. Helper to group data by pointsId
function groupByPointsId(rows: any): Record<string, any[]> {
  if (!Array.isArray(rows)) return {} as Record<string, any[]>;
  return rows.reduce((acc: Record<string, any[]>, row: any) => {
    const { pointsId } = row;
    if (!acc[pointsId]) {
      acc[pointsId] = [];
    }
    acc[pointsId].push(row);
    return acc;
  }, {} as Record<string, any[]>);
}

function HistoryModal({
  isOpen,
  onClose,
  data,
  strategy,
  pointsId,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: HistoricalData;
  strategy: string;
  pointsId: string;
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Historical Points
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Dialog.Close>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <span className="font-medium">{strategy}</span>
              <span>•</span>
              <span>{pointsId}</span>
            </div>

            {data.map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 px-3 rounded hover:bg-gray-50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(d.created_at).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(d.created_at).toLocaleTimeString("en-US", {
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <span className="font-mono font-medium text-gray-900">
                  {parseFloat(d.actualPoints).toLocaleString("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PointsAuditByPointsId() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Read initial network synchronously from URL to avoid flicker
  const [selectedNetwork, setSelectedNetwork] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const n = params.get("network");
      if (n === "ethereum" || n === "hypeEVM") return n;
    }
    return "ethereum";
  });
  const [config, setConfig] = useState(ETH_CONFIG);
  const [historicalData, setHistoricalData] = useState<
    Record<string, HistoricalData>
  >({});
  const [selectedHistory, setSelectedHistory] = useState<{
    isOpen: boolean;
    strategy: string;
    pointsId: string;
  }>({
    isOpen: false,
    strategy: "",
    pointsId: "",
  });

  // URL/search params helpers
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // (Initial network is read synchronously above; no need to set from URL here.)

  // Update config when network changes
  useEffect(() => {
    setConfig(selectedNetwork === "ethereum" ? ETH_CONFIG : HYPE_EVM_CONFIG);
    setLoading(true);
  }, [selectedNetwork]);

  // Fetch logic
  useEffect(() => {
    Promise.all([
      fetch(`/api/points-audit/${selectedNetwork}`).then((r) => r.json()),
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
  }, [selectedNetwork]);

  // Sync selected network into URL params for shareable links
  useEffect(() => {
    const current = searchParams.get("network");
    if (current === selectedNetwork) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("network", selectedNetwork);
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}?${sp.toString()}${hash}`);
  }, [selectedNetwork, pathname, router, searchParams]);

  // Grouping the data once we have it
  const groupedData = groupByPointsId(data);

  // Helpers for deep-linking/highlighting
  const linkStrategy = searchParams.get("strategy") ?? "";
  const linkPointsId = searchParams.get("pointsId") ?? "";
  const makeRowAnchorId = (strategy: string, pointsId: string) =>
    `row-${encodeURIComponent(`${strategy}--${pointsId}`)}`;

  // If someone lands with strategy/pointsId in URL, scroll into view once data is loaded
  useEffect(() => {
    if (!loading && linkStrategy && linkPointsId) {
      const id = makeRowAnchorId(linkStrategy, linkPointsId);
      const scrollToEl = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      if (typeof window !== "undefined") {
        requestAnimationFrame(scrollToEl);
        setTimeout(scrollToEl, 250);
      }
    }
  }, [loading, linkStrategy, linkPointsId]);

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <ToggleGroup.Root
          type="single"
          value={selectedNetwork}
          onValueChange={(value: string | undefined) =>
            value && setSelectedNetwork(value)
          }
          aria-label="Select network"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white p-1.5 ring-1 ring-gray-200 shadow-sm"
        >
          <ToggleGroup.Item
            value="ethereum"
            className="px-5 py-2.5 text-sm text-gray-600 font-medium rounded-lg hover:text-gray-900 hover:bg-gray-50 data-[state=on]:text-gray-900 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-gray-300 transition"
          >
            Ethereum
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="hypeEVM"
            className="px-5 py-2.5 text-sm text-gray-600 font-medium rounded-lg hover:text-gray-900 hover:bg-gray-50 data-[state=on]:text-gray-900 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-gray-300 transition"
          >
            HypeEVM
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      {loading ? (
        <>
          {/* TABLE SKELETON (Visible on md screens and up) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl ring-1 ring-gray-200/60 shadow-sm">
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
                  <th
                    scope="col"
                    className="p-4 text-right text-gray-700 font-semibold border-b border-gray-200"
                  >
                    Audit State
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <tr className="border-b bg-gray-50">
                      <td
                        className="p-4 font-medium animate-pulse bg-gray-200 text-gray-200"
                        colSpan={6}
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
                className="bg-white rounded-xl p-4 ring-1 ring-gray-200/60 animate-pulse"
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
        </>
      ) : (
        <>
          {/* ---------- TABLE Layout (hidden on small screens) ---------- */}
          <div className="hidden sm:block overflow-x-auto rounded-xl ring-1 ring-gray-200/60 shadow-sm bg-white">
            <table
              className="w-full border-collapse bg-white"
              aria-label="Points Audit Table"
            >
              <thead>
                <tr className="bg-gray-50/80">
                  <th
                    scope="col"
                    className="p-4 text-left text-gray-700 font-semibold border-b border-gray-100 w-[44px]"
                  ></th>
                  <th
                    scope="col"
                    className="p-4 text-left text-gray-700 font-semibold border-b border-gray-100"
                  >
                    Strategy
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-right text-gray-700 font-semibold border-b border-gray-100 w-[140px]"
                  >
                    Expected
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-right text-gray-700 font-semibold border-b border-gray-100 w-[140px]"
                  >
                    Actual
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-right text-gray-700 font-semibold border-b border-gray-100 w-[160px]"
                  >
                    Diff
                  </th>
                  <th
                    scope="col"
                    className="p-4 text-right text-gray-700 font-semibold border-b border-gray-100 w-[160px]"
                  >
                    <div>Audit State</div>
                    <div className="text-xs font-normal">
                      Last Snapshot, Diff%
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(groupedData).map(([pointsId, rows]) => {
                  // Friendly label fallback
                  const displayName =
                    pointIdToFriendlyName[pointsId] || pointsId;

                  return (
                    <React.Fragment key={pointsId}>
                      {/* GROUP HEADER ROW */}
                      <tr className="border-b bg-gray-50/70">
                        <td
                          className="p-4 font-semibold text-gray-800"
                          colSpan={6}
                        >
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

                        const noExpectedPoints = row.expectedPoints === "0";

                        const strategyConfig = config.find(
                          (c) => c.strategy === row.strategy
                        );

                        const state = strategyConfig?.points.find(
                          (p) => p.type === row.pointsId
                        )?.state;

                        const isHighlighted =
                          row.strategy === linkStrategy &&
                          row.pointsId === linkPointsId;

                        const rowAnchorId = makeRowAnchorId(
                          row.strategy,
                          row.pointsId
                        );

                        const permalink = `${pathname}?network=${encodeURIComponent(
                          selectedNetwork
                        )}&strategy=${encodeURIComponent(
                          row.strategy
                        )}&pointsId=${encodeURIComponent(
                          row.pointsId
                        )}#${rowAnchorId}`;

                        return (
                          <tr
                            key={subIndex}
                            id={rowAnchorId}
                            className={`group border-b hover:bg-gray-50 transition-colors scroll-mt-24 ${
                              isHighlighted ? "bg-primary-light/5" : ""
                            }`}
                          >
                            <td className="py-5 px-4 align-top">
                              <Link
                                href={permalink}
                                aria-label="Link to this row"
                                title="Link to this row"
                                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              >
                                #
                              </Link>
                            </td>
                            <td className="py-5 px-4">
                              <div className="font-medium text-gray-900">
                                <span className="text-gray-900 truncate max-w-[180px]">
                                  {row.strategy}
                                </span>
                                <InfoTooltip
                                  externalAppURL={row.externalAppURL}
                                  owner={row.owner}
                                  dataSourceURLs={row.dataSourceURLs}
                                  pointsBySource={row.pointsBySource}
                                  selectedNetwork={selectedNetwork}
                                />
                              </div>
                            </td>
                            {noExpectedPoints ? (
                              <td className="py-5 px-2 bg-gray-50 text-right font-mono text-gray-500">
                                N/A
                              </td>
                            ) : (
                              <td className="py-5 px-2 text-right font-mono text-gray-600">
                                {expected.toFixed(4)}
                              </td>
                            )}
                            <td className="py-5 px-2 text-right font-mono text-gray-600">
                              <Tooltip.Provider delayDuration={0}>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <span className="cursor-pointer border-b border-dotted border-gray-300 hover:border-gray-500 transition-colors">
                                      {actual.toLocaleString("en-US", {
                                        minimumFractionDigits: 4,
                                        maximumFractionDigits: 4,
                                      })}
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="bg-white border border-gray-200 rounded-lg shadow-md p-4 z-50 min-w-[320px]"
                                      sideOffset={5}
                                    >
                                      {historicalData[
                                        `${row.strategy}-${row.pointsId}`
                                      ] && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-3">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                            <h3 className="text-sm font-semibold text-gray-900">
                                              Historical Points
                                            </h3>
                                          </div>

                                          <div className="space-y-2">
                                            {historicalData[
                                              `${row.strategy}-${row.pointsId}`
                                            ]
                                              .slice(0, 5)
                                              .map((d, i) => (
                                                <div
                                                  key={i}
                                                  className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-gray-50"
                                                >
                                                  <div className="flex flex-col min-w-[140px]">
                                                    <span className="text-xs font-medium text-gray-900">
                                                      {new Date(
                                                        d.created_at
                                                      ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                          dateStyle: "medium",
                                                        }
                                                      )}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                      {new Date(
                                                        d.created_at
                                                      ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                          timeStyle: "short",
                                                        }
                                                      )}
                                                    </span>
                                                  </div>
                                                  <span className="font-mono font-medium text-gray-900 ml-4">
                                                    {parseFloat(
                                                      d.actualPoints
                                                    ).toLocaleString("en-US", {
                                                      minimumFractionDigits: 4,
                                                      maximumFractionDigits: 4,
                                                    })}
                                                  </span>
                                                </div>
                                              ))}
                                          </div>

                                          {historicalData[
                                            `${row.strategy}-${row.pointsId}`
                                          ].length > 5 && (
                                            <a
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedHistory({
                                                  isOpen: true,
                                                  strategy: row.strategy,
                                                  pointsId: row.pointsId,
                                                });
                                              }}
                                              className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 block text-center"
                                            >
                                              View{" "}
                                              {historicalData[
                                                `${row.strategy}-${row.pointsId}`
                                              ].length - 5}{" "}
                                              more entries
                                            </a>
                                          )}
                                        </div>
                                      )}
                                      <Tooltip.Arrow className="fill-white" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              </Tooltip.Provider>
                              {row.dataSourceURLs?.some((u: string) => u.includes("via=db")) && (
                                <span
                                  className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 align-middle"
                                  title="Using DB snapshot for rate-limited source"
                                >
                                  DB
                                </span>
                              )}
                            </td>
                            {noExpectedPoints ? (
                              <td className="py-5 px-2 bg-gray-50"></td>
                            ) : (
                              <td
                                className={`py-5 px-2 text-right font-mono font-medium whitespace-nowrap rounded ${
                                  Math.abs(percentDiff) < 0.1
                                    ? "text-indigo-700 bg-indigo-50"
                                    : diff < 0
                                    ? "text-red-700 bg-red-50"
                                    : "text-emerald-700 bg-emerald-50"
                                }`}
                              >
                                {Math.abs(percentDiff) < 0.1 && "⭐"}{" "}
                                {Math.abs(diff).toFixed(4)}
                                <span className="text-xs ml-1">
                                  ({percentDiff.toFixed(1)}%)
                                </span>
                              </td>
                            )}
                            {state && (
                              <td className="py-5 px-2 text-right">
                                <div className="flex items-center justify-end gap-1.5 font-medium font-mono">
                                  <Image
                                    src={`/${
                                      {
                                        verified: "check-circle",
                                        delayed: "clock-rewind",
                                        partial: "pie-chart",
                                      }[state?.value?.toLowerCase() ?? ""]
                                    }.svg`}
                                    width="16"
                                    height="16"
                                    alt={state?.value ?? ""}
                                  />
                                  <span>{state?.value}</span>
                                </div>
                                <div className="text-gray-500 text-xs font-mono">
                                  {state?.lastSnapshot}, {state?.diff}
                                </div>
                              </td>
                            )}
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
                  className="bg-white rounded-xl p-4 ring-1 ring-gray-200/60 shadow-sm"
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

                      const isHighlighted =
                        row.strategy === linkStrategy &&
                        row.pointsId === linkPointsId;

                      const rowAnchorId = makeRowAnchorId(
                        row.strategy,
                        row.pointsId
                      );

                      const permalink = `${pathname}?network=${encodeURIComponent(
                        selectedNetwork
                      )}&strategy=${encodeURIComponent(
                        row.strategy
                      )}&pointsId=${encodeURIComponent(
                        row.pointsId
                      )}#${rowAnchorId}`;

                      return (
                        <div
                          key={subIndex}
                          id={rowAnchorId}
                          className={`group p-3 rounded-lg ${
                            isHighlighted
                              ? "bg-primary-light/5 ring-0"
                              : "bg-white ring-1 ring-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700">
                              Strategy
                            </span>
                            <span className="text-gray-900 truncate max-w-[180px] flex items-center gap-2">
                              {row.strategy}
                              <Link
                                href={permalink}
                                aria-label="Link to this row"
                                title="Link to this row"
                                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              >
                                #
                              </Link>
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
                            <span className="font-medium text-gray-700">
                              Diff
                            </span>
                            <span
                              className={`font-mono font-medium ${
                                Math.abs(percentDiff) < 0.1
                                  ? "text-indigo-600 bg-indigo-50 px-2 rounded"
                                  : diff < 0
                                  ? "text-red-600 bg-red-50 px-2 rounded"
                                  : "text-emerald-600 bg-emerald-50 px-2 rounded"
                              }`}
                            >
                              {Math.abs(diff).toFixed(4)} (
                              {percentDiff.toFixed(1)}
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
        </>
      )}

      {/* History Modal */}
      {selectedHistory.isOpen && (
        <HistoryModal
          isOpen={selectedHistory.isOpen}
          onClose={() =>
            setSelectedHistory((prev) => ({ ...prev, isOpen: false }))
          }
          data={
            historicalData[
              `${selectedHistory.strategy}-${selectedHistory.pointsId}`
            ]
          }
          strategy={selectedHistory.strategy}
          pointsId={selectedHistory.pointsId}
        />
      )}
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-white p-1.5 ring-1 ring-gray-200 shadow-sm">
          <div className="px-5 py-2.5 text-sm text-gray-600 font-medium rounded-lg bg-white shadow-sm ring-1 ring-gray-300">
            Loading...
          </div>
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl ring-1 ring-gray-200/60 shadow-sm">
        <div className="w-full bg-white p-8 text-center text-gray-500">
          Loading points audit data...
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PointsAuditByPointsId />
    </Suspense>
  );
}
