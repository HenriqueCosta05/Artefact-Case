import type { Metadata } from "next";
import { CreateTaskForm } from "@/components/task-editors";

export const metadata: Metadata = { title: "Nova tarefa · ArtefactAI" };

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-12 sm:py-16">
      <h1 className="text-4xl leading-none sm:text-5xl">Nova tarefa</h1>
      <CreateTaskForm />
    </main>
  );
}
