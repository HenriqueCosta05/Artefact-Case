import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router.ts";
import { createInMemoryTaskRepository } from "./tasks/task.repository.ts";

const port = Number(process.env.PORT ?? 4000);
const seedCount = Number(process.env.SEED_TASKS ?? 0);

// One repository per process: data lives as long as the server does (in-memory by design).
const tasks = createInMemoryTaskRepository();

// Optional demo data so infinite scroll has something to page through.
for (let i = 1; i <= seedCount; i++) {
  tasks.create({ titulo: `Tarefa de exemplo ${i}`, descricao: `Gerada pelo SEED_TASKS (${i}/${seedCount}).` });
}

// No CORS: the browser talks to Next.js, which proxies /trpc to this server (see client/next.config.ts).
createHTTPServer({
  basePath: "/trpc/",
  router: appRouter,
  createContext: () => ({ tasks }),
}).listen(port);

console.log(`tRPC server listening on http://localhost:${port}/trpc (${seedCount} seeded tasks)`);
