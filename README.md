# xpost.mn - Complete Next.js MVP

## Project Structure
```
xpost-mn/
├── app/
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   ├── article/
│   │   └── [slug]/
│   │       └── page.js
│   ├── category/
│   │   └── [slug]/
│   │       └── page.js
│   ├── search/
│   │   └── page.js
│   └── admin/
│       ├── layout.js
│       ├── page.js
│       ├── articles/
│       │   ├── page.js
│       │   ├── new/
│       │   │   └── page.js
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.js
│       └── login/
│           └── page.js
├── components/
│   ├── Header.js
│   ├── ArticleCard.js
│   ├── SearchBar.js
│   ├── CommentSection.js
│   ├── ShareButton.js
│   ├── MarkdownEditor.js
│   └── admin/
│       ├── AdminLayout.js
│       ├── ArticleForm.js
│       └── FileUpload.js
├── lib/
│   ├── supabase.js
│   ├── auth.js
│   └── utils.js
├── public/
│   └── images/
└── package.json
```

## 1. package.json
```json
{
  "name": "xpost-mn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.263.1",
    "gray-matter": "^4.0.3",
    "marked": "^9.1.2",
    "slugify": "^1.6.6",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
```

## 2. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1da1f2',
        dark: {
          bg: '#000000',
          card: '#16181c',
          border: '#2f3336',
          text: '#e7e8eb',
          muted: '#71767b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'content': '1000px'
      }
    },
  },
  plugins: [],
}
```

## 3. lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helpers
export const getArticles = async (limit, offset = 0, category = null) => {
  let query = supabase
    .from('articles')
    .select(`
      *,
      authors(name, avatar_url),
      categories(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  if (limit) query = query.limit(limit)
  if (offset) query = query.range(offset, offset + limit - 1)

  return await query
}

export const getArticleBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      authors(name, avatar_url, bio),
      categories(name, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!error && data) {
    // Increment view count
    await supabase.rpc('increment_views', { article_id: data.id })
  }

  return { data, error }
}

export const searchArticles = async (query) => {
  return await supabase
    .from('articles')
    .select(`
      *,
      authors(name, avatar_url),
      categories(name, slug)
    `)
    .textSearch('title,content,excerpt', query)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
}

export const getCategories = async () => {
  return await supabase
    .from('categories')
    .select('*')
    .order('name')
}

export const getComments = async (articleId) => {
  return await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
}

export const addComment = async (articleId, name, email, content) => {
  return await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      name,
      email,
      content,
      status: 'pending'
    })
}

// Admin helpers
export const getAdminArticles = async () => {
  return await supabase
    .from('articles')
    .select(`
      *,
      authors(name),
      categories(name)
    `)
    .order('created_at', { ascending: false })
}

export const createArticle = async (articleData) => {
  return await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single()
}

export const updateArticle = async (id, articleData) => {
  return await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .single()
}

export const deleteArticle = async (id) => {
  return await supabase
    .from('articles')
    .delete()
    .eq('id', id)
}

export const uploadImage = async (file, bucket = 'images') => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) return { error }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return { data: { publicUrl }, error: null }
}
```

## 4. lib/auth.js
```javascript
import { supabase } from './supabase'

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const isAdmin = async () => {
  const user = await getCurrentUser()
  if (!user) return false

  const { data } = await supabase
    .from('authors')
    .select('role')
    .eq('email', user.email)
    .single()

  return data?.role === 'admin'
}
```

## 5. lib/utils.js
```javascript
import slugify from 'slugify'
import { format } from 'date-fns'
import { marked } from 'marked'

export const createSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatRelativeDate = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInHours = (now - past) / (1000 * 60 * 60)

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return formatDate(date)
}

