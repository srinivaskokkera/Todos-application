const todoItemsContainer = document.getElementById("todoItemsContainer");
const todoForm = document.getElementById("todoForm");
const todoUserInput = document.getElementById("todoUserInput");
const saveTodoButton = document.getElementById("saveTodoButton");
const clearCompletedButton = document.getElementById("clearCompletedButton");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const taskSummary = document.getElementById("taskSummary");
const emptyState = document.getElementById("emptyState");
const saveStatus = document.getElementById("saveStatus");
const currentDate = document.getElementById("currentDate");

let todoList = loadTodoList();
let currentFilter = "all";

function loadTodoList() {
    try {
        const saved = localStorage.getItem("todoList");
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveTodoList() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
    saveStatus.textContent = "Saved just now.";
    window.clearTimeout(saveTodoList.timer);
    saveTodoList.timer = window.setTimeout(() => {
        saveStatus.textContent = "Changes are saved locally.";
    }, 1800);
}

function updateDate() {
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function updateStats() {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.isChecked).length;
    const remaining = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;
    progressText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;

    if (total === 0) {
        taskSummary.textContent = "No tasks yet. Add your first task above.";
    } else {
        taskSummary.textContent = `${remaining} remaining • ${completed} completed`;
    }

    emptyState.style.display = getVisibleTodos().length === 0 ? "block" : "none";
}

function getVisibleTodos() {
    if (currentFilter === "active") {
        return todoList.filter(todo => !todo.isChecked);
    }

    if (currentFilter === "completed") {
        return todoList.filter(todo => todo.isChecked);
    }

    return todoList;
}

function createTodoElement(todo, index) {
    const todoElement = document.createElement("li");
    todoElement.className = "todo-item-container";
    todoElement.id = `todo${todo.uniqueNo}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox-input";
    checkbox.checked = todo.isChecked;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as complete`);

    const labelContainer = document.createElement("div");
    labelContainer.className = "label-container";

    const label = document.createElement("label");
    label.className = "checkbox-label";
    label.textContent = todo.text;

    if (todo.isChecked) {
        label.classList.add("checked");
    }

    checkbox.addEventListener("change", () => {
        todo.isChecked = checkbox.checked;
        renderTodos();
        saveTodoList();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-icon";
    deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);
    deleteButton.textContent = "✕";

    deleteButton.addEventListener("click", () => {
        todoList = todoList.filter(item => item.uniqueNo !== todo.uniqueNo);
        renderTodos();
        saveTodoList();
    });

    labelContainer.appendChild(label);
    labelContainer.appendChild(deleteButton);
    todoElement.appendChild(checkbox);
    todoElement.appendChild(labelContainer);

    return todoElement;
}

function renderTodos() {
    todoItemsContainer.textContent = "";

    const visibleTodos = getVisibleTodos();

    visibleTodos.forEach((todo, index) => {
        todoItemsContainer.appendChild(createTodoElement(todo, index));
    });

    updateStats();
}

function addTodo() {
    const text = todoUserInput.value.trim();

    if (!text) {
        todoUserInput.focus();
        todoUserInput.setCustomValidity("Please enter a task.");
        todoForm.reportValidity();
        todoUserInput.setCustomValidity("");
        return;
    }

    todoList.unshift({
        text,
        uniqueNo: Date.now(),
        isChecked: false
    });

    todoUserInput.value = "";
    currentFilter = "all";
    document.querySelectorAll(".filter-button").forEach(button => {
        button.classList.toggle("active", button.dataset.filter === "all");
    });

    renderTodos();
    saveTodoList();
    todoUserInput.focus();
}

todoForm.addEventListener("submit", event => {
    event.preventDefault();
    addTodo();
});

saveTodoButton.addEventListener("click", saveTodoList);

clearCompletedButton.addEventListener("click", () => {
    todoList = todoList.filter(todo => !todo.isChecked);
    renderTodos();
    saveTodoList();
});

document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-button").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTodos();
    });
});

updateDate();
renderTodos();
