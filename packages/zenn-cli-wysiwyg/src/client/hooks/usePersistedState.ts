import { useState, useMemo } from 'react';

// interface UsePersistedStateOptions<T> {
//   (arg: T): T;
// }
type AllowedValueType = number | string | boolean;

type UsePersistedStateOptions<T extends AllowedValueType> = {
  cacheKey: string;
  defaultValue: T;
};

/**
 * the state is persisted even when browser is reloaded.
 */
export function usePersistedState<T extends AllowedValueType>({
  cacheKey,
  defaultValue,
}: UsePersistedStateOptions<T>) {
  const initialValue = useMemo(() => {
    // restore initial state by localStorage
    const value = getStorageValue(cacheKey);
    if (value === null) return defaultValue;
    // check value type
    if (typeof value !== typeof defaultValue) {
      console.log(
        `Persisted value type(${typeof value}) is invalid. It must be ${typeof defaultValue}`
      );
      resetStorage();
      return defaultValue;
    }
    return value as T;
  }, []);

  const [state, setState] = useState<T>(initialValue);

  function resetStorage() {
    localStorage.removeItem(cacheKey);
  }

  function setPersistedState(value: T) {
    setState(value);
    setStorageValue(cacheKey, value);
  }
  const result: [T, (val: T) => void] = [state, setPersistedState];
  return result;
}

type StoragedObject = {
  value: AllowedValueType;
};

function resetStorageValue(key: string) {
  localStorage.removeItem(key);
}

// set stringified json to use non string value.
function setStorageValue(key: string, value: AllowedValueType) {
  const storagedObject: StoragedObject = { value };
  const storageRaw = JSON.stringify(storagedObject);
  localStorage.setItem(key, storageRaw);
}

function getStorageValue(key: string) {
  const storageRaw = localStorage.getItem(key);
  if (!storageRaw) return null;

  const storageObject: { [key: string]: unknown } = JSON.parse(storageRaw);

  if (typeof storageObject !== 'object' || storageObject === null) {
    resetStorageValue(key);
    return null;
  }
  return storageObject.value;
}
