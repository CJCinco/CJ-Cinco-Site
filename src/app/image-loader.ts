export type ImageLoadHandle = (() => void) & { promote: () => void };
export type LoadImage = (url: string, receive: (image?: HTMLImageElement) => void, urgent?: boolean) => ImageLoadHandle;

/** One bounded pool shared by rider, artwork and scroll-addressed video frames. */
export function createImageLoader(limit = 2) {
  type Job = { url: string; receive: (image?: HTMLImageElement) => void; image?: HTMLImageElement; canceled: boolean };
  const queue: Job[] = [], active = new Set<Job>();
  let alive = true;
  function pump() {
    while (alive && active.size < limit && queue.length) {
      const job = queue.shift()!;
      if (job.canceled) continue;
      const image = new Image(); job.image = image; active.add(job); image.decoding = "async";
      const finish = (ok: boolean) => {
        image.onload = image.onerror = null; active.delete(job);
        if (alive && !job.canceled) job.receive(ok ? image : undefined);
        pump();
      };
      image.onload = () => finish(true); image.onerror = () => finish(false); image.src = job.url;
    }
  }
  const load: LoadImage = (url, receive, urgent = false) => {
    const job: Job = { url, receive, canceled: false };
    if (alive) { if (urgent) queue.unshift(job); else queue.push(job); pump(); }
    const cancel = () => {
      job.canceled = true;
      const index = queue.indexOf(job); if (index >= 0) queue.splice(index, 1);
      if (job.image && active.delete(job)) { job.image.onload = job.image.onerror = null; job.image.src = ""; }
      pump();
    };
    return Object.assign(cancel, {
      promote() {
        const index = queue.indexOf(job);
        // Active requests keep their decode work; only queued jobs move forward.
        if (!alive || job.canceled || index < 0) return;
        queue.splice(index, 1); queue.unshift(job); pump();
      },
    });
  };
  return {
    load,
    dispose() {
      alive = false; queue.length = 0;
      for (const job of active) { job.canceled = true; job.image!.onload = job.image!.onerror = null; job.image!.src = ""; }
      active.clear();
    },
  };
}
