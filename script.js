//* --------------DOM REFS------------------
const newListBtn = document.getElementById("newList");
const saveListsBtn = document.getElementById("saveLists");
const importListsBtn = document.getElementById("importLists");
const activeListBox = document.getElementById("activeListBox");
const listsPanelEl = document.getElementById("listsPanel");
const listsBoxEl = document.getElementById("listsBox");
const addNewListMenu = document.getElementById("addNewList");
const acceptNewListBtn = document.getElementById("acceptNewList");
const cancelNewListBtn = document.getElementById("cancelNewList");
const listName = document.getElementById("listName");
const activeListTasks = document.getElementById("activeList");
const addTaskBox = document.getElementById("addTaskBox");
const activeListTitle = document.getElementById("activeListTitle");

//* --------------GLOBAL VARIABLES------------------

let lists = [];
let activeList;

// Fixed data for weekly and grocery list styles
const categories = [
  "meat",
  "produce",
  "dry goods",
  "refrigerated",
  "frozen",
  "bakery",
  "household",
];
const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

//* --------------LISTENERS------------------

// Handles all clicks inside the active list area (tasks)
activeListBox.addEventListener("click", function (e) {
  const deleteBtn = e.target.closest(".deleteTask");
  const editBtn = e.target.closest(".editTask");

  if (deleteBtn) {
    const taskId = Number(deleteBtn.closest("li").dataset.id);
    activeList.tasks = activeList.tasks.filter((task) => task.id !== taskId);
    saveToLocalStorage();
    renderActiveList();
  }

  if (editBtn) {
    activateInlineEdit(editBtn.closest("li"), (li, newValue) => {
      const taskId = Number(li.dataset.id);
      const task = activeList.tasks.find((task) => task.id === taskId);
      task.text = newValue;
      saveToLocalStorage();
      renderActiveList();
    });
  }

  // Toggle task completion when checkbox is clicked
  if (e.target.type === "checkbox") {
    const taskId = Number(e.target.closest("li").dataset.id);
    const task = activeList.tasks.find((task) => task.id === taskId);
    task.completed = e.target.checked;
    saveToLocalStorage();
  }
});

// Handles all clicks inside the lists panel (list management)
listsPanelEl.addEventListener("click", function (e) {
  const delBtn = e.target.closest(".delList");
  const editBtn = e.target.closest(".editTitleList");
  const titleInput = e.target.closest("input[type='text']");

  if (delBtn) {
    const listId = Number(delBtn.closest("li").dataset.id);
    lists = lists.filter((list) => list.id !== listId);
    // If the deleted list was active, switch to first available or null
    if (activeList.id === listId) activeList = lists[0] || null;
    saveToLocalStorage();
    renderListsPanel();
    renderActiveList();
  }

  if (editBtn) {
    activateInlineEdit(editBtn.closest("li"), (li, newValue) => {
      const listId = Number(li.dataset.id);
      const list = lists.find((list) => list.id === listId);
      list.title = newValue;
      // If the edited list is also the active one, update activeList title too (SSOT)
      if (activeList && activeList.id === listId) activeList.title = newValue;
      saveToLocalStorage();
      renderListsPanel();
      renderActiveList();
    });
  }

  // Load a list as active when its title input is clicked (readOnly = not in edit mode)
  if (titleInput && titleInput.readOnly) {
    const listId = Number(titleInput.closest("li").dataset.id);
    activeList = lists.find((list) => list.id === listId);
    renderListsPanel();
    renderActiveList();
  }
});

newListBtn.addEventListener("click", () => addNewListMenu.showModal());
acceptNewListBtn.addEventListener("click", () => createList());
cancelNewListBtn.addEventListener("click", () => addNewListMenu.close());
saveListsBtn.addEventListener("click", () => exportLists());
importListsBtn.addEventListener("click", () => importLists());

// Visual feedback: briefly highlight any clicked button
document.addEventListener("click", function (e) {
  const btn = e.target.closest("button");
  if (btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 2000);
  }
});

//* --------------LOADING------------------

