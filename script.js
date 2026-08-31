const STORAGE_KEY = 'todoTasks_v1'

const form = document.getElementById('task-form')
const input = document.getElementById('task-input')
const prioritySelect = document.getElementById('task-priority')
const dueInput = document.getElementById('task-due')
const categorySelect = document.getElementById('task-category')
const notesInput = document.getElementById('task-notes')
const tasksList = document.getElementById('tasks')
const completedCountEl = document.getElementById('completed-count')
const incompleteCountEl = document.getElementById('incomplete-count')
const progressBar = document.getElementById('progress-bar')
const progressText = document.getElementById('progress-text')
const searchInput = document.getElementById('search-input')
const filterBtns = document.querySelectorAll('.filter-btn')
const sortSelect = document.getElementById('sort-select')
const clearBtn = document.getElementById('clear-completed')

let currentFilter = 'all'
let currentSearch = ''
let currentSort = 'created'

function getTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw? JSON.parse(raw) : []
  }catch(e){
    console.error('Failed to parse tasks', e)
    return []
  }
}

function saveTasks(tasks){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function render(){
  console.log('render: starting')
  const allTasks = getTasks()
  // compute counts and progress from all tasks
  let completed = allTasks.filter(t=>t.completed).length
  const total = allTasks.length

  // create display list from allTasks
  let displayTasks = allTasks.slice()

  // apply search
  if(currentSearch){
    const q = currentSearch.toLowerCase()
    displayTasks = displayTasks.filter(t=> (t.text||'').toLowerCase().includes(q) || (t.notes||'').toLowerCase().includes(q) || (t.category||'').toLowerCase().includes(q))
  }

  // apply filter
  const today = new Date()
  function isOverdue(t){ if(!t.due) return false; const d = new Date(t.due); return !t.completed && d < new Date(today.getFullYear(), today.getMonth(), today.getDate()) }
  if(currentFilter==='active') displayTasks = displayTasks.filter(t=>!t.completed)
  if(currentFilter==='completed') displayTasks = displayTasks.filter(t=>t.completed)
  if(currentFilter==='overdue') displayTasks = displayTasks.filter(isOverdue)

  // apply sort
  const order = {high:3, medium:2, low:1}
  if(currentSort==='priority') displayTasks.sort((a,b)=> (order[b.priority] - order[a.priority]) || (Number(a.id) - Number(b.id)))
  else if(currentSort==='name') displayTasks.sort((a,b)=> (a.text||'').localeCompare(b.text||''))
  else if(currentSort==='due') displayTasks.sort((a,b)=>{
    if(a.due && b.due) return new Date(a.due) - new Date(b.due)
    if(a.due) return -1
    if(b.due) return 1
    return Number(a.id) - Number(b.id)
  })
  else displayTasks.sort((a,b)=> Number(a.id) - Number(b.id))

  try{
    tasksList.innerHTML=''
    displayTasks.forEach(task=>{
      const li = document.createElement('li')
      li.className='task-item'
      li.dataset.id = task.id

    // mark overdue
    const today = new Date()
    if(task.due){
      const due = new Date(task.due)
      if(!task.completed && due < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
        li.classList.add('overdue')
      }
    }

    const labelWrap = document.createElement('div')
    labelWrap.className='label'

    const checkbox = document.createElement('input')
    checkbox.type='checkbox'
    checkbox.checked = !!task.completed
    checkbox.addEventListener('change', ()=> toggleComplete(task.id))

    const span = document.createElement('div')
    span.className = 'task-text' + (task.completed? ' completed':'')
    span.textContent = task.text
    span.title = 'Double-click to edit'
    span.addEventListener('dblclick', ()=> editTask(task.id, span))

    const meta = document.createElement('div')
    meta.className = 'task-meta'
    const small = document.createElement('div')
    small.className = 'small'
    let metaParts = []
    if(task.category) metaParts.push(task.category[0].toUpperCase() + task.category.slice(1))
    if(task.due) metaParts.push('Due: ' + task.due)
    if(task.notes) metaParts.push(task.notes)
    small.textContent = metaParts.join(' • ')
    meta.appendChild(small)

    labelWrap.appendChild(checkbox)
    const textWrap = document.createElement('div')
    textWrap.style.display = 'flex'
    textWrap.style.flexDirection = 'column'
    textWrap.appendChild(span)
    textWrap.appendChild(meta)
    labelWrap.appendChild(textWrap)

    const actions = document.createElement('div')
    actions.className='task-actions'

    // priority badge + select
    const badge = document.createElement('div')
    badge.className = 'priority-badge priority-' + task.priority
    badge.textContent = task.priority[0].toUpperCase() + task.priority.slice(1)

    const priSelect = document.createElement('select')
    priSelect.className = 'task-priority-select';
    ['high','medium','low'].forEach(p=>{
      const opt = document.createElement('option')
      opt.value = p
      opt.textContent = p[0].toUpperCase() + p.slice(1)
      if(p===task.priority) opt.selected = true
      priSelect.appendChild(opt)
    })
    priSelect.addEventListener('change', ()=> updatePriority(task.id, priSelect.value))

    const del = document.createElement('button')
    del.className='btn-icon delete'
    del.innerText='Delete'
    del.addEventListener('click', ()=> deleteTask(task.id))

    actions.appendChild(priSelect)
    actions.appendChild(del)

    li.appendChild(labelWrap)
    li.appendChild(actions)
    tasksList.appendChild(li)

    })
  }catch(err){
    console.error('render: error while rendering tasks', err)
    // show fallback empty list
    tasksList.innerHTML = ''
  }

  completedCountEl.textContent = completed
  incompleteCountEl.textContent = (total - completed)

  // progress from all tasks
  const percent = total? Math.round((completed/total)*100) : 0
  if(progressBar) progressBar.style.width = percent + '%'
  if(progressText) progressText.textContent = `${completed} / ${total} Tasks — ${percent}%`
  console.log('render: done', {total, completed, percent, displayCount: displayTasks.length})
}

function addTask(text){
  try{
    console.log('addTask called with', text)
    const tasks = getTasks()
    const trimmed = (text||'').trim()
    if(!trimmed) { console.log('addTask: empty text, abort'); return }
    const priority = (prioritySelect && prioritySelect.value) || 'medium'
    const due = (dueInput && dueInput.value) ? dueInput.value : null
    const category = (categorySelect && categorySelect.value) || null
    const notes = (notesInput && notesInput.value) ? notesInput.value : null
    const newTask = {id: Date.now().toString(), text: trimmed, completed:false, priority, due, category, notes}
    tasks.push(newTask)
    saveTasks(tasks)
    console.log('addTask: saved', newTask)
    render()
  }catch(err){
    console.error('addTask error', err)
  }
}

function toggleComplete(id){
  const tasks = getTasks()
  const idx = tasks.findIndex(t=>t.id===id)
  if(idx===-1) return
  tasks[idx].completed = !tasks[idx].completed
  saveTasks(tasks)
  render()
}

function deleteTask(id){
  let tasks = getTasks()
  tasks = tasks.filter(t=>t.id!==id)
  saveTasks(tasks)
  render()
}

function editTask(id, spanEl){
  const old = spanEl.textContent
  const input = document.createElement('input')
  input.type='text'
  input.value = old
  input.className = 'edit-input'
  input.style.padding = '8px'
  input.style.borderRadius = '8px'
  input.style.border = '1px solid rgba(0,0,0,.08)'
  spanEl.replaceWith(input)
  input.focus()

  function finish(){
    const newVal = input.value.trim()
    if(newVal && newVal !== old){
      const tasks = getTasks()
      const t = tasks.find(x=>x.id===id)
      if(t){ t.text = newVal; saveTasks(tasks) }
    }
    render()
  }

  input.addEventListener('blur', finish)
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Enter') input.blur()
    if(e.key==='Escape') { render() }
  })
}

