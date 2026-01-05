import supaBase from "./config.js";



let username = document.getElementById("username");


//  fetch data of current  user


async function userFetch(param) {
  try {
    const { data, error } = await supaBase.auth.getUser();
    console.log(data);

    if (data) {
      username.innerHTML = data.user.user_metadata.user_name;
    }
  } catch (error) {
    console.log(error);
  }
}

userFetch();



// --- 1. Elements Select Karo ---
const postForm = document.getElementById("create-post-form");
const postTitle = document.getElementById("post-title");
const postCategory = document.getElementById("post-category");
const postContent = document.getElementById("post-content");
const postImage = document.getElementById("post-image");
const publishBtn = document.getElementById("publish-btn");

// --- 2. Create Post Function ---
if (postForm) {
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Page refresh roko

        // Button loading state
        const originalText = publishBtn.innerHTML;
        publishBtn.innerHTML = "Publishing...";
        publishBtn.disabled = true;

        try {
            // A. Check user login
            const { data: { user } } = await supaBase.auth.getUser();
            
            if (!user) {
                Swal.fire({ icon: "error", title: "Oops...", text: "Please login first!" });
                return;
            }

            // B. Image Upload Logic
            const file = postImage.files[0];
            if (!file) {
                throw new Error("Please select an image!");
            }

            // Unique file name banao taake replace na ho (e.g., 12345_myimage.png)
            const fileName = `${Date.now()}_${file.name}`;
            
            // Upload to Supabase Storage ('post_images' bucket name hai)
            const { data: uploadData, error: uploadError } = await supaBase.storage
                .from('post_images') 
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // C. Get Public URL (Image ka link nikalo)
            const { data: publicUrlData } = supaBase.storage
                .from('post_images')
                .getPublicUrl(fileName);

            const imageUrl = publicUrlData.publicUrl;

            // D. Insert Data into Table ('posts')
            const { error: insertError } = await supaBase
                .from('my-posts')
                .insert({
                    title: postTitle.value,
                    category: postCategory.value,
                    content: postContent.value,
                    image_url: imageUrl,
                    user_id: user.id  // Current User ki ID
                });

            if (insertError) throw insertError;

            // E. Success Message & Cleanup
            Swal.fire({
                icon: 'success',
                title: 'Published!',
                text: 'Your post is live now.',
                confirmButtonColor: '#000000',
                customClass: { popup: "glass-alert" }
            }).then(() => {
                // Modal band karo
                const modalElement = document.getElementById('createPostModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                // Form clear karo
                postForm.reset();
                document.getElementById('img-preview-container').classList.add('d-none');
                
                // Optional: Yahan hum feed refresh ka function call kr skte hain
                // loadPosts(); 
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
                confirmButtonColor: '#000000'
            });
        } finally {
            // Button wapis normal karo
            publishBtn.innerHTML = originalText;
            publishBtn.disabled = false;
        }
    });
}

// --- 3. Image Preview Logic (Jo pehle diya tha) ---
if (postImage) {
    postImage.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewContainer = document.getElementById('img-preview-container');
                const previewImage = document.getElementById('img-preview');
                previewImage.src = e.target.result;
                previewContainer.classList.remove('d-none');
            }
            reader.readAsDataURL(file);
        }
    });
}




// show all posts on home page



const postsContainer = document.getElementById("posts-container");
const loader = document.getElementById("feed-loader");

// Navbar Elements
const usernameDisplay = document.getElementById("username");
const avatarDisplay = document.querySelector(".user-avatar");
const logoutBtn = document.getElementById("logout-btn");