export const markdownToHtml = (markdown) => {
  return marked(markdown)
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export const extractTags = (content) => {
  const tagRegex = /#([a-zA-Z0-9_]+)/g
  const matches = content.match(tagRegex)
  return matches ? matches.map(tag => tag.slice(1)) : []
}

export const shareArticle = async (title, url) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url
      })
      return true
    } catch (err) {
      console.log('Error sharing:', err)
    }
  }
  
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (err) {
    console.log('Could not copy to clipboard:', err)
    return false
  }
}
```

## 6. app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #000000;
  color: #e7e8eb;
  line-height: 1.6;
}

.dark {
  color-scheme: dark;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #16181c;
}

::-webkit-scrollbar-thumb {
  background: #2f3336;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4a5568;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Article content styling */
.article-content {
  @apply text-gray-100 leading-relaxed;
}

.article-content h1,
.article-content h2,
.article-content h3 {
  @apply font-semibold text-white mt-8 mb-4;
}

.article-content h1 { @apply text-3xl; }
.article-content h2 { @apply text-2xl; }
.article-content h3 { @apply text-xl; }

.article-content p {
  @apply mb-4;
}

.article-content ul,
.article-content ol {
  @apply ml-6 mb-4;
}

.article-content li {
  @apply mb-2;
}

.article-content a {
  @apply text-primary hover:underline;
}

.article-content blockquote {
  @apply border-l-4 border-primary pl-4 italic text-gray-300 my-4;
}

.article-content code {
  @apply bg-dark-card px-2 py-1 rounded text-sm;
}

.article-content pre {
  @apply bg-dark-card p-4 rounded-lg overflow-x-auto my-4;
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Button hover effects */
.btn-hover {
  @apply transition-all duration-200 ease-in-out;
}

.btn-hover:hover {
  @apply transform scale-105;
}

/* Loading spinner */
.spinner {
  @apply animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full;
}
```

## 7. app/layout.js
```javascript
import './globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'xpost.mn - Mongolia News',
  description: 'Breaking news and analysis from Mongolia',
  keywords: 'Mongolia, news, politics, breaking news',
  openGraph: {
    title: 'xpost.mn - Mongolia News',
    description: 'Breaking news and analysis from Mongolia',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'xpost.mn - Mongolia News',
    description: 'Breaking news and analysis from Mongolia',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-bg text-dark-text">
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
```

## 8. components/Header.js
```javascript
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import SearchBar from './SearchBar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            xpost.mn
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/category/politics" className="hover:text-primary transition-colors">
              Politics
            </Link>
            <Link href="/category/business" className="hover:text-primary transition-colors">
              Business
            </Link>
            <Link href="/category/tech" className="hover:text-primary transition-colors">
              Tech
            </Link>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-dark-card rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-dark-card rounded-full transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-dark-border mt-4 pt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/category/politics" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Politics
              </Link>
              <Link 
                href="/category/business" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Business
              </Link>
              <Link 
                href="/category/tech" 
                className="hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tech
              </Link>
              <div className="pt-2">
                <SearchBar onClose={() => setIsMenuOpen(false)} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
```

## 9. components/SearchBar.js
```javascript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      if (onClose) onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-full focus:outline-none focus:border-primary transition-colors"
          autoFocus
        />
      </div>
    </form>
  )
}
```

## 10. components/ArticleCard.js
```javascript
import Link from 'next/link'
import Image from 'next/image'
import { formatRelativeDate } from '../lib/utils'
import { Eye, MessageCircle } from 'lucide-react'

export default function ArticleCard({ article, featured = false }) {
  const cardClass = featured 
    ? "bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02]"
    : "bg-dark-card border border-dark-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200"

  return (
    <article className={cardClass}>
      <Link href={`/article/${article.slug}`}>
        {article.featured_image && (
          <div className={`relative ${featured ? 'h-64' : 'h-48'} bg-dark-border`}>
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 mb-3">
            {article.categories && (
              <span className="text-primary text-sm font-medium">
                {article.categories.name}
              </span>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-1">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-dark-muted text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`font-semibold text-white mb-3 line-clamp-2 hover:text-primary transition-colors ${
            featured ? 'text-2xl' : 'text-lg'
          }`}>
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-dark-text mb-4 line-clamp-3">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-dark-muted">
            <div className="flex items-center gap-4">
              {article.authors && (
                <div className="flex items-center gap-2">
                  {article.authors.avatar_url && (
                    <Image
                      src={article.authors.avatar_url}
                      alt={article.authors.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  )}
                  <span>{article.authors.name}</span>
                </div>
              )}
              <span>{formatRelativeDate(article.published_at)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {article.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{article.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
```

