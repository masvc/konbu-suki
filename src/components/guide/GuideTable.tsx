import type { GuideTable as GuideTableData } from "@/lib/guides";

/** 比較表・早見表。本物の table 要素で出す（検索エンジンや AI に表として読ませるため）。 */
export function GuideTable({ table }: { table: GuideTableData }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {table.caption && (
          <caption className="mb-2 text-left text-xs text-gray-500">{table.caption}</caption>
        )}
        <thead>
          <tr className="bg-[#f8faf8]">
            {table.headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="border border-[#b7e4c7] px-3 py-2 text-left font-bold text-gray-900 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-[#d8f3dc] px-3 py-2 align-top text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
