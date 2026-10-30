import { taskRouter } from "./tasks/task.router.ts";
import { router } from "./trpc.ts";

export const appRouter = router({ task: taskRouter });

// The client imports only this type (import type), so no server code reaches its bundle.
export type AppRouter = typeof appRouter;
