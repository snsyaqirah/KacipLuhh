import { useState, useCallback } from 'react';

export function usePresence() {
  const [users, setUsers] = useState([]);

  const onPresenceUpdate = useCallback((updatedUsers) => {
    setUsers(updatedUsers);
  }, []);

  return { users, onPresenceUpdate };
}
