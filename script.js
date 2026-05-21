//* --------------DOM REFS------------------
const newList = document.getElementById("newList");
const saveListsBtn = document.getElementById("saveLists");
const importListsBtn = document.getElementById("importLists");
const activeListBox = document.getElementById("activeListBox");
const listsPanelEl = document.getElementById("listsPanel");
const listingListsEl = document.getElementById("listingLists");
const listsBoxEl = document.getElementById("listsBox");
const addNewListMenu = document.getElementById("addNewList");
const acceptNewListBtn = document.getElementById("acceptNewList");
const cancelNewListBtn = document.getElementById("cancelNewList");
const radioBasicStyle = document.getElementById("basicStyle");
const radioWeeklyStyle = document.getElementById("weeklyStyle");
const radioGroceryStyle = document.getElementById("groceryStyle");
const listName = document.getElementById("listName");
const activeListTasks = document.getElementById("activeList");
const addTaskBox = document.getElementById("addTaskBox");

//* --------------GLOBAL VARIABLES------------------

let lists = [];
let activeList;
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

activeListBox.addEventListener("click", function (e) {
  const deleteBtn = e.target.closest(".deleteTask");
  const editBtn = e.target.closest(".editTask");
  if (deleteBtn) {
    const li = deleteBtn.closest("li");
    const taskId = Number(li.dataset.id);
    activeList.tasks = activeList.tasks.filter((task) => task.id !== taskId);
    saveToLocalStorage();
    renderActiveList();
  }
  if (editBtn) {
    const li = editBtn.closest("li");
    const taskId = Number(li.dataset.id);
    const textInput = li.querySelector("input[type='text']");
    textInput.readOnly = false;
    textInput.focus();

    textInput.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Enter") {
          const task = activeList.tasks.find((task) => task.id === taskId);
          task.text = textInput.value;
          textInput.readOnly = true;
          saveToLocalStorage();
          renderActiveList();
        }
      },
      { once: true },
    );
  }
});

listsPanelEl.addEventListener("click", function (e) {
  const delBtn = e.target.closest(".delList");
  const editBtn = e.target.closest(".editTitleList");
  if (delBtn) {
    const li = delBtn.closest("li");
    const listId = Number(li.dataset.id);
    lists = lists.filter((list) => list.id !== listId);
    if (activeList.id === listId) {
      activeList = lists[0] || null;
    }
    saveToLocalStorage();
    renderListsPanel();
    renderActiveList();
  }
  if (editBtn) {
    const li = editBtn.closest("li");
    const listId = Number(li.dataset.id);
    const textInput = li.querySelector("input[type='text']");
    textInput.readOnly = false;
    textInput.focus();

    textInput.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Enter") {
          const list = lists.find((list) => list.id === listId);
          list.title = textInput.value;
          textInput.readOnly = true;
          saveToLocalStorage();
          renderListsPanel();
          renderActiveList();
        }
      },
      { once: true },
    );
  }
  const titleInput = e.target.closest("input[type='text']");
  if (titleInput && titleInput.readOnly) {
    const li = titleInput.closest("li");
    const listId = Number(li.dataset.id);
    activeList = lists.find((list) => list.id === listId);
    renderListsPanel();
    renderActiveList();
  }
});

newList.addEventListener("click", () => {
  addNewListMenu.showModal();
});

acceptNewListBtn.addEventListener("click", () => {
  createList();
});

cancelNewListBtn.addEventListener("click", () => {
  addNewListMenu.close();
});

saveListsBtn.addEventListener("click", () => {
  exportLists();
});

