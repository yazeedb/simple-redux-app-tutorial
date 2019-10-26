// Redux from scratch :)
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

const actionTypes = {
  addedTodo: 'ADDED_TODO',
  toggleTodo: 'TOGGLE_TODO',
  deletedTodo: 'DELETED_TODO',
  changeVisibilityFilter: 'CHANGE_VISIBILITY_FILTER'
};

const actions = {
  changeVisibilityFilter: (newFilter) => {
    return {
      type: actionTypes.changeVisibilityFilter,
      payload: newFilter
    };
  },
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
  globalId: 0,
  visbilityFilter: 'ALL'
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.changeVisibilityFilter:
      console.log('CHANGING FILTER', action);
      return {
        ...state,
        visbilityFilter: action.payload
      };

    case actionTypes.addedTodo:
      const newTodo = {
        text: action.payload,
        id: state.globalId,
        completed: false
      };

      return {
        ...state,
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

    default:
      return state;
  }
};

const store = createStore(reducer);

const filterTodos = (todos, visbilityFilter) => {
  switch (visbilityFilter) {
    case 'ALL':
      return todos;

    case 'ACTIVE':
      return todos.filter((t) => t.completed === false);

    case 'COMPLETED':
      return todos.filter((t) => t.completed === true);
  }
};

const renderView = (todos, visbilityFilter) => {
  const todoList = document.querySelector('.todos');
  todoList.innerHTML = null;

  filterTodos(todos, visbilityFilter).forEach((todo) => {
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
    deleteButton.classList.add('delete');
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

  const filterAllButton = document.querySelector('.filter-all');
  const filterActiveButton = document.querySelector('.filter-active');
  const filterCompletedButton = document.querySelector('.filter-completed');

  filterAllButton.addEventListener('click', () => {
    const action = actions.changeVisibilityFilter('ALL');

    store.dispatch(action);
  });

  filterActiveButton.addEventListener('click', () => {
    const action = actions.changeVisibilityFilter('ACTIVE');

    store.dispatch(action);
  });

  filterCompletedButton.addEventListener('click', () => {
    const action = actions.changeVisibilityFilter('COMPLETED');

    store.dispatch(action);
  });

  store.subscribe(() => {
    const state = store.getState();

    renderView(state.todos, state.visbilityFilter);
  });
};

init();
