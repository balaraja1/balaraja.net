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
  const outputDir = 'public/blog';
  const template = await getTemplate('blog-post');
  
  const posts = await fs.readdir(postsDir);
  
  for (const post of posts) {
    if (post.endsWith('.md')) {
      const content = await fs.readFile(path.join(postsDir, post), 'utf-8');
      const { data, content: markdown } = matter(content);
      const html = marked(markdown);
      
      const finalHtml = template
        .replace('{{title}}', data.title)
        .replace('{{date}}', data.date)
        .replace('{{content}}', html);
      
      await fs.outputFile(
        path.join(outputDir, `${post.replace('.md', '.html')}`),
        finalHtml
      );
    }
  }
}

async function buildBlogIndex() {
  const postsDir = 'src/content/blog/posts';
  const outputDir = 'public/blog';
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
  
  // Create HTML for blog listing
  const blogListHTML = `
    <h2>Blog</h2>
    <div class="blog-list">
      ${postList.map(post => `
        <article class="blog-preview">
          <h4><a href="${post.url}">${post.title}</a> - ${post.date}</h4>
        </article>
      `).join('')}
    </div>
    <nav class="simple-nav">
      <a href="/">Home</a>
      <a href="/about.html">About</a>
      <a href="/books.html">Books</a>
    </nav>
  `;
  
  const finalHtml = template
    .replace('{{title}}', 'Blog')
    .replace('{{content}}', blogListHTML);
  
  await fs.outputFile(path.join(outputDir, 'index.html'), finalHtml);
}

async function build() {
  // Create public directory
  await fs.ensureDir('public');
  
  // Copy static assets
  await fs.copy('src/styles', 'public/styles');
  await fs.copy('src/scripts', 'public/scripts');
  
  // Build blog posts and index
  await buildBlogPosts();
  await buildBlogIndex();
}

build().catch(console.error);