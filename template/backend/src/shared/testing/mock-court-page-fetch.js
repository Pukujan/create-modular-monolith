/**
 * Mock fetch for source crawl tests — returns plausible court HTML unless URL hints at error.
 * @param {string} [bodyExtra]
 */
export function createMockCourtPageFetch(bodyExtra = "") {
  return async (url) => {
    if (String(url).includes("googleapis.com")) {
      return /** @type {Response} */ ({
        ok: true,
        status: 200,
        async json() {
          return { items: [] };
        }
      });
    }

    if (String(url).includes("missing-page")) {
      const html =
        "<html><head><title>Error</title></head><body>Sorry, this page does not exist.</body></html>";
      return mockHtmlResponse(html, 404);
    }

    const lower = String(url).toLowerCase();
    const county = lower.includes("queens")
      ? "Queens"
      : lower.includes("kings")
        ? "Kings"
        : lower.includes("bronx")
          ? "Bronx"
          : "New York";

    const tierBits = lower.includes("kerrigan")
      ? "Justice Kerrigan practice rules Queens Supreme Court part assignments civil term"
      : lower.includes("med") || lower.includes("malpractice")
        ? "medical malpractice part rules calendar supreme court Queens Kings"
        : lower.includes("cplr") || lower.includes("cvp") || lower.includes("senate")
          ? "CPLR 3216 legislation statutes court rules dismissal neglect"
          : lower.includes("202") ||
              lower.includes("uniform") ||
              lower.includes("nycrr") ||
              lower.includes("part202")
            ? "22 NYCRR Part 202 uniform court rules motions discovery filing service"
            : `${county} County Supreme Court local rules practice civil term court rules motions discovery`;

    const html = `<html><head><title>${county} Supreme Court Local Rules</title></head><body>
      ${county} County Supreme Court ${tierBits} ${bodyExtra}
    </body></html>`;
    return mockHtmlResponse(html, 200);
  };
}

/**
 * @param {string} html
 * @param {number} status
 */
function mockHtmlResponse(html, status) {
  return /** @type {Response} */ ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return name?.toLowerCase() === "content-type" ? "text/html; charset=utf-8" : null;
      }
    },
    async text() {
      return html;
    },
    async arrayBuffer() {
      return new TextEncoder().encode(html).buffer;
    }
  });
}
