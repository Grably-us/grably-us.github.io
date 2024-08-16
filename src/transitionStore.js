import { writable } from 'svelte/store';

function createTransitionStore() {
  const { subscribe, set, update } = writable({
    transitioning: false,
    currentRoute: '/',
  });

  return {
    subscribe,
    startTransition: (newRoute) => {
      update(state => ({ ...state, transitioning: true, currentRoute: newRoute }));
    },
    endTransition: () => {
      update(state => ({ ...state, transitioning: false }));
    },
  };
}

export const transitionStore = createTransitionStore();