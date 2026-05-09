export function renderDataTable({
  columns = [],
  rows = [],
  rowKey = "id",
  className = "",
  emptyTitle = "No results found",
  emptyMessage = "There is no data to show right now."
}) {
  const header = columns
    .map(
      (column) => `
        <th scope="col" class="${column.headerClassName ?? ""}">
          ${column.label}
        </th>
      `
    )
    .join("");

  const body = rows.length
    ? rows
        .map((row, index) => {
          const key = row?.[rowKey] ?? index;
          return `
            <tr data-row-key="${key}">
              ${columns
                .map((column) => {
                  const content =
                    typeof column.render === "function"
                      ? column.render(row, index)
                      : row?.[column.key] ?? "";

                  return `
                    <td class="${column.cellClassName ?? ""}" data-label="${column.label}">
                      ${content}
                    </td>
                  `;
                })
                .join("")}
            </tr>
          `;
        })
        .join("")
    : `
        <tr>
          <td colspan="${columns.length}" class="data-table__empty">
            <div class="empty-state empty-state--table">
              <h3>${emptyTitle}</h3>
              <p class="empty-copy">${emptyMessage}</p>
            </div>
          </td>
        </tr>
      `;

  return `
    <div class="table-shell">
      <table class="data-table ${className}">
        <thead>
          <tr>${header}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}