function updatePriority(id, newPriority){
  const tasks = getTasks()
  const t = tasks.find(x=>x.id===id)
  if(!t) return
  t.priority = newPriority
  saveTasks(tasks)
  render()
}

if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault()
    try{
      addTask(input.value)
      // clear non-essential fields
      input.value = ''
      if(dueInput) dueInput.value = ''
      if(notesInput) notesInput.value = ''
      if(categorySelect) categorySelect.selectedIndex = 0
      if(prioritySelect) prioritySelect.selectedIndex = 0
      input.focus()
    }catch(err){
      console.error('submit handler error', err)
    }
  })
} else {
  console.warn('No form element found')
}

// controls
window.addEventListener('error', (ev)=>{
  console.error('Uncaught error:', ev.error || ev.message, ev)
})
if(searchInput) searchInput.addEventListener('input', ()=>{ currentSearch = searchInput.value.trim(); render() })
if(filterBtns && filterBtns.length) filterBtns.forEach(b=> b.addEventListener('click', ()=>{ filterBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentFilter = b.dataset.filter; render() }))
if(sortSelect) sortSelect.addEventListener('change', ()=>{ currentSort = sortSelect.value; render() })
if(clearBtn) clearBtn.addEventListener('click', ()=>{
  if(!confirm('Are you sure you want to delete all completed tasks?')) return
  let tasks = getTasks()
  tasks = tasks.filter(t=>!t.completed)
  saveTasks(tasks)
  render()
})

// initial render
render()
