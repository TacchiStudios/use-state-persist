import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';
import { isFunction } from './utils';
import { syncStorage } from './storage';
import { storageNamespace } from './constants';

export const useStatePersist = <T>(
  key: string,
  value?: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState(value);

  // Storage namespace
  const storageKey = storageNamespace + key;

  useEffect(() => {
    initialState();
    const unsubscribe = syncStorage.subscribe(storageKey, (data: T) => {
      setState(data);
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const initialState = async () => {
    await syncStorage.init();
    const data = syncStorage.getItem<T>(storageKey);
    setState(data);
  };

  const handlePersist = async (data: any) => {
    if (!data) {
      syncStorage.removeItem(storageKey);
    } else {
      syncStorage.setItem(storageKey, data);
    }
  };

  const updateState = useCallback(
    async (data: any | ((prevState: T) => T)) => {
      await syncStorage.init();
      let value = data;
      // Could be an anonymous function
      if (isFunction(data)) value = data(state);

      const newState = JSON.stringify(value);
      const currentState = JSON.stringify(state);
      const storedState = JSON.stringify(syncStorage.getItem<T>(storageKey));

      if (newState === currentState) return;

      setState(value);

      // Do not store if already saved
      if (newState === storedState) return;
      handlePersist(value);
    },
    // eslint-disable-next-line
    [state]
  );

  return [state as T, updateState as Dispatch<SetStateAction<T>>];
};