// --- 1. Load User Info & All Posts ---
async function loadFeed() {
    try {
        // A. Check Login & Update Navbar
        const { data: { user } } = await supaBase.auth.getUser();
        
        if (user) {
            const userName = user.user_metadata.user_name || user.email.split('@')[0];
            if (usernameDisplay) usernameDisplay.innerText = userName;
            if (avatarDisplay) avatarDisplay.innerText = userName.charAt(0).toUpperCase();
        } else {
            // Agar login nahi hai to login page bhejo (Optional)
            // window.location.href = "login.html";
        }

        // B. Fetch ALL Posts (Public Feed)
        // Note: Table name wahi rakhein jo 'my-posts.js' mein kaam kar raha tha ('posts' ya 'Posts')
        const { data: posts, error } = await supaBase
            .from('my-posts')  
            .select('* ,Profiles(username)') // Join with Profiles table to get username
            .order('created_at', { ascending: false }); // Newest pehle

        if (error) throw error;

        // C. Render Posts
        if (loader) loader.style.display = "none";
        postsContainer.innerHTML = ""; // Clear loader

        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `<p class="text-center w-100 text-muted">No posts available yet. Be the first to post!</p>`;
            return;
        }

        posts.forEach(post => {
            // Date Format
            const date = new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
                
            });

            // 2. ✅ Author Name Logic (Foreign Key se)
            
            let authorName = "Unknown User";
            if (post.Profiles && post.Profiles.username) {
                authorName = post.Profiles.username;
            }

            // 3. Initial for DP (Pehla letter)
            const initial = authorName.charAt(0).toUpperCase();

            // Card HTML
            const cardHTML = `
                <div class="col-md-6 col-lg-4">
                    <div class="card post-card h-100">
                        
                        <div class="card-img-top-wrapper">
                            <img src="${post.image_url}" class="card-img-top" alt="Post Image" 
                                 onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                            <span class="category-badge">${post.category}</span>
                        </div>
                        
                        <div class="card-body">
                            <div class="post-meta mb-2">
                                <div style="width: 25px; height: 25px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                                    ${initial}
                                </div>

                                <span class="author"> ${authorName}</span>
                                <span class="date text-muted" style="font-size: 12px;">• ${date}</span>
                            </div>
                            <h5 class="card-title">${post.title}</h5>
                           <p class="card-text text-truncate-1">${post.content}</p>
                        </div>
                        
                        <div class="card-footer bg-white border-0 pb-3">
                            <a href="post-detail.html?id=${post.id}" class="read-more text-decoration-none fw-bold text-dark" style="font-size: 14px;">
                                Read More <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>

                    </div>
                </div>
            `;
            postsContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error loading feed:", error);
        if (loader) loader.innerHTML = `<p class="text-danger">Failed to load posts.</p>`;
    }
}

// --- 2. Category Filter Logic (Optional - Bonus) ---
const categoryButtons = document.querySelectorAll('.btn-category');

categoryButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        // Active class change karo
        document.querySelector('.btn-category.active').classList.remove('active');
        e.target.classList.add('active');

        const selectedCategory = e.target.innerText;
        
        // Loader wapis dikhao
        postsContainer.innerHTML = '<div class="text-center mt-5 w-100"><div class="spinner-border"></div></div>';

        // Filter Query
        let query = supaBase.from('posts').select('*').order('created_at', { ascending: false });
        
        if (selectedCategory !== 'All') {
            query = query.eq('category', selectedCategory);
        }

        const { data: filteredPosts, error } = await query;
        
        // Re-render (Same logic as above)
        // Aap chaho to render logic ko alag function bana kar reuse kar sakte ho
        // Filhal page reload karke filter dikha dega agar ye complex lag raha hai.
        if(!error) {
             // ... (Render logic same as above for filteredPosts) ...
             // Behtar hai 'loadFeed' ko modify karein taake wo category parameter le sake.
             renderPosts(filteredPosts);
        }
    });
});

// Helper Function for Rendering (Taake code repeat na ho)
function renderPosts(posts) {
    postsContainer.innerHTML = "";
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = `<p class="text-center w-100 text-muted">No posts found in this category.</p>`;
        return;
    }
    posts.forEach(post => {
        const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="card post-card h-100">
                    <div class="card-img-top-wrapper">
                        <img src="${post.image_url}" class="card-img-top" alt="Image">
                        <span class="category-badge">${post.category}</span>
                    </div>
                    <div class="card-body">
                        <div class="post-meta mb-2">
                            <span class="date text-muted" style="font-size: 12px;">• ${date}</span>
                        </div>
                        <h5 class="card-title">${post.title}</h5>
                       <p class="card-text text-truncate-1">${post.content}</p>
                    </div>
                    <div class="card-footer bg-white border-0 pb-3">
                        <a href="post-detail.html?id=${post.id}" class="read-more text-decoration-none fw-bold text-dark">
                            Read More <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>`;
        postsContainer.innerHTML += cardHTML;
    });
}


// Logout Logic
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await supaBase.auth.signOut();
        window.location.href = "login.html";
    });
}

// Run on Load
loadFeed();

