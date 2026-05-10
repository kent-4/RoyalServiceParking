const listeners = new Set();

const state = {
  initialized: false,
  session: {
    authenticated: false,
    role: null
  }
};

export function getAuthState() {
  return state;
}

export function subscribeAuthStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAuthState(nextState) {
  Object.assign(state, nextState, {
    session: {
      ...state.session,
      ...(nextState.session || {})
    }
  });

  listeners.forEach((listener) => listener(state));
}