## 11. app/page.js
```javascript
import { getArticles, getCategories } from '../lib/supabase'
import ArticleCard from '../components/ArticleCard'
import Link from 'next/link'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  const [articlesResult, categoriesResult] = await Promise.all([
    getArticles(20),
    getCategories()
  ])

  const articles = articlesResult.data || []
  const categories = categoriesResult.data || []
  const featuredArticle = articles[0]
  const regularArticles = articles.slice(1)

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      {/* Featured Article */}
      {featuredArticle && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured</h2>
          <ArticleCard article={featuredArticle} featured={true} />
        </section>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-white mb-6">Latest News</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block text-dark-text hover:text-primary transition-colors py-2 border-b border-dark-border last:border-b-0"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

# xpost.mn - Complete Next.js MVP (Continued)

## 12. app/article/[slug]/page.js (Complete)
```javascript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getComments } from '../../../lib/supabase'  
import { formatDate, markdownToHtml } from '../../../lib/utils'
import CommentSection from '../../../components/CommentSection'
import ShareButton from '../../../components/ShareButton'
import { Eye, Calendar, User } from 'lucide-react'

export async function generateMetadata({ params }) {
  const { data: article } = await getArticleBySlug(params.slug)
  
  if (!article) return { title: 'Article Not Found' }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.authors?.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
  }
}

