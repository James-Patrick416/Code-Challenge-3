
// Use localStorage as a fallback when API isn't available
let usingLocalStorage = false;

// Initialize the app
function main() {
    // Check if we're running locally or on GitHub Pages
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development - try to connect to json-server
        testApiConnection();
    } else {
        // On GitHub Pages - use localStorage
        usingLocalStorage = true;
        console.log("Running on GitHub Pages, using localStorage");
        displayPosts();
    }
    
    addNewPostListener();
    
    // Handle all delete buttons through event delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.stopPropagation();
            const postId = e.target.dataset.id;
            deletePost(postId);
        }
    });
}

// Test API connection (for local development)
function testApiConnection() {
    fetch('http://localhost:3000/posts')
        .then(res => {
            if (res.ok) {
                console.log("Connected to local API server");
                displayPosts();
            } else {
                throw new Error("API not available");
            }
        })
        .catch(err => {
            console.log("Falling back to localStorage:", err.message);
            usingLocalStorage = true;
            displayPosts();
        });
}

// Get all posts (from API or localStorage)
function getPosts() {
    if (usingLocalStorage) {
        return Promise.resolve(JSON.parse(localStorage.getItem('posts')) || []);
    } else {
        return fetch('http://localhost:3000/posts')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            });
    }
}

// Display all posts
function displayPosts() {
    const postList = document.getElementById('post-list');
    
    getPosts().then(posts => {
        console.log('Fetched posts:', posts);
        postList.innerHTML = '';
        
        if (posts.length === 0) {
            postList.innerHTML = '<p>No posts yet. Create your first post!</p>';
            return;
        }
        
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postList.appendChild(postElement);
        });
    }).catch(error => {
        console.error('Error fetching posts:', error);
        postList.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
    });
}

// Create post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    postDiv.dataset.id = post.id;

    postDiv.innerHTML = `
        <h3>${post.title}</h3>
        ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
        <div class="post-actions">
            <button class="view-btn">View Details</button>
            <button class="delete-btn" data-id="${post.id}">Delete</button>
        </div>
    `;

    postDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-btn')) {
            handlePostClick(post.id);
        }
    });

    return postDiv;
}

// Handle post click
function handlePostClick(postId) {
    const postDetail = document.getElementById('post-detail');
    
    if (usingLocalStorage) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const post = posts.find(p => p.id == postId);
        
        if (post) {
            postDetail.innerHTML = `
                <h3>${post.title}</h3>
                <p class="author">By: ${post.author}</p>
                <p class="content">${post.content}</p>
            `;
        } else {
            postDetail.innerHTML = '<p>Post not found</p>';
        }
    } else {
        fetch(`http://localhost:3000/posts/${postId}`)
            .then(response => response.json())
            .then(post => {
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
}

// Add new post
function addNewPostListener() {
    const form = document.getElementById('new-post-form');
    
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const newPost = {
            id: Date.now(), // Simple ID generation
            title: form.title.value,
            content: form.content.value,
            author: form.author.value,
            image: ""
        };
        
        if (usingLocalStorage) {
            // Save to localStorage
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts.push(newPost);
            localStorage.setItem('posts', JSON.stringify(posts));
            
            // Update UI
            const postList = document.getElementById('post-list');
            const postElement = createPostElement(newPost);
            postList.appendChild(postElement);
            form.reset();
        } else {
            // Send to API
            fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            })
            .then(response => response.json())
            .then(post => {
                const postList = document.getElementById('post-list');
                const postElement = createPostElement(post);
                postList.appendChild(postElement);
                form.reset();
            })
            .catch(error => {
                console.error('Error creating new post:', error);
                alert('Failed to create post. Please try again.');
            });
        }
    });
}

// Delete post
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    if (usingLocalStorage) {
        const posts = JSON.parse(localStorage.getItem('posts')) || [];
        const updatedPosts = posts.filter(post => post.id != postId);
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
        
        // Remove from UI
        document.querySelector(`.post-item[data-id="${postId}"]`)?.remove();
        if (document.getElementById('post-detail').dataset.id == postId) {
            document.getElementById('post-detail').innerHTML = '<p>Select a post to view details</p>';
        }
    } else {
        fetch(`http://localhost:3000/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                document.querySelector(`.post-item[data-id="${postId}"]`)?.remove();
                if (document.getElementById('post-detail').dataset.id == postId) {
                    document.getElementById('post-detail').innerHTML = '<p>Select a post to view details</p>';
                }
            }
        })
        .catch(error => console.error('Error deleting post:', error));
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', main);
