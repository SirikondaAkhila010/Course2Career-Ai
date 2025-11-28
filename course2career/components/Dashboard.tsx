import React, { useMemo, useState } from 'react';
import type { Page, ApplicationStatus, Task } from '../types';
import { MOCK_JOBS } from '../constants';
import ApplicationTracker from './ApplicationTracker';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  applicationStatuses: Record<number, ApplicationStatus>;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onReorderTasks: (reorderedTasks: Task[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  applicationStatuses,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onReorderTasks,
}) => {
    const trackedJobs = useMemo(
        () => MOCK_JOBS.filter(job => applicationStatuses[job.id]),
        [applicationStatuses]
    );
    const [newTaskText, setNewTaskText] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const totalApplications = trackedJobs.length;
    const activeApplications = trackedJobs.filter(job => applicationStatuses[job.id] && applicationStatuses[job.id] !== 'Rejected').length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const taskCompletionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            onAddTask(newTaskText);
            setNewTaskText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnter = (index: number) => {
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault(); // Necessary to allow onDrop to fire.
    };

    const handleDrop = () => {
        if (draggedIndex !== null && dragOverIndex !== null) {
            const newTasks = [...tasks];
            const [draggedItem] = newTasks.splice(draggedIndex, 1);
            newTasks.splice(dragOverIndex, 0, draggedItem);
            onReorderTasks(newTasks);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <section className="bg-gradient-to-r from-primary to-primary-focus text-white rounded-2xl p-8 shadow-lg flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70">Career Control Center</p>
                    <h1 className="mt-2 text-3xl font-bold">Stay on top of your search</h1>
                    <p className="mt-2 text-white/80 max-w-2xl">
                        Review your applications, organize next steps, and jump back into the job hunt without feeling overwhelmed.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => onNavigate('job-search')}
                            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary hover:bg-white"
                        >
                            <BriefcaseIcon className="h-4 w-4 text-primary" />
                            Explore Jobs
                        </button>
                        <button
                            onClick={() => onNavigate('resume-builder')}
                            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            Refresh Resume
                        </button>
                    </div>
                </div>
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 w-full lg:w-80">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Quick Snapshot</p>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Active Applications</span>
                            <span className="text-2xl font-bold">{activeApplications}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Tracked Roles</span>
                            <span className="text-2xl font-bold">{totalApplications}</span>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-white/80 text-sm">
                                <span>Task Progress</span>
                                <span>{taskCompletionRate}%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-white/20">
                                <div
                                    className="h-full rounded-full bg-white transition-all"
                                    style={{ width: `${taskCompletionRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-1 bg-white dark:bg-secondary rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-secondary-focus">
                    <div className="flex items-center gap-3">
                        <BriefcaseIcon className="h-10 w-10 text-primary" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-secondary-content/80">Applications</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeApplications}</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-secondary-content/80">
                        Keep tracking roles that matter. Update statuses from the tracker below.
                    </p>
                </div>
                <div className="col-span-1 bg-white dark:bg-secondary rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-secondary-focus">
                    <div className="flex items-center gap-3">
                        <ClipboardListIcon className="h-10 w-10 text-primary" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-secondary-content/80">Active Tasks</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tasks.length - completedTasks}</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500 dark:text-secondary-content/80">
                        Break the search into small wins and drag to prioritize.
                    </p>
                </div>
                <div className="col-span-1 bg-white dark:bg-secondary rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-secondary-focus">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-10 w-10 text-primary" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-secondary-content/80">Next Steps</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">3 suggestions</p>
                        </div>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-secondary-content/80">
                        <li>• Review saved jobs</li>
                        <li>• Schedule mock interview</li>
                        <li>• Follow up on top application</li>
                    </ul>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ApplicationTracker
                    trackedJobs={trackedJobs}
                    applicationStatuses={applicationStatuses}
                    onNavigate={onNavigate}
                />

                <div className="bg-white dark:bg-secondary shadow rounded-2xl p-6 border border-gray-100 dark:border-secondary-focus h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ClipboardListIcon className="h-8 w-8 text-primary" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Tasks</h2>
                        </div>
                        {tasks.length > 0 && (
                            <p className="text-sm text-gray-500 dark:text-secondary-content/80">
                                {completedTasks}/{tasks.length} completed
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a task to keep momentum..."
                            className="flex-grow w-full px-4 py-3 border border-gray-200 dark:border-secondary-focus rounded-xl bg-base-100 dark:bg-secondary-focus text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                            onClick={handleAddTask}
                            className="p-3 text-white bg-primary rounded-xl hover:bg-primary-focus transition-colors"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-secondary-focus py-10 text-center text-gray-500 dark:text-secondary-content/80">
                            <ClipboardListIcon className="h-10 w-10 text-gray-400 mb-3" />
                            <p className="font-semibold">No tasks yet</p>
                            <p className="text-sm">Add a few reminders to stay organized.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {tasks.map((task, index) => {
                                const isBeingDragged = draggedIndex === index;
                                const isDraggedOver = dragOverIndex === index;
                                return (
                                    <li
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onDragEnd={handleDragEnd}
                                        className={`relative flex items-center gap-3 rounded-xl border border-gray-100 dark:border-secondary-focus bg-base-100 dark:bg-secondary-focus/60 px-4 py-3 transition-all duration-200 group ${
                                            isBeingDragged ? 'opacity-40' : 'opacity-100'
                                        }`}
                                    >
                                        {isDraggedOver && (
                                            <div className="absolute top-[-4px] left-4 right-4 h-1 bg-primary rounded-full" />
                                        )}
                                        <DragHandleIcon className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => onToggleTask(task.id)}
                                            className="checkbox checkbox-primary checkbox-sm"
                                        />
                                        <span className={`flex-grow text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                            {task.text}
                                        </span>
                                        <button
                                            onClick={() => onDeleteTask(task.id)}
                                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;