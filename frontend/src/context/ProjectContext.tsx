import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshProjects = async () => {
    if (!token) {
      setProjects([]);
      setActiveProject(null);
      return;
    }
    setIsLoading(true);
    try {
      const list = await api.getProjects();
      setProjects(list);
      if (list.length > 0) {
        if (!activeProject || !list.some(p => p.id === activeProject.id)) {
          setActiveProject(list[0]);
        } else {
          const updated = list.find(p => p.id === activeProject.id);
          if (updated) setActiveProject(updated);
        }
      } else {
        setActiveProject(null);
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [token]);

  return (
    <ProjectContext.Provider value={{ projects, activeProject, setActiveProject, isLoading, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};

