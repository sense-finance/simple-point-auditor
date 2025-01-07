"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/points-audit`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-4 text-gray-700 font-semibold border-b border-gray-200">
                Strategy
              </th>
              <th className="text-right p-4 text-gray-700 font-semibold border-b border-gray-200">
                Expected
              </th>
              <th className="text-right p-4 text-gray-700 font-semibold border-b border-gray-200">
                Actual
              </th>
              <th className="text-right p-4 text-gray-700 font-semibold border-b border-gray-200">
                Diff
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-4">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="text-right p-4">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </td>
                    <td className="text-right p-4">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </td>
                    <td className="text-right p-4">
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))
              : data.map((row: any, i: number) => {
                  const actual = parseFloat(row.actualPoints);
                  const expected = parseFloat(row.expectedPoints);
                  const diff = actual - expected;

                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {row.strategy}
                        </div>
                        <div className="text-sm text-gray-500">
                          {row.pointsId.replace("POINTS_ID_", "")}
                        </div>
                      </td>
                      <td className="text-right p-4 font-mono text-gray-600">
                        {expected.toFixed(4)}
                      </td>
                      <td className="text-right p-4 font-mono text-gray-600">
                        {actual.toFixed(4)}
                      </td>
                      <td
                        className={`text-right p-4 font-mono font-medium ${
                          diff < 0
                            ? "text-red-600 bg-red-50"
                            : "text-emerald-600 bg-emerald-50"
                        }`}
                      >
                        {diff.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
