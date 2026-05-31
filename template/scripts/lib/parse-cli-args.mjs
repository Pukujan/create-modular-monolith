/**
 * Safe CLI flag parsing (avoids argv[-1+1] → process.argv[0] when flag is missing).
 * @param {string[]} argv
 * @param {string} flag e.g. "--slug"
 */
export function getCliArg(argv, flag) {
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = argv.indexOf(flag);
  if (i === -1) return undefined;
  const next = argv[i + 1];
  if (next && !next.startsWith("--")) return next;
  return undefined;
}
