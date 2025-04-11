const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('toggle-theme');
const streakDisplay = document.getElementById('streak-count');
const sortToggle = document.getElementById('sort-toggle');

let sortByIncomplete = true;
let tasks = [];
let streak = { count: 0, lastDate: null };

// === Apply saved theme, tasks, and streak on startup ===
window.addEventListener('DOMContentLoaded', () => {
  // Theme
  const savedTheme = localStorage.getItem('quicklist-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  // Tasks
  const savedTasks = localStorage.getItem('quicklist-tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }

  // Streak
  const savedStreak = JSON.parse(localStorage.getItem('quicklist-streak'));
  if (savedStreak) {
    streak = savedStreak;
  }
  updateStreakDisplay();

  renderTasks();
});

// === Theme toggle ===
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('quicklist-theme', isDark ? 'dark' : 'light');
});

// === Sort toggle ===
sortToggle.addEventListener('click', () => {
  sortByIncomplete = !sortByIncomplete;
  sortToggle.textContent = sortByIncomplete ? 'Sort: Incomplete First' : 'Sort: Completed First';
  renderTasks();
});

// === Add new task ===
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    updateStreakOnNewTask();
    saveAndRender();
  }
});

// === Toggle complete or delete task ===
taskList.addEventListener('click', (e) => {
  const index = e.target.closest('li')?.dataset.index;
  if (index === undefined) return;

  if (e.target.classList.contains('delete-btn')) {
    tasks.splice(index, 1);
  } else {
    tasks[index].completed = !tasks[index].completed;
  }
  saveAndRender();
});

// === Update streak logic ===
function updateStreakOnNewTask() {
  const today = new Date().toDateString();
  if (streak.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak.count = (streak.lastDate === yesterday) ? streak.count + 1 : 1;
    streak.lastDate = today;
    localStorage.setItem('quicklist-streak', JSON.stringify(streak));
    updateStreakDisplay();
  }
}

function updateStreakDisplay() {
  streakDisplay.textContent = `🔥 Streak: ${streak.count} day${streak.count !== 1 ? 's' : ''}`;
}

// === Save tasks to localStorage ===
function saveTasks() {
  localStorage.setItem('quicklist-tasks', JSON.stringify(tasks));
}

// === Render task list with sort option ===
function renderTasks() {
  taskList.innerHTML = '';

  const sortedTasks = [...tasks].sort((a, b) => {
    return sortByIncomplete ? a.completed - b.completed : b.completed - a.completed;
  });

  sortedTasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.dataset.index = tasks.indexOf(task);
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
      <span>${task.text}</span>
      <button class="delete-btn" title="Delete task">&times;</button>
    `;
    taskList.appendChild(li);
  });
}

// === Save and render all ===
function saveAndRender() {
  saveTasks();
  renderTasks();
}