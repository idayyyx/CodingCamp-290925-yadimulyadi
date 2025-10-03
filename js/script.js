/// initialize empty array to store todos
let todos = [];

function addTodo() {

    /// Ambil value dari input
    const todoInput = document.getElementById('todo-input');
    const todoDate = document.getElementById('todo-date');

    // Panggil fungsi validateInput(). Jika mengembalikan 'false' (gagal validasi),
    // maka kita hentikan eksekusi fungsi addTodo().
    if (!validateInput(todoInput.value, todoDate.value)) {
        return; // Hentikan jika validasi gagal
    }

    /// Tambahkan Todonya ke dalam list
    let todo = { task: todoInput.value, date: todoDate.value };
    todos.push(todo);

    /// Kosongkan input setelah berhasil ditambahkan
    todoInput.value = '';
    todoDate.value = '';

    /// Render update todo list
    renderTodo();
}

function renderTodo() {
    /// Ambil element todo list
    const todoList = document.getElementById('todo-list');

    /// Hapus seluruh isi todo list
    todoList.innerHTML = '';

    /// Render ulang seluruh todo
    todos.forEach((todo, index) => {
        // Asumsi class CSS menggunakan Tailwind seperti di contoh Anda
        todoList.innerHTML += `<li class="border p-2 mb-2 flex justify-between items-center">
        <div>
            <p class="font-bold">${todo.task}</p>
            <p class="text-sm text-gray-500">${todo.date}</p>
        </div>
        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteTodo(${index})">Delete</button>
    </li>`;
    });
}

function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodo();
}

function deleteAllTodo() {
    // legacy placeholder — keep for compatibility if called directly
    // Now showing modal instead of using window.confirm()
    showDeleteModal();
}

/** Show / hide modal and perform delete */
function showDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    // prevent body scroll while modal open
    document.body.style.overflow = 'hidden';
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function performDeleteAll() {
    // actually delete and update UI
    todos = [];
    renderTodo();
    hideDeleteModal();

    // optional small feedback
    const errorMessageElement = document.getElementById('todo-nolist');
    if (errorMessageElement) {
        clearTimeout(errorMessageElement._msgTimer);
        errorMessageElement.innerHTML = '<div class="bg-red-500 text-white p-2 rounded-lg">All todos removed</div>';
        errorMessageElement._msgTimer = setTimeout(() => {
            errorMessageElement.innerHTML = '';
            delete errorMessageElement._msgTimer;
        }, 3000);
    }
}

function filterTodo() {
    // Ambil elemen input filter (pastikan di HTML ada elemen dengan id 'filter-input' dan/atau 'filter-date')
    const queryEl = document.getElementById('filter-input');
    const dateEl = document.getElementById('filter-date');
    const todoList = document.getElementById('todo-list');

    if (!todoList) return;

    const q = queryEl ? queryEl.value.trim().toLowerCase() : '';
    const d = dateEl ? dateEl.value : '';

    // Filter berdasarkan teks (task) dan/atau tanggal
    const filtered = todos.filter(todo => {
        const matchesText = q === '' || todo.task.toLowerCase().includes(q);
        const matchesDate = d === '' || todo.date === d;
        return matchesText && matchesDate;
    });

    // Render hasil filter (gunakan index asli dari array todos untuk tombol hapus)
    todoList.innerHTML = '';

    if (filtered.length === 0) {
        todoList.innerHTML = '<li class="p-2 text-gray-500">No matching tasks</li>';
        return;
    }

    filtered.forEach(todo => {
        // Cari index asli di array todos (cocokkan task + date untuk menghindari masalah object identity)
        const originalIndex = todos.findIndex(t => t.task === todo.task && t.date === todo.date);

        todoList.innerHTML += `<li class="border p-2 mb-2 flex justify-between items-center">
            <div>
                <p class="font-bold">${todo.task}</p>
                <p class="text-sm text-gray-500">${todo.date}</p>
            </div>
            <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteTodo(${originalIndex})">Delete</button>
        </li>`;
    });
}

// **Perbaikan 2: Fungsi validateInput**
function validateInput(todo, date) {
    // Dapatkan elemen untuk menampilkan pesan kesalahan. Asumsikan ID-nya adalah 'todo-nolist'.
    const errorMessageElement = document.getElementById('todo-nolist');

    if (todo === '' || date === '') {
        // Cek dan tampilkan pesan kesalahan berupa teks menggunakan innerHTML
        if (errorMessageElement) {
            // Hapus timer sebelumnya jika ada
            clearTimeout(errorMessageElement._msgTimer);

            errorMessageElement.innerHTML = '<div class="bg-red-500 text-white p-2 rounded-lg flex items-center gap-2 alert-error shadow-lg mb-5 w-full animate-pulse"> please fill out the task and date </div>';

            // Hapus pesan setelah 6 detik
            errorMessageElement._msgTimer = setTimeout(() => {
                errorMessageElement.innerHTML = '';
                delete errorMessageElement._msgTimer;
            }, 6000);
        }
        // Jika errorMessageElement tidak ditemukan (null), fungsi hanya akan langsung me-return false
        return false;
    }

    // Jika valid, hapus pesan kesalahan dan timer jika ada
    if (errorMessageElement) {
        clearTimeout(errorMessageElement._msgTimer);
        errorMessageElement.innerHTML = ''; // Menggunakan innerHTML untuk mengosongkan
    }
    return true;
}

// ===============================================
// 3. SETUP AWAL (Memasang Event Listener)
// ===============================================

// DOMContentLoaded memastikan kode berjalan setelah seluruh HTML dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Pasang fungsi 'addTodo' ke tombol 'Add Todo'
    const addButton = document.getElementById('add-button');
    if (addButton) {
        // Kita menggunakan onclick() di HTML untuk memanggil fungsi saat tombol diklik.
        // Jika Anda ingin menggunakan addEventListener, ganti kode di HTML,
        // lalu gunakan: addButton.addEventListener('click', addTodo);
    }
    
    // Pasang fungsi 'deleteAllTodo' ke tombol 'Delete All'
   const deleteAllButton = document.getElementById('deleteAll');
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', showDeleteModal);
    }
    // Modal controls
    const modal = document.getElementById('delete-modal');
    const overlay = document.getElementById('delete-modal-overlay');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');

    if (cancelBtn) cancelBtn.addEventListener('click', hideDeleteModal);
    if (overlay) overlay.addEventListener('click', hideDeleteModal);
    if (confirmBtn) confirmBtn.addEventListener('click', performDeleteAll);

    // Panggil renderTodo() saat halaman dimuat pertama kali
    renderTodo();
});

document.addEventListener('DOMContentLoaded', () => {
        const filterBtn = document.getElementById('filter');
        const panel = document.getElementById('filter-panel');
        const q = document.getElementById('filter-input');
        const d = document.getElementById('filter-date');
        const clearBtn = document.getElementById('clear-filter');

        if (filterBtn && panel) {
          filterBtn.addEventListener('click', () => {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) q?.focus();
          });
        }

        if (q) q.addEventListener('input', () => window.filterTodo && filterTodo());
        if (d) d.addEventListener('change', () => window.filterTodo && filterTodo());
        if (clearBtn) clearBtn.addEventListener('click', () => {
          if (q) q.value = '';
          if (d) d.value = '';
          window.filterTodo && filterTodo();
        });
      });