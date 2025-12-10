---
title: How to Add a Blog Post
slug: how-to-add-blog-post
lang: en
authors: generated-guide
tags: [documentation, guide, git, contribution, presentation]
description: Slide presentation demonstrating how to contribute a blog post to the application.
date: '2025-12-10'
---

# How to Add a Blog Post
### Complete Git Workflow

---

## Prerequisites

- GitHub account
- Git installed
- Node.js and Yarn installed

---

## Overview

1. Fork the repository
2. Clone your fork
3. Create a branch
4. Add your content
5. Commit and push
6. Open a Pull Request

---

## Directory Structure

All blog posts live in `docs/blog`.

```text
docs/
└── blog/
    ├── [your-slug]/
    │   └── course.md
```

Each post gets its own folder.

---

## Step 1: Fork

Navigate to:
```
https://github.com/Celine-Coralie-Eni/adorsys-gis-blog3
```

Click **Fork** → Select your account

---

## Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/adorsys-gis-blog3.git
cd adorsys-gis-blog3
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## Step 3: Create Branch

```bash
git checkout -b add-blog-post-my-topic
```

Use a descriptive branch name!

---

## Step 4: Create Directory

```bash
mkdir docs/blog/my-new-feature
```

The folder name becomes your URL slug.

---

## Step 5: Create File

```bash
touch docs/blog/my-new-feature/course.md
```

**Important:** Must be named `course.md`

---

## Step 6: Add Front Matter

```yaml
---
title: My Post Title
slug: my-new-feature
lang: en
authors: your-github-username
tags: [guide, tutorial]
description: Brief description
date: '2025-12-10'
---
```

---

## Step 7: Write Content

Use standard Markdown:

- Headers
- Lists
- Code blocks
- Images

---

## Step 8: Verify Locally

```bash
yarn install
yarn dev
```

Check `http://localhost:3000`

---

## Step 9: Commit

```bash
git add docs/blog/my-new-feature/
git commit -m "Add blog post: My New Feature"
```

---

## Step 10: Push

```bash
git push origin add-blog-post-my-topic
```

Pushes to YOUR fork.

---

## Step 11: Open PR

1. Go to your fork on GitHub
2. Click **Compare & pull request**
3. Fill in title and description
4. Click **Create pull request**

---

## Tips for Success

- Clear, descriptive titles
- Include code examples
- Proofread carefully
- Use relevant tags
- Check existing posts for examples

---

## Getting Help

- Review existing blog posts
- Check `yarn dev` error messages
- Ask in repository discussions

---

## Questions?

Happy blogging! 🎉

