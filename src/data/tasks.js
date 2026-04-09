const tasks = [];
let nextId = 1;

export function listTasks() {
  return tasks;
}

export function getTaskById(id) {
  return tasks.find((task) => task.id === id) || null;
}

export function createTask(payload) {
  const task = {
    id: nextId,
    title: payload.title,
    description: payload.description || "",
    completed: payload.completed === true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(task);
  nextId += 1;
  return task;
}

export function updateTask(id, payload) {
  const task = getTaskById(id);

  if (!task) {
    return null;
  }

  if (typeof payload.title === "string") {
    task.title = payload.title;
  }

  if (typeof payload.description === "string") {
    task.description = payload.description;
  }

  if (typeof payload.completed === "boolean") {
    task.completed = payload.completed;
  }

  task.updatedAt = new Date().toISOString();
  return task;
}

export function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
}

export function resetTasksStore() {
  tasks.length = 0;
  nextId = 1;
}