function loadApp() {
  const localLists = localStorage.getItem("lists");
  const localActiveList = localStorage.getItem("activeList");
  lists = localLists ? JSON.parse(localLists) : [];
  activeList = localActiveList ? JSON.parse(localActiveList) : lists[0] || null;
  renderListsPanel();
  renderActiveList();
}

//* --------------RENDER FUNCTIONS------------------

function renderListsPanel() {
  listsBoxEl.innerHTML = "";
  lists.forEach((list) => {
    const li = document.createElement("li");
    const title = document.createElement("input");
    const editBtn = document.createElement("button");
    const delBtn = document.createElement("button");

    li.dataset.id = list.id;
    title.type = "text";
    title.value = list.title;
    title.readOnly = true;
    editBtn.className = "editTitleList";
    delBtn.className = "delList";
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

    // Highlight the currently active list
    if (activeList && list.id === activeList.id) li.classList.add("active");

    li.append(title, editBtn, delBtn);
    listsBoxEl.append(li);
  });
}

function renderActiveList() {
  if (activeList === null) {
    renderEmptyList();
  } else {
    renderStyleFunctions[activeList.style]();
  }
}

function renderEmptyList() {
  activeListTasks.innerHTML = "";
  activeListTitle.textContent = "";
  addTaskBox.innerHTML = "";

  const noListText = document.createElement("p");
  const noListBtn = document.createElement("button");
  noListBtn.textContent = "Add new list";
  noListText.innerHTML = "There are no saved lists. Create a new one.";
  noListText.append(noListBtn);
  activeListTasks.append(noListText);
  noListBtn.addEventListener("click", () => addNewListMenu.showModal());
}

function renderBasicList() {
  activeListTasks.innerHTML = "";
  activeListTitle.textContent = activeList.title;
  activeList.tasks.forEach((task) => activeListTasks.append(createTaskElement(task)));
  renderTaskInput();
}

function renderWeeklyList() {
  activeListTasks.innerHTML = "";
  activeListTitle.textContent = activeList.title;
  const weekGrid = document.createElement("div");
  weekGrid.className = "weekGrid";

  days.forEach((day) => {
    const dayBox = createGroupBox(day, "dayBox");
    if (day === "sunday") dayBox.classList.add("sunday");
    activeList.tasks
      .filter((task) => task.day === day)
      .forEach((task) => dayBox.append(createTaskElement(task)));
    weekGrid.append(dayBox);
  });

  activeListTasks.append(weekGrid);
  renderTaskInput();
}

function renderGroceryList() {
  activeListTasks.innerHTML = "";
  activeListTitle.textContent = activeList.title;
  const groceryGrid = document.createElement("div");
  groceryGrid.className = "groceryGrid";

  categories.forEach((type) => {
    const categoryBox = createGroupBox(type, "categoryBox");
    if (type === "household") categoryBox.classList.add("household");
    activeList.tasks
      .filter((task) => task.type === type)
      .forEach((task) => categoryBox.append(createTaskElement(task)));
    groceryGrid.append(categoryBox);
  });

  activeListTasks.append(groceryGrid);
  renderTaskInput();
}

// Maps list style names to their render functions
const renderStyleFunctions = {
  basic: renderBasicList,
  weekly: renderWeeklyList,
  grocery: renderGroceryList,
};

// Renders the add-task input area based on the active list style
function renderTaskInput() {
  addTaskBox.innerHTML = "";

  const addTaskBtn = document.createElement("button");
  const text = document.createElement("input");
  addTaskBtn.innerHTML = "Add Task";
  addTaskBtn.addEventListener("click", () => createTask());
  text.type = "text";
  text.placeholder = "Task text...";
  text.id = "taskTextInput";

  // Weekly and grocery styles need a selector for day/category
  if (activeList.style === "weekly") {
    const select = createSelect(days, "taskDaySelect");
    addTaskBox.append(text, select, addTaskBtn);
  } else if (activeList.style === "grocery") {
    const select = createSelect(categories, "taskCategorySelect");
    addTaskBox.append(text, select, addTaskBtn);
  } else {
    addTaskBox.append(text, addTaskBtn);
  }
}

