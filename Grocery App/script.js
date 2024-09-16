document.addEventListener('DOMContentLoaded', () => {
    const addListBtn = document.getElementById('add-list-btn');
    const modal = document.getElementById('list-modal');
    const saveListBtn = document.getElementById('save-list-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const listsTabs = document.getElementById('lists-tabs');
    const tasksContainer = document.getElementById('tasks-container');
    const listNameInput = document.getElementById('list-name');
    const itemImage = document.getElementById('item-image');
    const itemImagePreview = document.getElementById('item-image-preview');
    const addItemForm = document.getElementById('add-item-form');
	const searchBar = document.getElementById('search-bar');
	const sortSelect = document.getElementById('sort-options');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    
    // Retrieve the logged-in user information from localStorage
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Check if the user is logged in
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);

        // Check if the user object contains the username
        if (user && user.username) {
            // Update the welcome message with the username
            welcomeMessage.textContent = `Welcome back, ${user.username}!`;
        }
    } else {
        console.log('No user is logged in.');
    }

    // Add event listener for the logout button
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });


    let lists = JSON.parse(localStorage.getItem('toDoLists')) || [];
    let activeListIndex = 0;

    // Function to show modal
    function showModal() {
        modal.classList.remove('hidden');
    }

    // Function to hide modal
    function hideModal() {
        modal.classList.add('hidden');
    }

    // Ensure the modal is hidden on page load
    hideModal();

    addListBtn.addEventListener('click', () => {
        showModal();  // Show modal when adding a new list
    });

    saveListBtn.addEventListener('click', () => {
        const listName = listNameInput.value.trim();
        if (listName) {
            lists.push({ name: listName, tasks: [] });
            localStorage.setItem('toDoLists', JSON.stringify(lists));
            loadLists();  // Reload lists
            hideModal();  // Hide modal
            listNameInput.value = '';  // Clear input
        } else {
            alert('List name cannot be empty.');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        hideModal();  // Hide modal
    });

    // Hide modal when clicking outside of the modal content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    function loadLists() {
        listsTabs.innerHTML = '';  // Clear the current tabs
        lists.forEach((list, index) => {
            const listTab = document.createElement('div');
            listTab.classList.add('list-tab');
            listTab.textContent = list.name;

            listTab.onclick = () => selectList(index);

            // Add a delete button to each list tab
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'x';
            deleteBtn.classList.add('delete-list-btn');
            deleteBtn.onclick = (event) => {
                event.stopPropagation();  // Prevent list selection
                deleteList(index);
            };
            listTab.appendChild(deleteBtn);

            if (index === activeListIndex) {
                listTab.classList.add('active');
            }
            listsTabs.appendChild(listTab);
        });

        // Add the plus sign button
        listsTabs.appendChild(addListBtn);

        loadTasks();  // Load tasks for the active list
    }

    function selectList(index) {
        activeListIndex = index;
        document.querySelectorAll('.list-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        loadTasks();
    }

    function loadTasks() {
    tasksContainer.innerHTML = '';  // Clear current tasks
    const activeList = lists[activeListIndex];

    if (activeList && activeList.tasks) {
        // Get the search query from the input field
        const searchQuery = searchBar.value.trim().toLowerCase();
        
        // Separate completed and incomplete tasks
        const incompleteTasks = activeList.tasks.filter(task => !task.completed);
        const completedTasks = activeList.tasks.filter(task => task.completed);
        
        // Filter tasks based on the search query
        const filteredIncompleteTasks = incompleteTasks.filter(task => 
            task.productName.toLowerCase().includes(searchQuery) ||
            task.brand.toLowerCase().includes(searchQuery) ||
            task.store.toLowerCase().includes(searchQuery) ||
            task.category.toLowerCase().includes(searchQuery)
        );
        const filteredCompletedTasks = completedTasks.filter(task => 
            task.productName.toLowerCase().includes(searchQuery) ||
            task.brand.toLowerCase().includes(searchQuery) ||
            task.store.toLowerCase().includes(searchQuery) ||
            task.category.toLowerCase().includes(searchQuery)
        );
		
		// Sort tasks based on the selected sort option
        const sortBy = sortSelect.value;  // Get the selected sort criteria
        filteredIncompleteTasks.sort((a, b) => {
            if (sortBy === 'price') {
                return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);  // Sort by price numerically
            }
            return a[sortBy].localeCompare(b[sortBy]);  // Sort by other fields alphabetically
        });

        filteredCompletedTasks.sort((a, b) => {
            if (sortBy === 'price') {
                return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
            }
            return a[sortBy].localeCompare(b[sortBy]);
        });

        // Function to render tasks (this will be reused for both incomplete and completed tasks)
        function renderTasks(taskArray) {
    taskArray.forEach((task, originalTaskIndex) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.innerHTML = `
            <div>
                <input type="checkbox" data-task-index="${originalTaskIndex}" ${task.completed ? 'checked' : ''} class="task-checkbox">
                <span class="${task.completed ? 'checked' : ''}">Product: ${task.productName}</span>
            </div>
            <div>Brand: ${task.brand}</div>
            <div>Price: ${task.price}</div>
            <div>Weight/Volume: ${task.weightVolume}</div>
            <div>Quantity: ${task.quantity}</div>
            <div>Store: ${task.store}</div>
            <div>Category: ${task.category}</div>
            <img src="${task.productImage}" alt="Product Image" class="product-image">
        `;

        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskCompletion(originalTaskIndex));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = (event) => {
            event.stopPropagation();  // Prevent task click
            removeTask(originalTaskIndex);
        };

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = (event) => {
            event.stopPropagation();  // Prevent task click
            showEditForm(originalTaskIndex);  // Show the edit form with the selected task's data
        };

        taskElement.appendChild(removeBtn);
        taskElement.appendChild(editBtn);

        tasksContainer.appendChild(taskElement);
    });
}


        // First render filtered incomplete tasks, then filtered completed tasks
        renderTasks(filteredIncompleteTasks);
        renderTasks(filteredCompletedTasks);
    }
}

