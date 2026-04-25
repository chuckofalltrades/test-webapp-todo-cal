const express = require('express');
const router = express.Router();
const store = require('../lib/store');

// ── helpers ──────────────────────────────────────────────────────────────────

async function getTodos(filters = {}) {
  try {
    const pb = require('../lib/pb');
    let filterStr = '';
    const opts = { sort: '-created' };
    if (filters.tag) {
      filterStr = `tags ~ "${filters.tag}"`;
      opts.filter = filterStr;
    }
    const records = await pb.collection('todos').getFullList(opts);
    return records.map(r => ({ ...r, tags: Array.isArray(r.tags) ? r.tags : [] }));
  } catch (e) {
    let todos = [...store.todos];
    if (filters.tag) {
      todos = todos.filter(t => t.tags && t.tags.includes(filters.tag));
    }
    return todos;
  }
}

async function getTags() {
  try {
    const pb = require('../lib/pb');
    return await pb.collection('tags').getFullList({ sort: 'name' });
  } catch (e) {
    return [...store.tags];
  }
}

async function getTodoById(id) {
  try {
    const pb = require('../lib/pb');
    return await pb.collection('todos').getOne(id);
  } catch (e) {
    return store.todos.find(t => t.id === id) || null;
  }
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const grid = [];
  let week = [];

  // fill leading days from prev month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const d = new Date(year, month - 1, -firstDay.getDay() + i + 1);
    week.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, isToday: false, todos: [] });
  }

  // fill days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    week.push({ date, dayNum: d, isCurrentMonth: true, isToday, todos: [] });
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // fill trailing days
  if (week.length > 0) {
    let nextDay = 1;
    while (week.length < 7) {
      const d = new Date(year, month, nextDay++);
      week.push({ date: d, dayNum: d.getDate(), isCurrentMonth: false, isToday: false, todos: [] });
    }
    grid.push(week);
  }

  return grid;
}

// ── routes ────────────────────────────────────────────────────────────────────

// GET /
router.get('/', async (req, res) => {
  try {
    const { tag, status } = req.query;
    let todos = await getTodos(tag ? { tag } : {});
    const tags = await getTags();

    // status filter
    if (status === 'active') {
      todos = todos.filter(t => !t.completed);
    } else if (status === 'completed') {
      todos = todos.filter(t => t.completed);
    }

    // enrich todos with tag objects
    const tagMap = {};
    tags.forEach(t => { tagMap[t.id] = t; });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const enrichedTodos = todos.map(todo => {
      const todoTags = (todo.tags || []).map(tid => tagMap[tid]).filter(Boolean);
      const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < now;
      return { ...todo, tagObjects: todoTags, isOverdue };
    });

    res.render('index', {
      title: 'My Todos',
      path: req.path,
      todos: enrichedTodos,
      tags,
      currentTag: tag || null,
      currentStatus: status || 'all'
    });
  } catch (err) {
    console.error(err);
    res.render('index', { title: 'My Todos', path: req.path, todos: [], tags: [], currentTag: null, currentStatus: 'all' });
  }
});

