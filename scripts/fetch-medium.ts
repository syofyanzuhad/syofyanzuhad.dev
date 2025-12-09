import fs from 'fs-extra'
import Parser from 'rss-parser'

const MEDIUM_FEED_URL = 'https://syofyanzuhad.medium.com/feed'

interface MediumItem {
  'title': string
  'link': string
  'pubDate': string
  'contentSnippet'?: string
  'content:encoded'?: string
  'categories'?: string[]
}

function extractDescription(html: string | undefined, maxLength: number): string {
  if (!html)
    return ''
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ')
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()
  // Remove "Continue reading on Medium" suffix
  text = text.replace(/Continue reading on Medium\s*(?:»\s*)?$/i, '').trim()
  // Truncate
  if (text.length <= maxLength)
    return text
  return `${text.substring(0, maxLength).trim()}...`
}

async function fetchMediumPosts() {
  const parser = new Parser<Record<string, unknown>, MediumItem>()

  console.log('Fetching Medium RSS feed...')

  try {
    const feed = await parser.parseURL(MEDIUM_FEED_URL)

    const posts = feed.items.map(item => ({
      path: item.link || '',
      title: item.title || '',
      date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : '',
      desc: extractDescription(item['content:encoded'] || item.contentSnippet, 150),
      platform: 'Medium',
      redirect: item.link || '',
    }))

    const output = `import type { Post } from '~/types'

// Auto-generated from Medium RSS feed
// Do not edit manually - this file is regenerated during build

export const mediumPosts: Post[] = ${JSON.stringify(posts, null, 2)}
`

    await fs.ensureDir('src/data')
    await fs.writeFile('src/data/medium-posts.ts', output, 'utf-8')

    console.log(`Successfully fetched ${posts.length} posts from Medium`)
  }
  catch (error) {
    console.error('Failed to fetch Medium RSS feed:', error)
    // Create empty file to prevent build failure
    const fallback = `import type { Post } from '~/types'

export const mediumPosts: Post[] = []
`
    await fs.ensureDir('src/data')
    await fs.writeFile('src/data/medium-posts.ts', fallback, 'utf-8')
  }
}

fetchMediumPosts()
