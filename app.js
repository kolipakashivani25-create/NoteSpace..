// ===========================
// CONFIG
// ===========================
const API_BASE = "http://localhost:5000/api/notes";

// ===========================
// DOM ELEMENTS
// ===========================
const title = document.getElementById("title");
const content = document.getElementById("content");
const tags = document.getElementById("tags");
const pinned = document.getElementById("pinned");
const searchInput = document.getElementById("searchInput");
const notesContainer = document.getElementById("notesContainer");
const editingId = document.getElementById("editingId");

document.getElementById("noteForm").addEventListener("submit", submitNote);
document.getElementById("resetBtn").addEventListener("click", resetForm);
document.getElementById("searchBtn").addEventListener("click", loadNotes);
document.getElementById("clearBtn").addEventListener("click", () => {
  searchInput.value = "";
  loadNotes();
});

// ===========================
// LOAD NOTES
// ===========================
async function loadNotes() {
  const q = searchInput.value.trim();
  const url = q ? `${API_BASE}?q=${q}` : API_BASE;

  const response = await fetch(url);
  const notes = await response.json();

  notesContainer.innerHTML = "";

  if (notes.length === 0) {
    notesContainer.innerHTML = "<p>No notes found.</p>";
    return;
  }

  notes.forEach(renderNoteCard);
}

// ===========================
// RENDER NOTE
// ===========================
function renderNoteCard(note) {
  const card = document.createElement("div");
  card.classList.add("note-card");
  if (note.pinned) card.classList.add("pinned");

  card.innerHTML = `
    <div class="note-title">${note.title}</div>
    <div class="note-content">${note.content}</div>

    <div class="note-tags">
      ${note.tags.map(t => `<span class="tag">#${t}</span>`).join(" ")}
    </div>

    <div class="timestamp">${new Date(note.updatedAt).toLocaleString()}</div>

    <div class="note-actions">
      <button onclick="editNote('${note._id}')">Edit</button>
      <button onclick="deleteNote('${note._id}')" style="background:#d9534f">Delete</button>
    </div>
  `;

  notesContainer.appendChild(card);
}

// ===========================
// CREATE / UPDATE NOTE
// ===========================
async function submitNote(e) {
  e.preventDefault();

  const payload = {
    title: title.value.trim(),
    content: content.value.trim(),
    tags: tags.value ? tags.value.split(",").map(t => t.trim()) : [],
    pinned: pinned.checked
  };

  let url = API_BASE;
  let method = "POST";

  if (editingId.value) {
    url = `${API_BASE}/${editingId.value}`;
    method = "PUT";
  }

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  resetForm();
  loadNotes();
}

// ===========================
// DELETE NOTE
// ===========================
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  loadNotes();
}

// ===========================
// EDIT NOTE
// ===========================
async function editNote(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  const note = await response.json();

  title.value = note.title;
  content.value = note.content;
  tags.value = note.tags.join(", ");
  pinned.checked = note.pinned;

  editingId.value = id;
  document.getElementById("submitBtn").textContent = "Update";
  document.getElementById("formTitle").textContent = "Edit Note";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===========================
// RESET FORM
// ===========================
function resetForm() {
  title.value = "";
  content.value = "";
  tags.value = "";
  pinned.checked = false;
  editingId.value = "";
  document.getElementById("submitBtn").textContent = "Create";
  document.getElementById("formTitle").textContent = "Create Note";
}

// Initial load
loadNotes();
