import supaBase from "./config.js";

const postsContainer = document.getElementById("my-posts-container");
const usernameDisplay = document.getElementById("username"); // ID Updated
const avatarDisplay = document.querySelector(".user-avatar");
const logoutBtn = document.getElementById("logout-btn");

// --- Load Logic ---
async function loadMyPosts() {
    try {
        // 1. Check Login
        const { data: { user }, error: authError } = await supaBase.auth.getUser();

        if (authError || !user) {
            window.location.href = "login.html";
            return;
        }

        // 2. Set Username immediately (Navbar Update)
        const userName = user.user_metadata.user_name || user.email.split('@')[0];
        if (usernameDisplay) usernameDisplay.innerText = userName;
        if (avatarDisplay) avatarDisplay.innerText = userName.charAt(0).toUpperCase();

        // 3. Fetch Posts
        const { data: posts, error: postError } = await supaBase
            .from('my-posts') // Table name 'posts' hai
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (postError) throw postError;

        // 4. Render Posts
        postsContainer.innerHTML = ""; // Clear

        if (posts.length === 0) {
            postsContainer.innerHTML = `<p class="text-muted">You haven't posted anything yet.</p>`;
            return;
        }

        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            const cardHTML = `
                <div class="col-md-6 col-lg-4" id="post-${post.id}">
                    <div class="card post-card h-100">
                        <div class="card-img-top-wrapper">
                            <img src="${post.image_url}" class="card-img-top" alt="Post Image">
                            <span class="category-badge">${post.category}</span>
                        </div>
                        <div class="card-body">
                            <div class="post-meta mb-2">
                                <span class="date text-muted" style="font-size: 12px;">• ${date}</span>
                            </div>
                            <h5 class="card-title">${post.title}</h5>
                            <p class="card-text">${post.content}</p>
                        </div>
                        <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center pb-3">
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${post.id}" data-img="${post.image_url}">
                                <i class="fa-regular fa-trash-can"></i> Delete
                            </button>
                           
<button class="btn btn-sm btn-outline-dark edit-btn" 
    data-id="${post.id}" 
    data-title="${post.title}" 
    data-content="${post.content}" 
    data-category="${post.category}" 
    data-img="${post.image_url}">
    <i class="fa-regular fa-pen-to-square"></i> Edit
</button>
                        </div>
                    </div>
                </div>
            `;
            postsContainer.innerHTML += cardHTML;
        });

        // Add Delete Listeners
        attachDeleteEvents();

    } catch (error) {
        console.error(error);
        postsContainer.innerHTML = `<p class="text-danger">Error loading posts.</p>`;
    }

    // Example inside loadMyPosts:
attachDeleteEvents();
attachEditEvents(); // <--- Ye line add karni hai
}

// --- Delete Functionality ---
function attachDeleteEvents() {
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const postId = e.target.closest("button").getAttribute("data-id");
            const imageUrl = e.target.closest("button").getAttribute("data-img");

            const result = await Swal.fire({
                title: 'Delete Post?',
                text: "You cannot undo this action.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#000',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Delete'
            });

            if (result.isConfirmed) {
                try {
                    // Delete from Table
                    const { error: dbError } = await supaBase
                        .from('my-posts')
                        .delete()
                        .eq('id', postId);

                    if (dbError) throw dbError;

                    // Delete from Storage (Try to extract path)
                    if (imageUrl) {
                        try {
                            // Extract file name from URL (assuming standard supabase URL structure)
                            const urlParts = imageUrl.split('/post_images'); 
                            if(urlParts.length > 1) {
                                const imagePath = urlParts[1];
                                await supaBase.storage.from('post_images').remove([imagePath]);
                            }
                        } catch (err) {
                            console.log("Image delete error (minor):", err);
                        }
                    }

                    // Remove from UI
                    document.getElementById(`post-${postId}`).remove();
                    Swal.fire('Deleted!', 'Post has been removed.', 'success');

                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'Failed to delete post.', 'error');
                }
            }
        });
    });
}



// edit functionality

// --- 4. Edit Button Logic (Modal Open Karna) ---
function attachEditEvents() {
    const editButtons = document.querySelectorAll(".edit-btn");

    editButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Button se data nikalo
            const button = e.target.closest(".edit-btn");
            const id = button.getAttribute("data-id");
            const title = button.getAttribute("data-title");
            const content = button.getAttribute("data-content");
            const category = button.getAttribute("data-category");
            const img = button.getAttribute("data-img");

            // Modal ke Inputs mein data bharo
            document.getElementById("edit-post-id").value = id;
            document.getElementById("edit-title").value = title;
            document.getElementById("edit-content").value = content;
            document.getElementById("edit-category").value = category;
            document.getElementById("current-img-preview").src = img;

            // Modal Show Karo
            const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
            editModal.show();
        });
    });
}




// --- 5. Update Post Logic (Data Save Karna) ---
const editForm = document.getElementById("edit-post-form");

if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updateBtn = document.getElementById("update-btn");
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = "Updating...";
        updateBtn.disabled = true;

        try {
            const postId = document.getElementById("edit-post-id").value;
            const newTitle = document.getElementById("edit-title").value;
            const newContent = document.getElementById("edit-content").value;
            const newCategory = document.getElementById("edit-category").value;
            const newImageFile = document.getElementById("edit-image").files[0];

            let imageUrl = document.getElementById("current-img-preview").src; // Default: Purani image

            // Agar User ne nayi image select ki hai to upload karo
            if (newImageFile) {
                const fileName = `${Date.now()}_edited_${newImageFile.name}`;
                
                // Upload new image
                const { error: uploadError } = await supaBase.storage
                    .from('post_images')
                    .upload(fileName, newImageFile);

                if (uploadError) throw uploadError;

                // Get new URL
                const { data: publicUrlData } = supaBase.storage
                    .from('post_images')
                    .getPublicUrl(fileName);
                
                imageUrl = publicUrlData.publicUrl;
            }

            // Update Database
            const { error: updateError } = await supaBase
                .from('my-posts')
                .update({
                    title: newTitle,
                    content: newContent,
                    category: newCategory,
                    image_url: imageUrl
                })
                .eq('id', postId); // Bahut zaroori: Sirf is ID ko update karo

            if (updateError) throw updateError;

            // Success
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Your post has been updated.',
                confirmButtonColor: '#000'
            }).then(() => {
                location.reload(); // Page refresh taake naya data dikhe
            });

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Update failed.', 'error');
        } finally {
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }
    });
}



// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await supaBase.auth.signOut();
        window.location.href = "login.html";
    });
}

loadMyPosts();