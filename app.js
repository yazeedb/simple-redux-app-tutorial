const actionTypes = {
  addedTodo: 'ADDED_TODO',
  toggleTodo: 'TOGGLE_TODO',
  deletedTodo: 'DELETED_TODO'
};

const actions = {
  addTodo: (text) => {
    return {
      type: actionTypes.addedTodo,
      payload: text
    };
  },
  toggleTodo: (id) => {
    return {
      type: actionTypes.toggleTodo,
      payload: id
    };
  },
  deletedTodo: (id) => {
    return {
      type: actionTypes.deletedTodo,
      payload: id
    };
  }
};

const initialState = {
  todos: [],
  globalId: 0
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.addedTodo:
      const newTodo = {
        text: action.payload,
        id: state.globalId,
        completed: false
      };

      return {
        todos: [...state.todos, newTodo],
        globalId: state.globalId + 1
      };

    case actionTypes.toggleTodo:
      return {
        ...state,
        todos: state.todos.map((t) => {
          if (t.id === action.payload) {
            return { ...t, completed: !t.completed };
          }

          return t;
        })
      };

    case actionTypes.deletedTodo:
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload)
      };
  }
};

const createStore = (reducer) => {
  let listeners = [];
  let currentState = reducer(undefined, {});

  return {
    getState: () => currentState,
    dispatch: (action) => {
      currentState = reducer(currentState, action);

      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (newListener) => {
      listeners.push(newListener);

      const unsubscribe = () => {
        listeners = listeners.filter((l) => l !== newListener);
      };

      return unsubscribe;
    }
  };
};

const store = createStore(reducer);

const renderView = (todos) => {
  const todoList = document.querySelector('ul');
  todoList.innerHTML = null;

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.classList.toggle('completed', todo.completed);

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.toggleAttribute('checked', todo.completed);

    checkbox.addEventListener('click', () => {
      store.dispatch(actions.toggleTodo(todo.id));
    });

    const textLabel = document.createElement('label');
    textLabel.innerHTML = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'X';
    deleteButton.addEventListener('click', () => {
      store.dispatch(actions.deletedTodo(todo.id));
    });

    li.append(checkbox, textLabel, deleteButton);

    todoList.appendChild(li);
  });
};

const init = () => {
  const input = document.querySelector('input');

  input.addEventListener('keyup', (event) => {
    const value = event.target.value.trim();

    if (!value) {
      return;
    }

    const ENTER_KEYCODE = 13;

    if (event.keyCode === ENTER_KEYCODE) {
      store.dispatch(actions.addTodo(value));

      event.target.value = '';
    }
  });

  store.subscribe(() => {
    const state = store.getState();

    renderView(state.todos);
  });
};

init();
