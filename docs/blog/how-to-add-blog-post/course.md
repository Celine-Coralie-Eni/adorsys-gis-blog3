---
title: How to Add a Blog Post
slug: how-to-add-blog-post
authors: christian-leghadjeu
lang: en
tags:
  - documentation
  - guide
  - git
  - contribution
domain: Documentation
description: A comprehensive guide on how to contribute a blog post to the application, from forking the repository to opening a pull request.
---

# How to Add a Blog Post

This guide explains the complete workflow for adding a new blog post to the application, from forking the repository to opening a pull request.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Node.js and Yarn installed

## Directory Structure

All blog posts are located in the `docs/blog` directory. Each blog post gets its own subdirectory.

```text
docs/
└── blog/
    ├── first-post-slug/
    │   └── course.md
    ├── another-post/
    │   └── course.md
    └── ...
```

## Step-by-Step Guide

### Step 1: Fork the Repository

1. Navigate to the repository on GitHub: [https://github.com/Celine-Coralie-Eni/adorsys-gis-blog3](https://github.com/Celine-Coralie-Eni/adorsys-gis-blog3)
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the destination for the fork

This creates a copy of the repository under your own GitHub account.

### Step 2: Clone Your Fork

Clone your forked repository to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/adorsys-gis-blog3.git
cd adorsys-gis-blog3
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 3: Create a New Branch

Create a new branch for your blog post:

```bash
git checkout -b add-blog-post-my-topic
```

Use a descriptive branch name that reflects the content of your blog post.

### Step 4: Create a New Directory

Navigate to `docs/blog` and create a new directory for your post. The directory name should be the "slug" or URL path for your post (e.g., `my-new-feature`).

```bash
mkdir docs/blog/my-new-feature
```

### Step 5: Create the `course.md` File

Inside your new directory, create a file named `course.md`. This file MUST be named `course.md` for the system to recognize it.

```bash
touch docs/blog/my-new-feature/course.md
```

### Step 6: Add Front Matter and Content

Open `course.md` in your text editor and add the required YAML front matter at the top, followed by your markdown content.

**Example `docs/blog/my-new-feature/course.md`:**

```markdown
---
title: My New Feature Blog Post
slug: my-new-feature
authors: your-github-username
lang: en
tags:
  - feature
  - guide
domain: Development
description: A brief description of your blog post
---

# Introduction

Write your blog post content here using standard Markdown.

## Section 1

You can include code examples, lists, images, and more.
```

**Front Matter Definitions:**
- **title**: The display title of the blog post
- **slug**: The URL-friendly identifier (usually matches directory name)
- **authors**: Your GitHub username or name
- **lang**: Language code (e.g., `en`, `de`, `fr`)
- **tags**: A list of relevant tags
- **domain**: The category or domain (e.g., `DevOps`, `Development`, `Security`)
- **description**: A brief summary of the post (optional but recommended)

### Step 7: (Optional) Add Slides

If you want to create a presentation version of your blog post, create a `slides.md` file in the same directory:

```bash
touch docs/blog/my-new-feature/slides.md
```

Format your slides using markdown with `---` as slide separators. See existing blog posts for examples.

### Step 8: Verify Locally

Install dependencies and run the development server:

```bash
yarn install
yarn dev
```

Visit `http://localhost:3000` (or the port shown in your terminal) to see your new post and verify it appears correctly.

### Step 9: Commit Your Changes

Add and commit your new files:

```bash
git add docs/blog/my-new-feature/
git commit -m "Add blog post: My New Feature"
```

Use a clear and descriptive commit message.

### Step 10: Push to Your Fork

Push your branch to your forked repository on GitHub:

```bash
git push origin add-blog-post-my-topic
```

### Step 11: Open a Pull Request

1. Go to your forked repository on GitHub
2. You should see a prompt to **Compare & pull request** for your recently pushed branch
3. Click the button to create a pull request
4. Fill in the PR details:
   - **Title**: A clear, concise title (e.g., "Add blog post: My New Feature")
   - **Description**: Describe what your blog post is about and any relevant context
5. Click **Create pull request**

Your pull request will be reviewed by the maintainers, and they may request changes before merging.

## Tips for a Great Blog Post

- **Clear structure**: Use headers to organize your content
- **Code examples**: Include practical, working examples
- **Images**: Add screenshots or diagrams where helpful
- **Proofreading**: Check for typos and grammar errors
- **Accurate tags**: Choose relevant tags to help users find your content
- **Descriptive title**: Make it clear what readers will learn

## Getting Help

If you run into issues:
- Check existing blog posts for examples
- Review the error messages when running `yarn dev`
- Ask for help in the repository's issue tracker or discussions
