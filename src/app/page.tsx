export default async function Home() {
  const data: any[] = [];

  // await fetch(
  // `${process.env.NEXT_PUBLIC_APP_URL}/api/points-audit`
  // ).then((r) => r.json());

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
            {data.map((row: any, i: number) => {
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
