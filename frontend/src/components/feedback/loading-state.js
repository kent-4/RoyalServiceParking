export function renderLoadingPanelCards({ count = 3, includeValue = false, lines = 2 }) {
  return Array.from({ length: count })
    .map(
      () => `
        <article class="panel-card panel-card--loading">
          <div class="loading-block loading-block--title"></div>
          ${includeValue ? '<div class="loading-block loading-block--value"></div>' : ""}
          ${Array.from({ length: lines })
            .map(() => '<div class="loading-block loading-block--line"></div>')
            .join("")}
        </article>
      `
    )
    .join("");
}

export function renderLoadingTable({ columns = 4, rows = 4 }) {
  return `
    <div class="table-shell">
      <table class="data-table data-table--loading">
        <thead>
          <tr>
            ${Array.from({ length: columns })
              .map(() => '<th scope="col"><div class="loading-block loading-block--line"></div></th>')
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: rows })
            .map(
              () => `
                <tr>
                  ${Array.from({ length: columns })
                    .map(() => '<td><div class="loading-block loading-block--line"></div></td>')
                    .join("")}
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
