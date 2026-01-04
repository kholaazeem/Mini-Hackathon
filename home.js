import supaBase from "./config.js";



let username = document.getElementById("username");


//  fetch data of current  user


async function userFetch() {
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




