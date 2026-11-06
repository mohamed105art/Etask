import React, { useState, useEffect } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksTableView } from './components/TasksTableView';
import { TodayBoardView } from './components/TodayBoardView';
import { BacklogView } from './components/BacklogView';
import { CalendarView } from './components/CalendarView';
import { AuditLogView } from './components/AuditLogView';
import { TrashView } from './components/TrashView';
import { SettingsView } from './components/SettingsView';
import { MissionReportView } from './components/MissionReportView';
import { TaskModal } from './components/TaskModal';
import { FastCaptureModal } from './components/FastCaptureModal';
import { TaskPreviewModal } from './components/TaskPreviewModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Task } from './types/tasks';

function MainLayout() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>(undefined);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isFastCaptureOpen, setIsFastCaptureOpen] = useState(false);
  const [taskToPreview, setTaskToPreview] = useState<Task | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const { setFilters } = useTasks();

  // Listen for Ctrl+K, Ctrl+B, Alt+S, and custom events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      } else if (((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) || (e.altKey && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    const handleCustomSearchEvent = () => {
      setIsGlobalSearchOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-global-search', handleCustomSearchEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-global-search', handleCustomSearchEvent);
    };
  }, []);

  const handleOpenNewTask = (date?: string) => {
    setTaskToEdit(null);
    setTaskModalInitialDate(date);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setTaskToPreview(task);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Smart Slide-in Drawer Sidebar (#app-sidebar) */}
      <Sidebar
        currentView={currentView}
        onSelectView={view => setCurrentView(view)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenNewTaskModal={() => handleOpenNewTask()}
        onOpenFastCaptureModal={() => setIsFastCaptureOpen(true)}
      />

      {/* Main Full-Width Content Canvas */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Sticky 58px Glassmorphic Top Navbar */}
        <Header
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Viewport Content Container */}
        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={view => setCurrentView(view)}
              onOpenNewTaskModal={date => handleOpenNewTask(date)}
              onEditTask={task => handleEditTask(task)}
              onViewTask={task => handleViewTask(task)}
            />
          )}

          {currentView === 'tasks' && (
            <TasksTableView
              onEditTask={task => handleEditTask(task)}
              onViewTask={task => handleViewTask(task)}
            />
          )}

          {currentView === 'today' && (
            <TodayBoardView
              onOpenNewTaskModal={date => handleOpenNewTask(date)}
              onEditTask={task => handleEditTask(task)}
              onViewTask={task => handleViewTask(task)}
            />
          )}

          {currentView === 'backlog' && (
            <BacklogView
              onOpenNewTaskModal={() => handleOpenNewTask()}
              onEditTask={task => handleEditTask(task)}
              onViewTask={task => handleViewTask(task)}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              onOpenNewTaskModal={date => handleOpenNewTask(date)}
              onEditTask={task => handleEditTask(task)}
              onViewTask={task => handleViewTask(task)}
            />
          )}

          {currentView === 'report' && (
            <MissionReportView />
          )}

          {currentView === 'audit' && (
            <AuditLogView />
          )}

          {currentView === 'trash' && (
            <TrashView />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Task Creation & Editing Modal (6 Stages) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        initialDate={taskModalInitialDate}
      />

      {/* Fast Quick Capture Modal */}
      <FastCaptureModal
        isOpen={isFastCaptureOpen}
        onClose={() => setIsFastCaptureOpen(false)}
      />

      {/* Task Preview Modal */}
      <TaskPreviewModal
        task={taskToPreview}
        onClose={() => setTaskToPreview(null)}
        onEdit={task => handleEditTask(task)}
      />

      {/* Global Search & Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onViewTask={task => handleViewTask(task)}
        onEditTask={task => handleEditTask(task)}
        onNavigateToRegistry={task => {
          setFilters({ searchQuery: task.title });
          setCurrentView('tasks');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <MainLayout />
    </TaskProvider>
  );
}