export default async function ArticlePage({ params }) {
  const [articleResult, commentsResult] = await Promise.all([
    getArticleBySlug(params.slug),
    getComments(params.slug)
  ])

  const article = articleResult.data
  const comments = commentsResult.data || []

  if (!article) {
    notFound()
  }

  const content = markdownToHtml(article.content)

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {article.categories && (
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {article.categories.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-dark-border">
            <div className="flex items-center gap-6 text-dark-muted">
              {article.authors && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.authors.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
            </div>
            <ShareButton title={article.title} />
          </div>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="article-content prose prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8 pb-8 border-b border-dark-border">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-dark-card text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/10 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {article.authors?.bio && (
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              {article.authors.avatar_url && (
                <Image
                  src={article.authors.avatar_url}
                  alt={article.authors.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  About {article.authors.name}
                </h3>
                <p className="text-dark-text">{article.authors.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection articleId={article.id} initialComments={comments} />
      </article>
    </div>
  )
}
```

## 13. components/CommentSection.js
```javascript
'use client'

import { useState } from 'react'
import { addComment } from '../lib/supabase'
import { formatRelativeDate } from '../lib/utils'
import { MessageCircle, Send } from 'lucide-react'

export default function CommentSection({ articleId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.content) return

    setIsSubmitting(true)
    
    try {
      const { error } = await addComment(
        articleId,
        formData.name,
        formData.email,
        formData.content
      )

      if (error) throw error

      setMessage('Comment submitted successfully! It will appear after moderation.')
      setFormData({ name: '', email: '', content: '' })
    } catch (error) {
      setMessage('Error submitting comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="border-t border-dark-border pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-semibold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">Leave a Comment</h4>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.includes('Error') 
              ? 'bg-red-900/20 text-red-400 border border-red-900/30' 
              : 'bg-green-900/20 text-green-400 border border-green-900/30'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your comment..."
            rows="4"
            required
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-vertical"
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-white">{comment.name}</h5>
                <span className="text-sm text-dark-muted">
                  {formatRelativeDate(comment.created_at)}
                </span>
              </div>
              <p className="text-dark-text leading-relaxed">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-dark-muted py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </section>
  )
}
```

## 14. components/ShareButton.js
```javascript
'use client'

import { useState } from 'react'
import { Share2, Link, Check } from 'lucide-react'
import { shareArticle } from '../lib/utils'

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const success = await shareArticle(title, url)
    
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:border-primary/50 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </button>
  )
}
```

## 15. app/category/[slug]/page.js
```javascript
import { notFound } from 'next/navigation'
import { getArticles, getCategories } from '../../../lib/supabase'
import ArticleCard from '../../../components/ArticleCard'

export async function generateStaticParams() {
  const { data: categories } = await getCategories()
  
  return categories?.map((category) => ({
    slug: category.slug,
  })) || []
}

export async function generateMetadata({ params }) {
  const { data: categories } = await getCategories()
  const category = categories?.find(cat => cat.slug === params.slug)
  
  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} - xpost.mn`,
    description: `Latest ${category.name.toLowerCase()} news and articles from Mongolia`,
  }
}

export default async function CategoryPage({ params }) {
  const [articlesResult, categoriesResult] = await Promise.all([
    getArticles(20, 0, params.slug),
    getCategories()
  ])

  const articles = articlesResult.data || []
  const categories = categoriesResult.data || []
  const currentCategory = categories.find(cat => cat.slug === params.slug)

  if (!currentCategory) {
    notFound()
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{currentCategory.name}</h1>
        <p className="text-dark-muted">
          Latest articles in {currentCategory.name.toLowerCase()}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {articles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-muted text-lg">
                No articles found in this category yet.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-white mb-4">All Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`block py-2 border-b border-dark-border last:border-b-0 transition-colors ${
                    category.slug === params.slug
                      ? 'text-primary font-medium'
                      : 'text-dark-text hover:text-primary'
                  }`}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

## 16. app/search/page.js
```javascript
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchArticles } from '../../lib/supabase'
import ArticleCard from '../../components/ArticleCard'
import SearchBar from '../../components/SearchBar'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery) => {
    setLoading(true)
    setSearched(true)
    
    try {
      const { data } = await searchArticles(searchQuery)
      setArticles(data || [])
    } catch (error) {
      console.error('Search error:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Search Articles</h1>
        <SearchBar />
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-dark-muted">
            {loading ? 'Searching...' : `Search results for "${query}"`}
            {!loading && searched && (
              <span className="ml-2">({articles.length} results)</span>
            )}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && searched && articles.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {!loading && searched && articles.length === 0 && query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-dark-muted">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Search Articles</h3>
          <p className="text-dark-muted">
            Enter keywords to find articles on xpost.mn
          </p>
        </div>
      )}
    </div>
  )
}
```

## 17. app/admin/layout.js
```javascript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '../../lib/auth'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminLayoutWrapper({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminStatus = await isAdmin()
        if (adminStatus) {
          setAuthorized(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}
```

## 18. components/admin/AdminLayout.js
```javascript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '../../lib/auth'
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Settings, 
  LogOut,
  Menu,
  X 
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Articles', href: '/admin/articles', icon: FileText },
    { name: 'New Article', href: '/admin/articles/new', icon: Plus },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-border">
          <Link href="/" className="text-xl font-bold text-white">
            xpost.mn Admin
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-dark-text hover:bg-dark-bg hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-dark-text hover:bg-dark-bg hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-card transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-white font-medium">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## 19. app/admin/page.js
```javascript
'use client'

import { useState, useEffect } from 'react'
import { getAdminArticles } from '../../lib/supabase'
import { FileText, Eye, MessageCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data } = await getAdminArticles()
      const articles = data || []
      
      setArticles(articles.slice(0, 5)) // Show only recent 5
      
      setStats({
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        draft: articles.filter(a => a.status === 'draft').length,
        totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-muted">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-muted text-sm">Total Articles</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-muted text-sm">Published</p>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-muted text-sm">Drafts</p>
              <p className="text-2xl font-bold text-white">{stats.draft}</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-muted text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-dark-card border border-dark-border rounded-lg">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Articles</h2>
            <Link 
              href="/admin/articles"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-dark-muted">
                      <span>{article.authors?.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.status === 'published' 
                          ? 'bg-green-900/20 text-green-400' 
                          : 'bg-yellow-900/20 text-yellow-400'
                      }`}>
                        {article.status}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views || 0}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-dark-muted py-8">
              No articles yet. <Link href="/admin/articles/new" className="text-primary">Create your first article</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```
// 20. app/admin/login/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '../../../lib/auth'
import { LogIn } from 'lucide-react'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(formData.email, formData.password)
      if (error) throw error
      
      router.push('/admin')
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-card border border-dark-border rounded-lg p-8">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-dark-muted">Sign in to access the admin panel</p>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="spinner w-4 h-4"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// 21. app/admin/articles/page.js
'use client'

import { useState, useEffect } from 'react'
import { getAdminArticles, deleteArticle } from '../../../lib/supabase'
import { formatDate } from '../../../lib/utils'
import Link from 'next/link'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search,
  Filter
} from 'lucide-react'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    loadArticles()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, searchTerm, statusFilter])

  const loadArticles = async () => {
    try {
      const { data } = await getAdminArticles()
      setArticles(data || [])
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = articles

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter)
    }

    setFilteredArticles(filtered)
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    setDeleteLoading(id)
    try {
      const { error } = await deleteArticle(id)
      if (error) throw error
      
      setArticles(articles.filter(article => article.id !== id))
    } catch (error) {
      alert('Error deleting article: ' + error.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Articles</h1>
          <p className="text-dark-muted">Manage your articles</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-dark-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-white font-medium truncate">{article.title}</p>
                        <p className="text-dark-muted text-sm truncate">{article.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-text">
                      {article.authors?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-yellow-900/20 text-yellow-400'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-text">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-text text-sm">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {article.status === 'published' && (
                          <Link
                            href={`/article/${article.slug}`}
                            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Article"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deleteLoading === article.id}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Article"
                        >
                          {deleteLoading === article.id ? (
                            <div className="spinner w-4 h-4"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dark-muted">
              {searchTerm || statusFilter !== 'all' 
                ? 'No articles match your filters.' 
                : 'No articles yet.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first article
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 22. app/admin/articles/new/page.js
'use client'

import ArticleEditor from '../../../../components/admin/ArticleEditor'

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">New Article</h1>
        <p className="text-dark-muted">Create a new article</p>
      </div>
      
      <ArticleEditor />
    </div>
  )
}

// 23. app/admin/articles/[id]/edit/page.js
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getArticleById } from '../../../../../lib/supabase'
import ArticleEditor from '../../../../../components/admin/ArticleEditor'

export default function EditArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadArticle()
  }, [params.id])

  const loadArticle = async () => {
    try {
      const { data, error } = await getArticleById(params.id)
      if (error) throw error
      
      if (!data) {
        setError('Article not found')
        return
      }
      
      setArticle(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <a href="/admin/articles" className="text-primary hover:text-primary/80">
          Back to Articles
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Article</h1>
        <p className="text-dark-muted">Edit "{article?.title}"</p>
      </div>
      
      <ArticleEditor article={article} />
    </div>
  )
}

// 24. components/admin/ArticleEditor.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createArticle, 
  updateArticle, 
  getCategories, 
  getAuthors 
} from '../../lib/supabase'
import { generateSlug } from '../../lib/utils'
import { Save, Eye, Upload, X } from 'lucide-react'

export default function ArticleEditor({ article = null }) {
  const router = useRouter()
  const isEditing = !!article

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    author_id: '',
    tags: '',
    status: 'draft'
  })

  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image: article.featured_image || '',
        category_id: article.category_id || '',
        author_id: article.author_id || '',
        tags: article.tags ? article.tags.join(', ') : '',
        status: article.status || 'draft'
      })
    }
  }, [article])

  const loadInitialData = async () => {
    try {
      const [categoriesResult, authorsResult] = await Promise.all([
        getCategories(),
        getAuthors()
      ])
      
      setCategories(categoriesResult.data || [])
      setAuthors(authorsResult.data || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageUploading(true)
    try {
      // In a real app, you'd upload to your storage service
      // For now, we'll just use a placeholder URL
      const fakeUrl = `https://picsum.photos/800/400?random=${Date.now()}`
      setFormData(prev => ({
        ...prev,
        featured_image: fakeUrl
      }))
    } catch (error) {
      setMessage('Error uploading image')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    setLoading(true)
    setMessage('')

    try {
      const articleData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      let result
      if (isEditing) {
        result = await updateArticle(article.id, articleData)
      } else {
        result = await createArticle(articleData)
      }

      if (result.error) throw result.error

      setMessage(
        isEditing 
          ? 'Article updated successfully!' 
          : 'Article created successfully!'
      )
      
      setTimeout(() => {
        router.push('/admin/articles')
      }, 1000)
    } catch (error) {
      setMessage('Error saving article: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    if (article && article.slug) {
      window.open(`/article/${article.slug}`, '_blank')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-900/20 text-red-400 border border-red-900/30' 
            : 'bg-green-900/20 text-green-400 border border-green-900/30'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="article-slug"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Author
            </label>
            <select
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-vertical"
              placeholder="Brief description of the article"
            />
          </div>

          {/* Featured Image */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Featured Image
            </label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="url"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="Image URL"
                />
                <label className="flex items-center gap-2 bg-dark-bg border border-dark-border px-4 py-2 rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {imageUploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              </div>
              {formData.featured_image && (
                <div className="relative inline-block">
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-sm text-dark-muted mt-1">
              Separate tags with commas
            </p>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <label className="block text-sm font-medium text-white mb-2">
          Content *
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="20"
          className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-vertical font-mono text-sm"
          placeholder="Write your article content in Markdown..."
        />
        <p className="text-sm text-dark-muted mt-2">
          You can use Markdown syntax for formatting
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')} Article
          </button>
          
          {isEditing && article.status === 'published' && (
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-2 bg-dark-bg border border-dark-border text-white px-6 py-2 rounded-lg hover:border-primary/50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
        </div>

        <a
          href="/admin/articles"
          className="text-dark-muted hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
// 25. lib/auth.js (continued)
import { supabase } from './supabaseClient'

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    return { user: null, error }
  }
}

export async function isAdmin() {
  try {
    const { user } = await getCurrentUser()
    if (!user) return false

    // Check if user has admin role
    const { data, error } = await supabase
      .from('authors')
      .select('role')
      .eq('email', user.email)
      .single()

    if (error || !data) return false
    
    return data.role === 'admin'
  } catch (error) {
    return false
  }
}

// 26. middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check if user is admin
    const { data: author } = await supabase
      .from('authors')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (!author || author.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}

// 27. components/ui/LoadingSpinner.js
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// 28. components/ui/Pagination.js
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) {
  const pages = []
  const showPages = 5 // Number of page buttons to show
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 py-2 text-dark-muted">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'bg-dark-card border border-dark-border hover:border-primary/50'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 py-2 text-dark-muted">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm bg-dark-card border border-dark-border rounded-lg hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// 29. components/ui/SearchBar.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = "Search articles...", className = "" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}

// 30. components/ui/Modal.js
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative w-full ${sizeClasses[size]} bg-dark-card border border-dark-border rounded-lg shadow-xl ${className}`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-dark-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// 31. components/ui/Toast.js
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now().toString()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration)
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: 'bg-green-900/20 text-green-400 border-green-900/30',
    error: 'bg-red-900/20 text-red-400 border-red-900/30',
    warning: 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30',
    info: 'bg-blue-900/20 text-blue-400 border-blue-900/30'
  }

  const Icon = icons[type]

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm ${colors[type]} min-w-[300px] animate-in slide-in-from-right`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-current hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// 32. app/search/page.js
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchArticles } from '../../lib/supabase'
import ArticleCard from '../../components/ArticleCard'
import SearchBar from '../../components/ui/SearchBar'
import Pagination from '../../components/ui/Pagination'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  
  const articlesPerPage = 12

  useEffect(() => {
    if (query) {
      performSearch()
    } else {
      setArticles([])
      setTotalResults(0)
      setTotalPages(1)
    }
  }, [query, currentPage])

  const performSearch = async () => {
    setLoading(true)
    try {
      const { data, count } = await searchArticles(
        query, 
        currentPage, 
        articlesPerPage
      )
      
      setArticles(data || [])
      setTotalResults(count || 0)
      setTotalPages(Math.ceil((count || 0) / articlesPerPage))
    } catch (error) {
      console.error('Search error:', error)
      setArticles([])
      setTotalResults(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <Search className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Search Articles</h1>
            <p className="text-dark-muted">Find articles that interest you</p>
          </div>
          
          <SearchBar className="max-w-2xl mx-auto" />
          
          {query && (
            <div className="mt-6 text-center">
              <p className="text-dark-muted">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    {totalResults > 0 ? (
                      <>
                        Found <span className="text-white font-semibold">{totalResults}</span> 
                        {totalResults === 1 ? ' result' : ' results'} for "
                        <span className="text-primary">{query}</span>"
                      </>
                    ) : (
                      <>
                        No results found for "<span className="text-primary">{query}</span>"
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mb-8"
              />
            )}
          </>
        ) : query ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-dark-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
              <p className="text-dark-muted mb-6">
                Try adjusting your search terms or browse our latest articles.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Articles
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-dark-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start Searching</h3>
            <p className="text-dark-muted">
              Enter a search term above to find articles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// 33. app/not-found.js
import Link from 'next/link'
import { FileX, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <FileX className="w-20 h-20 text-dark-muted mx-auto mb-6" />
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-dark-muted mb-8">
          The page you're looking for doesn't exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-dark-card border border-dark-border text-white px-6 py-3 rounded-lg hover:border-primary/50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
