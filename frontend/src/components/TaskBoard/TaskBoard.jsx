import React from 'react';
import StatusPill from '../StatusPill/StatusPill.jsx';
import './TaskBoard.css';

const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const labels = { TODO:'To Do', IN_PROGRESS:'In Progress', REVIEW:'Review', DONE:'Done' };

export default function TaskBoard({ tasks = [], onMove, onDelete }) {
  return (
    <div className="kanban-board">
      {statuses.map((status) => {
        const items = tasks.filter((task) => task.status === status);
        return (
          <section className="kanban-column" key={status}>
            <div className="column-heading"><h2>{labels[status]}</h2><span>{items.length}</span></div>
            <div className="task-stack">
              {items.map((task) => (
                <article className="task-card" key={task._id}>
                  <div className="task-card-head"><h3>{task.title}</h3><StatusPill value={task.priority} /></div>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta"><StatusPill value={task.type} /><span>{task.storyPoints || 0} pts</span><span>{task.assignee?.name || 'Unassigned'}</span></div>
                  {task.dueDate && <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>}
                  {task.blockerReason && <small className="blocker">Blocker: {task.blockerReason}</small>}
                  <div className="task-actions">
                    {status !== 'TODO' && <button type="button" onClick={() => onMove?.(task, 'TODO')}>To Do</button>}
                    {status !== 'IN_PROGRESS' && <button type="button" onClick={() => onMove?.(task, 'IN_PROGRESS')}>Progress</button>}
                    {status !== 'REVIEW' && <button type="button" onClick={() => onMove?.(task, 'REVIEW')}>Review</button>}
                    {status !== 'DONE' && <button type="button" onClick={() => onMove?.(task, 'DONE')}>Done</button>}
                    <button type="button" className="delete" onClick={() => onDelete?.(task._id)}>×</button>
                  </div>
                </article>
              ))}
              {!items.length && <p className="empty small">No items</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
