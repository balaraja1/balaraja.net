const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Function to read template
const getTemplate = async (templateName) => {
  return await fs.readFile(`src/templates/${templateName}.html`, 'utf-8');
};

// Function to build blog posts
async function buildBlogPosts() {
  const postsDir = 'src/content/blog/posts';
  const outputDir = 'docs/blog';
  const template = await getTemplate('blog-post');
  
  const posts = await fs.readdir(postsDir);
  
  for (const post of posts) {
    if (post.endsWith('.md')) {
      const content = await fs.readFile(path.join(postsDir, post), 'utf-8');
      const { data, content: markdownContent } = matter(content);
      const html = marked(markdownContent);
      
      const blogPostHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
    <nav>
        <a href="../">Home</a>
        <a href="../about.html">About</a>
        <a href="../blog">Blog</a>
        <a href="../bookshelf.html">Bookshelf</a>
    </nav>
    <main>
        <article class="blog-post">
            <h1>${data.title}</h1>
            <time>${new Date(data.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</time>
            <div class="content">
                ${marked(markdownContent)}
            </div>
        </article>
    </main>
</body>
</html>`;

      await fs.outputFile(path.join(outputDir, `${post.replace('.md', '.html')}`), blogPostHTML);
    }
  }
}

async function buildBlogIndex() {
  const postsDir = 'src/content/blog/posts';
  const outputDir = 'docs/blog';
  const template = await getTemplate('base');
  
  // Read all posts and get their metadata
  const posts = await fs.readdir(postsDir);
  const postList = [];
  
  for (const post of posts) {
    if (post.endsWith('.md')) {
      const content = await fs.readFile(path.join(postsDir, post), 'utf-8');
      const { data } = matter(content);
      
      // Format the date
      const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      postList.push({
        title: data.title,
        date: formattedDate,
        url: `/blog/${post.replace('.md', '.html')}`
      });
    }
  }
  
  // Sort posts by date (newest first)
  postList.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Create HTML for blog listing without the nav
  const blogListHTML = `
    <h2>Blog</h2>
    <div class="blog-list">
      ${postList.map(post => `
        <article class="blog-preview">
          <h4><a href="${post.url.replace('/blog/', '')}">${post.title}</a> - ${post.date}</h4>
        </article>
      `).join('')}
    </div>
    <nav class="simple-nav">
      <a href="../">Home</a>
      <a href="../about.html">About</a>
      <a href="../bookshelf.html">Bookshelf</a>
    </nav>
  `;
  
  // Create final HTML without using the base template
  const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
    <main>
        ${blogListHTML}
    </main>
</body>
</html>`;
  
  await fs.outputFile(path.join(outputDir, 'index.html'), finalHtml);
}

async function build() {
  // Create docs directory
  await fs.ensureDir('docs');
  
  // Copy static assets
  await fs.copy('src/styles', 'docs/styles');
  await fs.copy('src/scripts', 'docs/scripts');
  
  // Build blog posts and index
  await buildBlogPosts();
  await buildBlogIndex();
}

build().catch(console.error);