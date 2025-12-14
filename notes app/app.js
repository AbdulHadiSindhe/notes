document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const notesContainer = document.getElementById('notes-container');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const addNoteBtn = document.getElementById('add-note-btn');
    const modal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteBodyInput = document.getElementById('note-body-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const lastEditedSpan = document.getElementById('last-edited');

    // State
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;

    // Theme Initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initial Render
    renderNotes();

    // --- Event Listeners ---

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderNotes(query);
    });

    // Open Modal (New Note)
    addNoteBtn.addEventListener('click', () => {
        openModal();
    });

    // Close Modal
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Save Note
    saveNoteBtn.addEventListener('click', saveNote);

    // Delete Note
    deleteNoteBtn.addEventListener('click', deleteNote);

    // --- Functions ---

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('span');
        icon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    }

    function renderNotes(searchQuery = '') {
        notesContainer.innerHTML = '';
        
        const filteredNotes = notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(searchQuery);
            const bodyMatch = note.body.toLowerCase().includes(searchQuery);
            return titleMatch || bodyMatch;
        });

        // Sort by updated date (newest first)
        filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (filteredNotes.length === 0) {
            notesContainer.appendChild(emptyState);
            emptyState.style.display = 'flex';
            if (searchQuery) {
                emptyState.querySelector('p').textContent = 'No matching notes found.';
            } else {
                emptyState.querySelector('p').textContent = 'No notes yet. Create one to get started!';
            }
        } else {
            emptyState.style.display = 'none';
            filteredNotes.forEach(note => {
                const noteCard = createNoteCard(note);
                notesContainer.appendChild(noteCard);
            });
        }
    }

    function createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.addEventListener('click', () => openModal(note));

        const title = document.createElement('div');
        title.className = 'note-title';
        title.textContent = note.title || 'Untitled Note';

        const preview = document.createElement('div');
        preview.className = 'note-preview';
        preview.textContent = note.body || 'No content';

        const date = document.createElement('div');
        date.className = 'note-date';
        date.textContent = formatDate(note.updatedAt);

        card.appendChild(title);
        card.appendChild(preview);
        card.appendChild(date);

        return card;
    }

    function openModal(note = null) {
        currentNoteId = note ? note.id : null;
        
        if (note) {
            noteTitleInput.value = note.title;
            noteBodyInput.value = note.body;
            lastEditedSpan.textContent = `Edited ${formatDate(note.updatedAt)}`;
            deleteNoteBtn.classList.remove('hidden');
        } else {
            noteTitleInput.value = '';
            noteBodyInput.value = '';
            lastEditedSpan.textContent = '';
            deleteNoteBtn.classList.add('hidden');
        }

        modal.classList.add('open');
        noteTitleInput.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const body = noteBodyInput.value.trim();

        if (!title && !body) {
            closeModal();
            return;
        }

        const now = new Date().toISOString();

        if (currentNoteId) {
            // Update existing
            const index = notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                notes[index] = { ...notes[index], title, body, updatedAt: now };
            }
        } else {
            // Create new
            const newNote = {
                id: Date.now().toString(),
                title,
                body,
                createdAt: now,
                updatedAt: now
            };
            notes.push(newNote);
        }

        saveToLocalStorage();
        renderNotes(searchInput.value.toLowerCase());
        closeModal();
    }

    function deleteNote() {
        if (currentNoteId) {
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(n => n.id !== currentNoteId);
                saveToLocalStorage();
                renderNotes(searchInput.value.toLowerCase());
                closeModal();
            }
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);
    }
});
