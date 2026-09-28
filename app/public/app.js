const userSelect = document.querySelector("#user");
const list = document.querySelector("#notes");
const empty = document.querySelector("#empty");
const form = document.querySelector("#new-note");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "active";

function headers() {
  return { "content-type": "application/json", "x-user-id": userSelect.value };
}

async function load() {
  const archived = currentFilter === "archived" ? "true" : "false";
  const res = await fetch(`/api/notes?archived=${archived}`, {
    headers: headers(),
  });
  const notes = await res.json();

  list.replaceChildren(
    ...notes.map((n) => {
      const li = document.createElement("li");
      if (n.archived) li.classList.add("archived");

      const grow = document.createElement("div");
      grow.className = "grow";
      const title = document.createElement("strong");
      title.textContent = n.title;
      const body = document.createElement("span");
      body.textContent = n.body;
      const when = document.createElement("small");
      when.textContent = n.created_at;
      grow.append(title, body, document.createElement("br"), when);

      const actions = document.createElement("div");
      actions.className = "actions";

      const archiveBtn = document.createElement("button");
      archiveBtn.textContent = n.archived ? "Повернути" : "Архівувати";
      archiveBtn.setAttribute(
        "aria-label",
        n.archived
          ? `Повернути з архіву: ${n.title}`
          : `Архівувати: ${n.title}`,
      );
      archiveBtn.addEventListener("click", async () => {
        await fetch(`/api/notes/${n.id}/archive`, {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({ archived: !n.archived }),
        });
        load();
      });

      const del = document.createElement("button");
      del.textContent = "Видалити";
      del.setAttribute("aria-label", `Видалити: ${n.title}`);
      del.addEventListener("click", async () => {
        await fetch(`/api/notes/${n.id}`, {
          method: "DELETE",
          headers: headers(),
        });
        load();
      });

      actions.append(archiveBtn, del);
      li.append(grow, actions);
      return li;
    }),
  );

  empty.hidden = notes.length > 0;
  empty.textContent =
    currentFilter === "archived"
      ? "Архівованих нотаток немає."
      : "Нотаток поки немає.";
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    load();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.querySelector("#title");
  const body = document.querySelector("#body");
  await fetch("/api/notes", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ title: title.value, body: body.value }),
  });
  title.value = "";
  body.value = "";
  load();
});

userSelect.addEventListener("change", load);
load();