// GET /todos/new
router.get('/todos/new', async (req, res) => {
  try {
    const tags = await getTags();
    res.render('todo-form', {
      title: 'New Todo',
      path: '/todos/new',
      todo: null,
      tags,
      action: '/todos',
      method: 'POST'
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST /todos
router.post('/todos', async (req, res) => {
  try {
    const { title, description, due_date, tags } = req.body;
    const tagIds = tags ? (Array.isArray(tags) ? tags : [tags]) : [];

    try {
      const pb = require('../lib/pb');
      await pb.collection('todos').create({
        title,
        description: description || '',
        due_date: due_date || null,
        completed: false,
        tags: tagIds
      });
    } catch (e) {
      const id = `todo_${store.nextTodoId++}`;
      store.todos.unshift({
        id,
        title,
        description: description || '',
        due_date: due_date || null,
        completed: false,
        tags: tagIds,
        created: new Date().toISOString()
      });
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST /todos/:id/complete
router.post('/todos/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const pb = require('../lib/pb');
      const record = await pb.collection('todos').getOne(id);
      await pb.collection('todos').update(id, { completed: !record.completed });
    } catch (e) {
      const todo = store.todos.find(t => t.id === id);
      if (todo) todo.completed = !todo.completed;
    }

    res.redirect(req.headers.referer || '/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST /todos/:id/delete
router.post('/todos/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const pb = require('../lib/pb');
      await pb.collection('todos').delete(id);
    } catch (e) {
      const idx = store.todos.findIndex(t => t.id === id);
      if (idx !== -1) store.todos.splice(idx, 1);
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// GET /todos/:id/edit
router.get('/todos/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await getTodoById(id);
    const tags = await getTags();

    if (!todo) return res.redirect('/');

    res.render('todo-form', {
      title: 'Edit Todo',
      path: '/todos/edit',
      todo,
      tags,
      action: `/todos/${id}/edit`,
      method: 'POST'
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST /todos/:id/edit
router.post('/todos/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, tags } = req.body;
    const tagIds = tags ? (Array.isArray(tags) ? tags : [tags]) : [];

    try {
      const pb = require('../lib/pb');
      await pb.collection('todos').update(id, {
        title,
        description: description || '',
        due_date: due_date || null,
        tags: tagIds
      });
    } catch (e) {
      const todo = store.todos.find(t => t.id === id);
      if (todo) {
        todo.title = title;
        todo.description = description || '';
        todo.due_date = due_date || null;
        todo.tags = tagIds;
      }
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// GET /calendar
router.get('/calendar', async (req, res) => {
  try {
    const today = new Date();
    const year = parseInt(req.query.year) || today.getFullYear();
    const month = parseInt(req.query.month) || (today.getMonth() + 1);

    const grid = buildCalendarGrid(year, month);
    const todos = await getTodos();

    // assign todos to day cells
    todos.forEach(todo => {
      if (todo.due_date) {
        const due = new Date(todo.due_date);
        const dueYear = due.getFullYear();
        const dueMonth = due.getMonth() + 1;
        const dueDay = due.getDate();

        if (dueYear === year && dueMonth === month) {
          for (const week of grid) {
            for (const cell of week) {
              if (cell.isCurrentMonth && cell.dayNum === dueDay) {
                cell.todos.push(todo);
              }
            }
          }
        }
      }
    });

    // prev/next month nav
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth < 1) { prevMonth = 12; prevYear--; }
    let nextYear = year, nextMonth = month + 1;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    res.render('calendar', {
      title: 'Calendar',
      path: req.path,
      grid,
      year,
      month,
      monthName: monthNames[month - 1],
      prevYear, prevMonth,
      nextYear, nextMonth,
      todayYear: today.getFullYear(),
      todayMonth: today.getMonth() + 1,
      todayDay: today.getDate()
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// GET /tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await getTags();
    const todos = await getTodos();

    // count todos per tag
    const tagCounts = {};
    todos.forEach(todo => {
      (todo.tags || []).forEach(tid => {
        tagCounts[tid] = (tagCounts[tid] || 0) + 1;
      });
    });

    const tagsWithCounts = tags.map(tag => ({ ...tag, count: tagCounts[tag.id] || 0 }));

    res.render('tags', {
      title: 'Tags',
      path: req.path,
      tags: tagsWithCounts
    });
  } catch (err) {
    console.error(err);
    res.render('tags', { title: 'Tags', path: req.path, tags: [] });
  }
});

// POST /tags
router.post('/tags', async (req, res) => {
  try {
    const { name, color } = req.body;

    try {
      const pb = require('../lib/pb');
      await pb.collection('tags').create({ name, color: color || '#6366f1' });
    } catch (e) {
      const id = `tag_${store.nextTagId++}`;
      store.tags.push({
        id,
        name,
        color: color || '#6366f1',
        created: new Date().toISOString()
      });
    }

    res.redirect('/tags');
  } catch (err) {
    console.error(err);
    res.redirect('/tags');
  }
});

// POST /tags/:id/delete
router.post('/tags/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const pb = require('../lib/pb');
      await pb.collection('tags').delete(id);
    } catch (e) {
      const idx = store.tags.findIndex(t => t.id === id);
      if (idx !== -1) store.tags.splice(idx, 1);
      // remove tag from todos
      store.todos.forEach(todo => {
        if (todo.tags) {
          todo.tags = todo.tags.filter(tid => tid !== id);
        }
      });
    }

    res.redirect('/tags');
  } catch (err) {
    console.error(err);
    res.redirect('/tags');
  }
});

module.exports = router;
