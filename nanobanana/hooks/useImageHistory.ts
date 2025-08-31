
import { useState, useEffect, useCallback } from 'react';
import type { ImageRecord } from '../types';

const STORAGE_KEY = 'nanoBananaImageHistory';

export const useImageHistory = () => {
  const [history, setHistory] = useState<ImageRecord[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
    }
  }, []);

  const addImageToHistory = useCallback((image: Omit<ImageRecord, 'id' | 'timestamp'>) => {
    setHistory(prevHistory => {
      const newRecord: ImageRecord = {
        ...image,
        id: new Date().toISOString() + Math.random(),
        timestamp: Date.now(),
      };
      const updatedHistory = [newRecord, ...prevHistory];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage:", error);
      }
      return updatedHistory;
    });
  }, []);

  return { history, addImageToHistory };
};
