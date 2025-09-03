'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [projName, setProjName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('todo');
  const [loading, setLoading] = useState({ projects: true, tasks: false });
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(s => ({ ...s, projects: true }));
      setError('');
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data.projects || []);
      // Autoselect first project
      const first = (data.projects || [])[0]?._id;
      if (first) {
        setSelectedId(first);
        loadTasks(first);
      } else {
        setTasks([]);
        setSelectedId('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(s => ({ ...s, projects: false }));
    }
  }

  async function createProject(e) {
    e.preventDefault();
    try {
      setError('');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Create project failed');
      }
      const { project } = await res.json();
      setProjects(p => [project, ...p]);
      setProjName('');
      setSelectedId(project._id);
      loadTasks(project._id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadTasks(projectId) {
    try {
      setLoading(s => ({ ...s, tasks: true }));
      setError('');
      const res = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(s => ({ ...s, tasks: false }));
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      setError('');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedId, title: newTitle, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Create task failed');
      }
      setNewTitle('');
      setNewStatus('todo');
      await loadTasks(selectedId);
    } catch (e) {
      setError(e.message);
    }
  }

  function onPickProject(id) {
    setSelectedId(id);
    loadTasks(id);
  }

  return (
    <main className={styles.page}>
      <section className={styles.sidebar}>
        <h2 className={styles.h2}>Projects</h2>

        <form onSubmit={createProject} className={styles.row}>
          <input
            className={styles.input}
            placeholder="New project name"
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
          />
          <button className={styles.btn} disabled={!projName.trim()}>Create</button>
        </form>

        {loading.projects ? (
          <p className={styles.muted}>Loading projects…</p>
        ) : projects.length ? (
          <ul className={styles.list}>
            {projects.map(p => (
              <li key={p._id}>
                <button
                  className={`${styles.listItem} ${selectedId === p._id ? styles.active : ''}`}
                  onClick={() => onPickProject(p._id)}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>No projects yet.</p>
        )}
      </section>

      <section className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Task List</h1>
          {selectedId ? <span className={styles.badge}>Project selected</span> : null}
        </header>

        {error ? <p className={styles.error}>{error}</p> : null}

        {!selectedId ? (
          <p className={styles.muted}>Pick or create a project to view tasks.</p>
        ) : (
          <>
            <form onSubmit={createTask} className={styles.taskForm}>
              <input
                className={styles.input}
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <select
                className={styles.select}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button className={styles.btn} disabled={!newTitle.trim()}>Add Task</button>
            </form>

            {loading.tasks ? (
              <p className={styles.muted}>Loading tasks…</p>
            ) : tasks.length ? (
              <ul className={styles.tasks}>
                {tasks.map(t => (
                  <li key={t._id} className={styles.taskItem}>
                    <span className={styles.taskTitle}>{t.title}</span>
                    <span className={styles.taskStatus}>{t.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No tasks yet.</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
