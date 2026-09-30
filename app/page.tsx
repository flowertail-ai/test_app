"use client";

import { useEffect, useState, type FormEvent } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const STORAGE_KEY = "todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  // 初回表示時に localStorage から読み込む
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved));
    } catch {
      // 読み込めない場合は空のリストで開始
    }
    setLoaded(true);
  }, []);

  // 変更のたびに保存する(読み込み前に空配列で上書きしないよう loaded を確認)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // 保存できない環境では何もしない
    }
  }, [todos, loaded]);

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ToDoリスト</h1>
        <p className="mt-1 text-sm text-slate-500">
          {todos.length === 0
            ? "タスクを追加しましょう"
            : `残り ${remaining} 件 / 全 ${todos.length} 件`}
        </p>
      </header>

      <form onSubmit={addTodo} className="mb-6 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスクを入力"
          aria-label="新しいタスク"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          追加
        </button>
      </form>

      {loaded && todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-12 text-center text-sm text-slate-400">
          タスクはまだありません
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`「${todo.text}」を${todo.done ? "未完了" : "完了"}にする`}
                className="size-5 shrink-0 cursor-pointer accent-indigo-600"
              />
              <span
                className={`flex-1 break-all transition ${
                  todo.done ? "text-slate-400 line-through" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`「${todo.text}」を削除`}
                className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
