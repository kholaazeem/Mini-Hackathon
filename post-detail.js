import supaBase from "./config.js";

const loader = document.getElementById("loader");
const container = document.getElementById("post-detail-container");

// HTML Elements
const imgEl = document.getElementById("detail-img");
const titleEl = document.getElementById("detail-title");
const categoryEl = document.getElementById("detail-category");
const dateEl = document.getElementById("detail-date");
const contentEl = document.getElementById("detail-content");

async function loadPostDetail() {
    try {
        // 1. URL se ID nikalo (e.g., ?id=14)
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("id");

        if (!postId) {
            document.body.innerHTML = "<h2 class='text-center mt-5'>Post not found!</h2>";
            return;
        }

        // 2. Supabase se Data Fetch karo
        // Note: Hum 'posts' table ya 'my_posts' table check kar sakte hain. 
        // Behtar hai 'posts' table (agar aapne wahi final rakha hai) se mangwayein.
        // Agar aapne table ka naam 'my_posts' rakha tha to neeche change kar lena.
        
        const { data: post, error } = await supaBase
            .from('my-posts') // Yahan apne table ka naam confirm karein ('posts' ya 'my_posts')
            .select('*')
            .eq('id', postId)
            .single(); // .single() ka matlab humein sirf ek post chahiye list nahi

        if (error) throw error;

        // 3. Date Format
        const date = new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // 4. Data UI mein lagao
        imgEl.src = post.image_url;
        titleEl.innerText = post.title;
        categoryEl.innerText = post.category;
        dateEl.innerText = date;
        contentEl.innerText = post.content;

        // 5. Show Container, Hide Loader
        loader.classList.add("d-none");
        container.classList.remove("d-none");

    } catch (error) {
        console.error("Error loading post:", error);
        loader.innerHTML = `<p class="text-danger">Failed to load post. It might be deleted or does not exist.</p>`;
    }
}

// Function chalao
loadPostDetail();