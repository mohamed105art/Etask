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
import { ErrorBoundary } from './components/ErrorBoundary';
import { Task } from './types/tasks';
import { BarChart3, Sun, Plus, ClipboardList, Search } from 'lucide-react';

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

  const { setFilters, kpiStats } = useTasks();

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
    <div className="min-h-screen bg-[#12131C] text-white flex flex-col font-sans selection:bg-[#59718A]/30">
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
        {/* Top Navbar */}
        <Header
          currentView={currentView}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Viewport Content Container */}
        <main className="flex-1 p-3.5 sm:p-6 pb-20 sm:pb-6 max-w-7xl w-full mx-auto">
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

      {/* Mobile Quick Bottom Navigation Bar (sm:hidden) */}
      <nav 
        aria-label="شريط التنقل السريع للهاتف"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1B1D2A]/95 backdrop-blur-md border-t border-white/10 px-3 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'dashboard' ? 'text-[#59718A] font-bold' : 'text-[#8E91A0] hover:text-white'
          }`}
          title="لوحة القيادة"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('today')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'today' ? 'text-[#D4A72C] font-bold' : 'text-[#8E91A0] hover:text-white'
          }`}
          title="لوحة اليوم"
        >
          <Sun className="w-5 h-5" />
          <span className="text-[10px]">اليوم</span>
          {kpiStats.todayTasks > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#D4A72C] text-[#12131C] text-[9px] font-bold flex items-center justify-center font-sans tabular-nums">
              {kpiStats.todayTasks}
            </span>
          )}
        </button>

        {/* Center Primary Action Button: + مهمة */}
        <button
          type="button"
          onClick={() => handleOpenNewTask()}
          className="w-11 h-11 -mt-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-[#1B1D2A] transition-transform active:scale-90 cursor-pointer"
          title="مهمة جديدة"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('tasks')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'tasks' ? 'text-[#59718A] font-bold' : 'text-[#8E91A0] hover:text-white'
          }`}
          title="سجل المهام"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">السجل</span>
        </button>

        <button
          type="button"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[#8E91A0] hover:text-white transition-colors cursor-pointer"
          title="بحث شامل"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">بحث</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <MainLayout />
      </TaskProvider>
    </ErrorBoundary>
  );
}
