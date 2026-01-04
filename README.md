# 📸 POST App

A dynamic social media feed application where users can share thoughts, upload images, and interact with content. Built with **Vanilla JavaScript** and powered by **Supabase** for backend services.

## 🚀 Live Demo
[[Click here to view the Live Demo](https://kholaazeem.github.io/Mini-Hackathon/)]

## ✨ Features

- **User Authentication**: Secure Sign Up, Login, and Logout functionality using Supabase Auth.
- **Create Posts**: Users can upload images, select categories, and write descriptions.
- **Read Posts**: Dynamic feed displaying all user posts with specific categories (Technology, Nature, Lifestyle, etc.).
- **Update & Delete**: Full CRUD capabilities. Users can edit or delete their own posts.
- **My Posts**: A dedicated dashboard for users to manage their content.
- **Image Uploads**: Integrated with Supabase Storage for handling image files.
- **Responsive Design**: Fully responsive UI built with **Bootstrap 5** (Mobile-friendly).
- **Search & Filter**: Filter posts by categories (Tech, Lifestyle, Design, etc.).

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript (ES6 Modules).
- **Backend as a Service**: Supabase (PostgreSQL Database, Authentication, Storage).
- **Icons**: FontAwesome 6.
- **Alerts**: SweetAlert2 for beautiful popup notifications.

## 📸 Screenshots

<img width="1917" height="948" alt="Screenshot 2026-01-04 143810" src="https://github.com/user-attachments/assets/c8e74a28-0acb-4b60-b254-aef145c44c6e" />


<img width="1920" height="939" alt="Screenshot 2026-01-04 143918" src="https://github.com/user-attachments/assets/9f53bfd1-844b-4d01-ba01-df04859d4472" />


## ⚙️ Installation & Setup

Follow these steps to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/post-app.git](https://github.com/your-username/post-app.git)
    ```

2.  **Navigate to the project folder:**
    ```bash
    cd post-app
    ```

3.  **Setup Supabase:**
    - Create a new project on [Supabase](https://supabase.com/).
    - Create a table named **`Posts`** with the following columns:
        - `id` (int8, primary key)
        - `title` (text)
        - `content` (text)
        - `category` (text)
        - `image_url` (text)
        - `user_id` (uuid)
    - Create a Storage Bucket named **`POST_IMAGES`** and make it **Public**.
    - Add **RLS Policies** to allow Insert/Select/Update/Delete for authenticated users.

4.  **Configure API Keys:**
    - Open `config.js` file.
    - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual credentials.




    

5.  **Run the App:**
    - Open `index.html` (or `login.html`) using **Live Server** in VS Code.








## 📂 Project Structure
