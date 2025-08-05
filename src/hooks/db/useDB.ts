import { useState, useEffect } from 'react';
import { initializeDatabase } from '../../services/init-service/init.service';

export const useDB = () => {
  const [isDBReady, setIsDBReady] = useState(false);
  const [dbError, setDBError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializeDatabase();
        setIsDBReady(success);
      } catch (err) {
        setDBError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    };
    init();
  }, []);

  return { isDBReady, dbError };
};