importListsBtn.addEventListener("click", () => {
  importLists();
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

function renderListsPanel() {
  listsBoxEl.innerHTML = "";
  lists.forEach((list) => {
    const li = document.createElement("li");
    const editBtn = document.createElement("button");
    const delBtn = document.createElement("button");
    const title = document.createElement("input");
    li.dataset.id = list.id;
    title.type = "text";
    title.value = list.title;
    title.readOnly = true;
    editBtn.className = "editTitleList";
    delBtn.className = "delList";
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    li.append(title);
    li.append(editBtn);
    li.append(delBtn);
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
  addTaskBox.innerHTML = "";
  const noListText = document.createElement("p");
  const noListBtn = document.createElement("button");
  noListBtn.textContent = "Add new list";
  noListText.innerHTML = "There are no saved lists. Create a new one.";
  noListText.append(noListBtn);
  activeListTasks.append(noListText);
  noListBtn.addEventListener("click", () => {
    addNewListMenu.showModal();
  });
}

function renderBasicList() {
  activeListTasks.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = activeList.title;
  activeListTasks.append(title);
  activeList.tasks.forEach((task) => {
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
    activeListTasks.append(li);
  });
  renderTaskInput();
}

function renderWeeklyList() {
  activeListTasks.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = activeList.title;
  activeListTasks.append(title);
  const weekGrid = document.createElement("div");
  weekGrid.className = "weekGrid";

  days.forEach((day) => {
    const dayBox = document.createElement("div");
    const dayLabel = document.createElement("h4");
    dayLabel.textContent = day;
    dayBox.className = "dayBox";
    if (day === "sunday") {
      dayBox.classList.add("sunday");
    }
    dayBox.append(dayLabel);

    const dayTasks = activeList.tasks.filter((task) => task.day === day);
    dayTasks.forEach((task) => {
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
      dayBox.append(li);
    });
    weekGrid.append(dayBox);
  });
  activeListTasks.append(weekGrid);
  renderTaskInput();
}

function renderGroceryList() {
  activeListTasks.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = activeList.title;
  activeListTasks.append(title);
  const groceryGrid = document.createElement("div");
  groceryGrid.className = "groceryGrid";

  categories.forEach((type) => {
    const categoryBox = document.createElement("div");
    const categoryLabel = document.createElement("h4");
    categoryLabel.textContent = type;
    categoryBox.className = "categoryBox";
    if (type === "household") {
      categoryBox.classList.add("household");
    }
    categoryBox.append(categoryLabel);

    const typeTasks = activeList.tasks.filter((task) => task.type === type);
    typeTasks.forEach((task) => {
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
      categoryBox.append(li);
    });
    groceryGrid.append(categoryBox);
  });
  activeListTasks.append(groceryGrid);
  renderTaskInput();
}

const renderStyleFunctions = {
  basic: renderBasicList,
  weekly: renderWeeklyList,
  grocery: renderGroceryList,
};

function renderTaskInput() {
  if (activeList.style === "basic") {
    addTaskBox.innerHTML = "";
    const addTaskBtn = document.createElement("button");
    const text = document.createElement("input");
    addTaskBtn.addEventListener("click", () => {
      createTask();
    });
    text.type = "text";
    text.value = "";
    text.id = "taskTextInput";
    addTaskBtn.innerHTML = "+";
    addTaskBox.append(addTaskBtn, text);
  } else if (activeList.style === "weekly") {
    addTaskBox.innerHTML = "";
    const addTaskBtn = document.createElement("button");
    const text = document.createElement("input");
    const selectWeekly = document.createElement("select");
    addTaskBtn.addEventListener("click", () => {
      createTask();
    });
    text.type = "text";
    text.value = "";
    text.id = "taskTextInput";
    addTaskBtn.innerHTML = "+";
    selectWeekly.id = "taskDaySelect";
    days.forEach((type) => {
      const daysOp = document.createElement("option");
      daysOp.textContent = type;
      selectWeekly.append(daysOp);
    });
    addTaskBox.append(addTaskBtn, text, selectWeekly);
  } else if (activeList.style === "grocery") {
    addTaskBox.innerHTML = "";
    const addTaskBtn = document.createElement("button");
    const text = document.createElement("input");
    const selectGrocery = document.createElement("select");
    addTaskBtn.addEventListener("click", () => {
      createTask();
    });
    text.type = "text";
    text.value = "";
    text.id = "taskTextInput";
    addTaskBtn.innerHTML = "+";
    selectGrocery.id = "taskCategorySelect";
    categories.forEach((type) => {
      const categoryOp = document.createElement("option");
      categoryOp.textContent = type;
      selectGrocery.append(categoryOp);
    });
    addTaskBox.append(addTaskBtn, text, selectGrocery);
  }
}

//TODO: - function createTaskElement(task), for common elements: li, check, text, editBtn, delBtn.

//*------------------CREATE THINGS---------------

function createList() {
  const selectedStyle = document.querySelector('input[name="style"]:checked');
  if (!selectedStyle || !listName.value.trim()) {
    alert("Please enter a title for the list and choose a style.");
    return;
  }
  const newListObj = {
    id: Date.now(),
    style: selectedStyle.value, // recoger del modal
    title: listName.value, // recoger del modal
    tasks: [],
  };
  lists.push(newListObj);
  activeList = newListObj;
  addNewListMenu.close();
  saveToLocalStorage();
  renderListsPanel();
  renderActiveList();
  listName.value = "";
  radioBasicStyle.checked = false;
  radioWeeklyStyle.checked = false;
  radioGroceryStyle.checked = false;
}

function createTask() {
  const taskText = document.querySelector("#taskTextInput").value;
  let newTaskObj;
  if (activeList.style === "basic") {
    newTaskObj = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };
    activeList.tasks.push(newTaskObj);
  } else if (activeList.style === "weekly") {
    const daySelect = document.querySelector("#taskDaySelect");
    newTaskObj = {
      id: Date.now(),
      text: taskText,
      completed: false,
      day: daySelect ? daySelect.value : null,
    };
    activeList.tasks.push(newTaskObj);
  } else if (activeList.style === "grocery") {
    const categorySelect = document.querySelector("#taskCategorySelect");
    newTaskObj = {
      id: Date.now(),
      text: taskText,
      completed: false,
      type: categorySelect ? categorySelect.value : null,
    };
    activeList.tasks.push(newTaskObj);
  }
  saveToLocalStorage();
  renderActiveList();
  document.querySelector("#taskTextInput").value = "";
}

//*------------------SAVING---------------

function saveToLocalStorage() {
  localStorage.setItem("lists", JSON.stringify(lists));
  localStorage.setItem("activeList", JSON.stringify(activeList));
}

function exportLists() {
  const json = JSON.stringify(lists, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-TODO-lists.json";
  a.click();
  URL.revokeObjectURL(url);
}

//*------------------IMPORT----------------

function importLists() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.click();
  input.addEventListener("change", function () {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = JSON.parse(e.target.result);
      lists = data;
      activeList = lists[0] || null;
      saveToLocalStorage();
      renderListsPanel();
      renderActiveList();
    };
    reader.readAsText(file);
  });
}

//* ----------------INIT--------------------
loadApp();
