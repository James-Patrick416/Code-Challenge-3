//debug code you can ignore this
console.log("Script loaded!");
fetch('http://localhost:3000/posts')
.then(res => res.json())
.then(posts => console.log("API connection working. Found posts:", posts))
.catch(err => console.error("API connection failed:", err));
/**this script handles fetching and displaying all blog posts,
 * showing post details when clicked and adding new posts via submission*/

/**initializes the application when DOM fully loads */
function main() {
    displayPosts(); //shows all posts
    addNewPostListener(); //set up form submission handler
    console.log("App initialized");
    // Handle all delete buttons through event delegation
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        const postId = e.target.dataset.id;
        deletePost(postId);
    }
});
}
//waits for DOM content to load b4 running main()
document.addEventListener('DOMContentLoaded', main);

//fetches all posts from the API and displays them
function displayPosts() {
    //get the container where the posts will be displayed
    const postList = document.getElementById('post-list');
    // fetch posts from the API (GET request)
    fetch('http://localhost:3000/posts')
    .then(response => {
        //check if response is successful
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // parse json data
    })
    .then(posts => {
        console.log('Successfully fetched posts:', posts);
        //clear previous content (if any)
        postList.innerHTML = '';
        //create elements for each post
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
        });
    })
    .catch(error => {
        console.error('Error fetching posts:', error);
        postList.innerHTML = '<p>Failed to load posts. Please try again later.</p>'
    });
}
// we want to create elements for a single post
// @param {Object} post - the post object from API
//@returns {HTMLElement}- the created post element
function createPostElement(post) {
    //create container div for the post
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    postDiv.dataset.id = post.id; // store ID for later reference

    // we are adding html content to the div
    postDiv.innerHTML = `
        <h3>${post.title}</h3>
        ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
        <div class="post-actions">
            <button class="view-btn">View Details</button>
            <button class="delete-btn" data-id="${post.id}">Delete</button>
        </div>
    `;

    //Add click handler for delete button
     postDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-btn')) {
            handlePostClick(post.id);
        }
    });

    // Add click event to view details
    postDiv.addEventListener('click', () => handlePostClick(post.id));
    
    return postDiv;
}

//Add new deletePost function
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        fetch(`http://localhost:3000/posts/${postId}`, {  // Fixed backticks
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove post from DOM
                document.querySelector(`.post-item[data-id="${postId}"]`).remove(); // Fixed .remove()
                // Clear details if viewing deleted post
                if (document.getElementById('post-detail').dataset.id == postId) {
                    document.getElementById('post-detail').innerHTML = '<p>Select a post to view details</p>';
                }
            }
        })
        .catch(error => console.error('Error deleting post:', error));
    }
}
/**
 * Handles click on a post to show its details
 * @param {number} postId - ID of the post to display
 */
function handlePostClick(postId) {
    // 1. Get the container where details will be shown
    const postDetail = document.getElementById('post-detail');
    
    // 2. Fetch the specific post from API
    fetch(`http://localhost:3000/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            console.log('Showing post details:', post);
            
            // 3. Display the post details
            postDetail.innerHTML = `
                <h3>${post.title}</h3>
                <p class="author">By: ${post.author}</p>
                <p class="content">${post.content}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching post details:', error);
            postDetail.innerHTML = '<p>Failed to load post details.</p>';
        });
}

/**
 * Sets up event listener for the new post form
 */
function addNewPostListener() {
    const form = document.getElementById('new-post-form');
    
    form.addEventListener('submit', (event) => {
        // 1. Prevent default form submission behavior
        event.preventDefault();
        
        // 2. Get form input values
        const newPost = {
            title: form.title.value,
            content: form.content.value,
            author: form.author.value,
            // image: form.image.value // Uncomment if you add image field
        };
        
        // 3. Send POST request to API
        fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
        .then(response => response.json())
        .then(post => {
            console.log('Successfully created new post:', post);
            
            // 4. Add the new post to the UI
            const postList = document.getElementById('post-list');
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
            
            // 5. Reset the form
            form.reset();
        })
        .catch(error => {
            console.error('Error creating new post:', error);
            alert('Failed to create post. Please try again.');
        });
    });
}

// ======================
// HELPER FUNCTIONS (FOR FUTURE USE)
// ======================

/**
 * Displays an error message in the UI
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Updates a post in the API (for future PATCH implementation)
 * @param {number} postId - ID of post to update
 * @param {Object} updatedData - New data for the post
 */
function updatePost(postId, updatedData) {
    // This is a placeholder for future functionality
    console.log(`Would update post ${postId} with:`, updatedData);
}
 