// Add an event listener to sort the tasks whenever the sort option is changed
sortSelect.addEventListener('change', loadTasks);

// Add event listener to the search bar to filter tasks as the user types
    searchBar.addEventListener('input', loadTasks);

	function toggleTaskCompletion(originalTaskIndex) {
    const task = lists[activeListIndex].tasks[originalTaskIndex];
    task.completed = !task.completed;  // Toggle completed status
    localStorage.setItem('toDoLists', JSON.stringify(lists));  // Save to localStorage
    loadTasks();  // Reload tasks to reflect changes
}

    function showEditForm(taskIndex) {
        const task = lists[activeListIndex].tasks[taskIndex];
        document.getElementById('edit-item-id').value = taskIndex;  // Store task index for later
        document.getElementById('edit-item-name').value = task.productName;
        document.getElementById('edit-item-brand').value = task.brand;
        document.getElementById('edit-item-price').value = task.price;
        document.getElementById('edit-item-weight-volume').value = task.weightVolume;
        document.getElementById('edit-item-quantity').value = task.quantity;
        document.getElementById('edit-item-store').value = task.store;
        document.getElementById('edit-item-category').value = task.category;
        document.getElementById('edit-item-image-preview').src = task.productImage;

        document.getElementById('edit-item-form').style.display = 'block';  // Show the edit form
    }

    document.getElementById('edit-item-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const taskIndex = document.getElementById('edit-item-id').value;
        const updatedTask = {
            productName: document.getElementById('edit-item-name').value,
            brand: document.getElementById('edit-item-brand').value,
            price: document.getElementById('edit-item-price').value,
            weightVolume: document.getElementById('edit-item-weight-volume').value,
            quantity: document.getElementById('edit-item-quantity').value,
            store: document.getElementById('edit-item-store').value,
            category: document.getElementById('edit-item-category').value,
            productImage: document.getElementById('edit-item-image-preview').src,
        };

        lists[activeListIndex].tasks[taskIndex] = updatedTask;  // Update the task
        localStorage.setItem('toDoLists', JSON.stringify(lists));  // Save to localStorage
        loadTasks();  // Reload the tasks
        document.getElementById('edit-item-form').style.display = 'none';  // Hide the edit form
    });

    document.getElementById('edit-item-image').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('edit-item-image-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    function deleteList(index) {
        lists.splice(index, 1);  // Remove the list
        localStorage.setItem('toDoLists', JSON.stringify(lists));
        activeListIndex = lists.length > 0 ? 0 : -1;
        loadLists();  // Reload lists
    }

    function removeTask(taskIndex) {
        lists[activeListIndex].tasks.splice(taskIndex, 1);
        localStorage.setItem('toDoLists', JSON.stringify(lists));
        loadTasks();
    }

    // Handle adding a product
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const productName = document.getElementById('item-name').value;
        const brand = document.getElementById('item-brand').value;
        const price = document.getElementById('item-price').value;
        const weightVolume = document.getElementById('item-weight-volume').value;
        const quantity = document.getElementById('item-quantity').value;
        const store = document.getElementById('item-store').value;
        const category = document.getElementById('item-category').value;
        const productImage = itemImagePreview.src;

        const newTask = {
            productName,
            brand,
            price,
            weightVolume,
            quantity,
            store,
            category,
            productImage,
			completed: false  // New tasks are not completed by default
        };

        lists[activeListIndex].tasks.push(newTask);
        localStorage.setItem('toDoLists', JSON.stringify(lists));

        // Reset the form
        document.getElementById('item-name').value = '';
        document.getElementById('item-brand').value = '';
        document.getElementById('item-price').value = '';
        document.getElementById('item-weight-volume').value = '';
        document.getElementById('item-quantity').value = '';
        document.getElementById('item-store').value = '';
        document.getElementById('item-category').value = '';
        itemImagePreview.src = '';

        loadTasks();  // Reload the tasks
    });

    // Handle image preview for adding new items
    itemImage.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                itemImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    loadLists();  // Initial load of lists
});


