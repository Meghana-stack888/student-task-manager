const form = document.querySelector("form");
const input = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const priorityInput = document.getElementById("priority");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");

// submit
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = input.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const priority = priorityInput.value;

    if (!taskText || !date || !time) return;

    const deadline = date + "T" + time;

    createTask(taskText, false, deadline, priority);
    updateDashboard();

    input.value = "";
    dateInput.value = "";
    timeInput.value = "";

    saveTasks();
});

// create task
function createTask(taskText, isCompleted, deadline, priority) {
    const li = document.createElement("li");

    // LEFT SIDE
    const textContainer = document.createElement("div");

    const span = document.createElement("span");
    span.textContent = taskText;

    if (isCompleted) span.classList.add("completed");

    span.addEventListener("click", function() {
        span.classList.toggle("completed");
        saveTasks();
        updateDashboard();
    });

    const timeEl = document.createElement("small");

    if (deadline) {
        const dateObj = new Date(deadline);

        const formatted =
            dateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            }) +
            ", " +
            dateObj.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });

        timeEl.textContent = formatted;

        // ⭐ IMPORTANT: store original value
        timeEl.dataset.deadline = deadline;
    }

    textContainer.appendChild(span);
    const badge = document.createElement("small");
badge.classList.add("priority-badge");

if (priority === "High") {
    badge.textContent = "🔴 High";
    badge.classList.add("high");
}
else if (priority === "Medium") {
    badge.textContent = "🟡 Medium";
    badge.classList.add("medium");
}
else {
    badge.textContent = "🟢 Low";
    badge.classList.add("low");
}

textContainer.appendChild(badge);
    textContainer.appendChild(timeEl);

    // RIGHT SIDE
    const btnContainer = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        const newText = prompt("Edit your task:", span.textContent);
        if (newText) {
            span.textContent = newText;
            saveTasks();
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        li.remove();
        saveTasks();
        updateDashboard();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(textContainer);
    li.appendChild(btnContainer);

    taskList.appendChild(li);
}

// save tasks
function saveTasks() {
    const tasks = [];

    document.querySelectorAll("#taskList li").forEach(function(li) {
        const span = li.querySelector("span");
        const timeEl = li.querySelector("small");

        tasks.push({
            text: span.textContent,
            completed: span.classList.contains("completed"),
            deadline: timeEl?.dataset.deadline || ""
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// load tasks
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    savedTasks.forEach(function(task) {
        createTask(task.text, task.completed, task.deadline);
    });
}

loadTasks();
updateDashboard();
// filter
function filterTasks(type) {
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(function(task) {
        const span = task.querySelector("span");

        if (type === "all") {
            task.style.display = "flex";
        } else if (type === "completed") {
            task.style.display = span.classList.contains("completed") ? "flex" : "none";
        } else {
            task.style.display = !span.classList.contains("completed") ? "flex" : "none";
        }
    });
}

// search
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function() {
    const searchText = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(function(task) {
        const text = task.querySelector("span").textContent.toLowerCase();
        task.style.display = text.includes(searchText) ? "flex" : "none";
    });
});
function updateDashboard() {
    const tasks = document.querySelectorAll("#taskList li");

    let completed = 0;

    tasks.forEach(task => {
        const span = task.querySelector("span");
        if (span.classList.contains("completed")) {
            completed++;
        }
    });

    const total = tasks.length;
    const pending = total - completed;

    document.getElementById("totalTasks").textContent = "Total: " + total;
    document.getElementById("completedTasks").textContent = "Completed: " + completed;
    document.getElementById("pendingTasks").textContent = "Pending: " + pending;
}
function checkReminders() {
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(function(task) {
        const span = task.querySelector("span");
        const timeEl = task.querySelector("small");

        if (!timeEl || !timeEl.dataset.deadline) return;

        const deadline = new Date(timeEl.dataset.deadline);
        const now = new Date();

        if (
            now.getFullYear() === deadline.getFullYear() &&
            now.getMonth() === deadline.getMonth() &&
            now.getDate() === deadline.getDate() &&
            now.getHours() === deadline.getHours() &&
            now.getMinutes() === deadline.getMinutes()
        ) {
            if (!task.dataset.alerted) {
                showToast("🔔 Reminder: " + span.textContent);
                task.dataset.alerted = "yes";
            }
        }
    });
}
setInterval(checkReminders, 5000);

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }
});

/* separate function below */
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);
}