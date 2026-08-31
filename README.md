# To-Do List

**Simple, local, responsive to‑do app with priorities, due dates, categories, and persistence.**

**Overview**
- **What:** A single-page To‑Do app implemented with HTML, CSS, and JavaScript that stores tasks in the browser `localStorage`.
- **Where:** Open the app by serving the project folder (see Run below) and visiting the local URL in your browser.

**Features**
- **Add / Delete:** create tasks with text, priority, due date, category, and optional notes; delete single tasks.
- **Priority Levels:** `High`, `Medium`, `Low` with per-task controls and sorting.
- **Categories:** `Personal`, `Work`, `School`, `Other`.
- **Due Dates & Overdue:** tasks can have due dates; overdue tasks are highlighted.
- **Search & Filters:** search tasks, filter All / Active / Completed / Overdue, sort by created/name/priority/due date.
- **Progress & Counters:** progress bar shows completed vs total tasks; counters for completed/incomplete tasks.
- **Clear Completed:** remove all completed tasks with confirmation.
- **Edit & Notes:** double-click a task to edit its text; add notes when creating tasks.
- **Persistence:** tasks are saved in `localStorage` (`todoTasks_v1`) and survive refreshes.

**Files**
- App entry: [index.html](index.html)
- Styles: [styles.css](styles.css)
- Behavior: [script.js](script.js)

**Run (Quick)**
1. Open a terminal and change to the project folder:

```bash
cd /Users/elnadsalcinovic/Desktop/ToDoList/To-Do-List-1.0
```

2. Serve the folder (this starts a simple static server):

```bash
python3 -m http.server 8001
```

3. Open the app in your browser:

http://localhost:8001/

4. Refresh the page after editing files to see changes.

**Troubleshooting**
- If clicking **Add** appears to do nothing: open the browser DevTools Console (Chrome/Edge/Firefox: `Cmd+Option+I`, Safari: enable Develop menu then `Cmd+Option+C`) and look for errors. The app logs helpful messages like `addTask called with` and `render: starting`.
- If the server port `8001` is in use, pick another port, e.g. `python3 -m http.server 8002`.

**Development Notes**
- Data key: `todoTasks_v1` in `localStorage`.
- To reset tasks, clear that key from DevTools Application → Local Storage or run in Console:

```js
localStorage.removeItem('todoTasks_v1')
```

**Next Improvements (planned)**
- Dark mode toggle, drag-and-drop ordering, recurring tasks, subtasks, push reminders/notifications.

**Contributing**
- Make changes locally, verify behavior by serving the folder, and open a PR or copy changes back into the project folder.

If you want, I can add a short developer checklist or wire up dark mode next — which would you prefer? 