//* --------------ELEMENT FACTORIES------------------

// Creates a task list item with checkbox, text input, and edit/delete buttons
function createTaskElement(task) {
  const li = document.createElement("li");
  const check = document.createElement("input");
  const text = document.createElement("input");
  const editTaskBtn = document.createElement("button");
  const delTaskBtn = document.createElement("button");

  li.dataset.id = task.id;
  check.type = "checkbox";
  check.checked = task.completed;
  text.type = "text";
  text.readOnly = true;
  text.value = task.text;
  editTaskBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  delTaskBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  editTaskBtn.className = "editTask";
  delTaskBtn.className = "deleteTask";

  li.append(check, text, editTaskBtn, delTaskBtn);
  return li;
}

// Creates a labeled group box (used for day boxes and category boxes)
function createGroupBox(label, className) {
  const box = document.createElement("div");
  const heading = document.createElement("h4");
  heading.textContent = label;
  box.className = className;
  box.append(heading);
  return box;
}

// Creates a <select> element populated with given options
function createSelect(options, id) {
  const select = document.createElement("select");
  select.id = id;
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.textContent = opt;
    select.append(option);
  });
  return select;
}

// Activates inline editing on a list item's text input.
// onConfirm(li, newValue) is called when the user presses Enter.
function activateInlineEdit(li, onConfirm) {
  const textInput = li.querySelector("input[type='text']");
  textInput.focus();
  textInput.readOnly = false;

  // Disable nearby buttons so Enter doesn't accidentally trigger them
  const nearbyBtns = li.querySelectorAll("button");
  nearbyBtns.forEach((btn) => btn.setAttribute("tabindex", "-1"));

  textInput.addEventListener("keyup", function handler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Enter") {
      nearbyBtns.forEach((btn) => btn.removeAttribute("tabindex"));
      textInput.readOnly = true;
      onConfirm(li, textInput.value);
      textInput.removeEventListener("keyup", handler);
    }
  });
}

//* --------------DATA FUNCTIONS------------------

function createList() {
  const selectedStyle = document.querySelector('input[name="style"]:checked');
  if (!selectedStyle || !listName.value.trim()) {
    alert("Please enter a title for the list and choose a style.");
    return;
  }

  const newListObj = {
    id: Date.now(),
    style: selectedStyle.value,
    title: listName.value,
    tasks: [],
  };

  lists.push(newListObj);
  activeList = newListObj;
  addNewListMenu.close();
  saveToLocalStorage();
  renderListsPanel();
  renderActiveList();

  // Reset modal fields after creating the list
  listName.value = "";
  document.querySelector('input[name="style"]:checked').checked = false;
}

function createTask() {
  const taskText = document.querySelector("#taskTextInput").value;
  if (!taskText.trim()) return;

  // Build the base task object common to all styles
  const newTask = { id: Date.now(), text: taskText, completed: false };

  // Add the style-specific property (day or type) if applicable
  if (activeList.style === "weekly") {
    newTask.day = document.querySelector("#taskDaySelect")?.value ?? null;
  } else if (activeList.style === "grocery") {
    newTask.type = document.querySelector("#taskCategorySelect")?.value ?? null;
  }

  activeList.tasks.push(newTask);
  saveToLocalStorage();
  renderActiveList();
  document.querySelector("#taskTextInput").value = "";
}

//* --------------PERSISTENCE------------------

// Saves both the full list array and the active list to localStorage
function saveToLocalStorage() {
  localStorage.setItem("lists", JSON.stringify(lists));
  localStorage.setItem("activeList", JSON.stringify(activeList));
}

// Exports all lists as a downloadable JSON file
function exportLists() {
  const blob = new Blob([JSON.stringify(lists, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-TODO-lists.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Opens a file picker and imports lists from a JSON file
function importLists() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.click();
  input.addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = function (e) {
      lists = JSON.parse(e.target.result);
      activeList = lists[0] || null;
      saveToLocalStorage();
      renderListsPanel();
      renderActiveList();
    };
    reader.readAsText(input.files[0]);
  });
}

//* ----------------INIT--------------------
loadApp();
