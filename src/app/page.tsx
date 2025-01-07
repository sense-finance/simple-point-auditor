export default async function Home() {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/points-audit`
  ).then((r) => r.json());

  return (
    <div className="p-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left p-4">Strategy</th>
            <th className="text-right p-4">Expected</th>
            <th className="text-right p-4">Actual</th>
            <th className="text-right p-4">Diff</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => {
            const actual = parseFloat(row.actualPoints);
            const expected = parseFloat(row.expectedPoints);
            const diff = actual - expected;

            return (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">{row.strategy}</td>
                <td className="text-right p-4">{expected.toFixed(4)}</td>
                <td className="text-right p-4">{actual.toFixed(4)}</td>
                <td
                  className={`text-right p-4 ${
                    diff < 0 ? "text-red-500" : "text-green-500"
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
  );
}
