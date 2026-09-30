"use client";

import { useEffect, useState, type FormEvent } from "react";

const CATEGORIES = ["仕事", "プライベート", "勉強", "その他"] as const;
const PRIORITIES = ["高", "中", "低"] as const;

type Category = (typeof CATEGORIES)[number];
type Priority = (typeof PRIORITIES)[number];

type Todo = {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string; // "YYYY-MM-DD"
  category: Category;
  priority: Priority;
};

const STORAGE_KEY = "todos";

const CATEGORY_STYLES: Record<Category, string> = {
  仕事: "bg-blue-50 text-blue-700 ring-blue-200",
  プライベート: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  勉強: "bg-violet-50 text-violet-700 ring-violet-200",
  その他: "bg-slate-100 text-slate-600 ring-slate-200",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  高: "bg-red-50 text-red-700 ring-red-200",
  中: "bg-amber-50 text-amber-700 ring-amber-200",
  低: "bg-slate-50 text-slate-500 ring-slate-200",
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// ローカル時刻での今日の日付を "YYYY-MM-DD" で返す
function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "YYYY-MM-DD" を "10/15(水)" 形式にする
function formatDue(due: string) {
  const [y, m, d] = due.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}/${d}(${WEEKDAYS[date.getDay()]})`;
}

// 旧形式(カテゴリ・優先度なし)のデータも読み込めるよう補完する
function normalize(raw: unknown): Todo[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => ({
    id: String(t.id),
    text: String(t.text),
    done: Boolean(t.done),
    dueDate: typeof t.dueDate === "string" && t.dueDate ? t.dueDate : undefined,
    category: CATEGORIES.includes(t.category) ? t.category : "その他",
    priority: PRIORITIES.includes(t.priority) ? t.priority : "中",
  }));
}

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | "すべて";
  onChange: (v: T | "すべて") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-medium text-slate-500">
        {label}
      </span>
      {(["すべて", ...options] as (T | "すべて")[]).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={`rounded-full px-3 py-1 text-xs transition ${
            value === opt
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Category>("その他");
  const [priority, setPriority] = useState<Priority>("中");
  const [categoryFilter, setCategoryFilter] = useState<Category | "すべて">(
    "すべて"
  );
  const [priorityFilter, setPriorityFilter] = useState<Priority | "すべて">(
    "すべて"
  );
  const [loaded, setLoaded] = useState(false);

  // 初回表示時に localStorage から読み込む
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(normalize(JSON.parse(saved)));
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
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        dueDate: dueDate || undefined,
        category,
        priority,
      },
    ]);
    setInput("");
    setDueDate("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const today = todayString();
  const remaining = todos.filter((t) => !t.done).length;

  // フィルタ後、締切日が近い順に並べる(締切なしは末尾、同日は追加順)
  const visible = todos
    .filter(
      (t) =>
        (categoryFilter === "すべて" || t.category === categoryFilter) &&
        (priorityFilter === "すべて" || t.priority === priorityFilter)
    )
    .sort((a, b) => {
      if (a.dueDate === b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    });

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ToDoリスト</h1>
        <p className="mt-1 text-sm text-slate-500 tabular-nums">
          {todos.length === 0
            ? "タスクを追加しましょう"
            : `表示中 ${visible.length} 件(残り ${remaining} 件 / 全 ${todos.length} 件)`}
        </p>
      </header>

      <form onSubmit={addTodo} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新しいタスクを入力"
            aria-label="新しいタスク"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            締切
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={selectClass}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            カテゴリ
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            優先度
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={selectClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {todos.length > 0 && (
        <div className="mb-4 space-y-2">
          <FilterChips
            label="カテゴリ"
            options={CATEGORIES}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <FilterChips
            label="優先度"
            options={PRIORITIES}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
      )}

      {loaded && visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 py-12 text-center text-sm text-slate-400">
          {todos.length === 0
            ? "タスクはまだありません"
            : "該当するタスクはありません"}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {visible.map((todo) => {
            const overdue = !todo.done && !!todo.dueDate && todo.dueDate < today;
            const dueToday = !todo.done && todo.dueDate === today;
            return (
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
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-all transition ${
                      todo.done ? "text-slate-400 line-through" : ""
                    }`}
                  >
                    {todo.text}
                  </p>
                  <div
                    className={`mt-1 flex flex-wrap items-center gap-1.5 text-xs ${
                      todo.done ? "opacity-50" : ""
                    }`}
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 ring-1 ${CATEGORY_STYLES[todo.category]}`}
                    >
                      {todo.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ring-1 ${PRIORITY_STYLES[todo.priority]}`}
                    >
                      優先度:{todo.priority}
                    </span>
                    {todo.dueDate && (
                      <span
                        className={`tabular-nums ${
                          overdue
                            ? "font-medium text-red-600"
                            : dueToday
                              ? "font-medium text-orange-600"
                              : "text-slate-500"
                        }`}
                      >
                        締切 {formatDue(todo.dueDate)}
                        {overdue && " ・期限切れ"}
                        {dueToday && " ・今日まで"}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`「${todo.text}」を削除`}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
