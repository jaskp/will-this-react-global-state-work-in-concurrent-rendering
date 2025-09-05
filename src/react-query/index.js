import React, { useCallback, useSyncExternalStore } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

import {
  reducer,
  initialState,
  selectCount,
  incrementAction,
  doubleAction,
  createApp,
} from '../common';

const queryKey = ['counter'];

// Use an external store pattern similar to zustand/valtio
// This ensures that all components read from the same source of truth
class CounterStore {
  constructor() {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = newState;
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispatch(action) {
    this.setState(reducer(this.state, action));
  }
}

const store = new CounterStore();

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

const useCount = () => {
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getState.bind(store)
  );
  return selectCount(state);
};

const useIncrement = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    store.dispatch(incrementAction);
    // Update react-query cache to keep it in sync (optional)
    queryClient.setQueryData(queryKey, store.getState());
  }, [queryClient]);
};

const useDouble = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    store.dispatch(doubleAction);
    // Update react-query cache to keep it in sync (optional)
    queryClient.setQueryData(queryKey, store.getState());
  }, [queryClient]);
};

const Root = ({ children }) => (
  <QueryClientProvider client={client}>
    {children}
  </QueryClientProvider>
);

export default createApp(useCount, useIncrement, useDouble, Root);
