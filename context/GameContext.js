// context/GameContext.js
import React, { createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { addScore, getUserBest, dbBackend } from '../utils/db';

// Create context
export const GameContext = createContext();

/**
 * GameProvider exposes:
 *  - saveScore(score) -> saves score only if user is logged in (returns true if saved)
 *  - getBestForCurrentUser() -> returns user's best score (0 if none or not logged in)
 */
export const GameProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  /**
   * saveScore
   * - If user not logged in -> do not save, return false
   * - If DB operation fails -> return false
   * - Otherwise returns true
   */
  const saveScore = async (score) => {
    try {
      if (!user?.username) {
        // Guest — do not save
        console.log('GameContext: guest play — score not saved', score);
        return false;
      }

      // addScore is defined in utils/db (handles sqlite or AsyncStorage)
      await addScore(user.username, score);
      console.log(`GameContext: saved score for ${user.username}:`, score, '(backend:', dbBackend, ')');
      return true;
    } catch (err) {
      console.log('GameContext.saveScore error:', err);
      return false;
    }
  };

  /**
   * getBestForCurrentUser
   */
  const getBestForCurrentUser = async () => {
    try {
      if (!user?.username) return 0;
      const best = await getUserBest(user.username);
      return best || 0;
    } catch (err) {
      console.log('GameContext.getBestForCurrentUser error:', err);
      return 0;
    }
  };

  return (
    <GameContext.Provider value={{ saveScore, getBestForCurrentUser }}>
      {children}
    </GameContext.Provider>
  );
};
