/**
 * Hedged request: run `primary`; if it has not succeeded within `hedgeMs` (or fails sooner), start `backup` too.
 * The first success wins and the other call is aborted. Rejects only when every started call has failed.
 */
export function hedge<T>(
  primary: (signal: AbortSignal) => Promise<T>,
  backup: ((signal: AbortSignal) => Promise<T>) | null,
  hedgeMs: number,
): Promise<T> {
  const p = new AbortController();
  const b = new AbortController();
  const errors: string[] = [];
  return new Promise<T>((resolve, reject) => {
    let done = false;
    let running = 0;
    let backupStarted = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const win = (value: T, loser: AbortController) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      loser.abort();
      resolve(value);
    };
    const fail = (e: unknown) => {
      errors.push(e instanceof Error ? e.message : String(e));
      running--;
      if (done) return;
      if (!backupStarted && backup) return startBackup();
      if (running === 0) {
        done = true;
        clearTimeout(timer);
        reject(new Error(errors.join(" | ")));
      }
    };
    const startBackup = () => {
      if (backupStarted || !backup || done) return;
      backupStarted = true;
      running++;
      backup(b.signal).then((v) => win(v, p), fail);
    };

    running++;
    primary(p.signal).then((v) => win(v, b), fail);
    if (backup) timer = setTimeout(startBackup, hedgeMs);
  });
}
