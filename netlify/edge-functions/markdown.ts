import { NodeHtmlMarkdown } from 'node-html-markdown'

const markdownTypes = new Set(['text/markdown', 'text/x-markdown'])
const htmlTypes = new Set(['text/html', 'application/xhtml+xml'])

function prefersMarkdown(accept: string | null) {
  if (!accept)
    return false

  let markdownQuality = -1
  let htmlQuality = -1
  let wildcardQuality = -1

  for (const part of accept.split(',')) {
    const [type, ...params] = part.toLowerCase().split(';').map(chunk => chunk.trim())
    if (!type)
      continue

    const q = params
      .find(param => param.startsWith('q='))
      ?.slice(2)
    const quality = q ? Number.parseFloat(q) : 1
    if (Number.isNaN(quality) || quality <= 0)
      continue

    if (markdownTypes.has(type)) {
      markdownQuality = Math.max(markdownQuality, quality)
      continue
    }

    if (htmlTypes.has(type)) {
      htmlQuality = Math.max(htmlQuality, quality)
      continue
    }

    if (type === '*/*' || type === 'text/*') {
      wildcardQuality = Math.max(wildcardQuality, quality)
      continue
    }
  }

  const htmlPreference = Math.max(htmlQuality, wildcardQuality)
  return markdownQuality >= 0 && (htmlPreference < 0 || markdownQuality >= htmlPreference)
}

function appendVary(header: string | null, value: string) {
  if (!header)
    return value

  const entries = new Set(header.split(',').map(entry => entry.trim()))
  entries.add(value)
  return Array.from(entries).join(', ')
}

export default async function handler(request: Request, context: any) {
  if (request.method !== 'GET')
    return context.next()

  if (!prefersMarkdown(request.headers.get('accept')))
    return context.next()

  const response: Response = await context.next()
  const contentType = response.headers.get('content-type')?.toLowerCase() || ''

  if ((response.status >= 300 && response.status < 400) || response.status === 204)
    return response

  if (!contentType.startsWith('text/html'))
    return response

  const html = await response.text()
  const markdown = NodeHtmlMarkdown.translate(html, {
    preferNativeParser: true,
  })

  const headers = new Headers(response.headers)
  headers.set('content-type', 'text/markdown; charset=utf-8')
  headers.set('vary', appendVary(response.headers.get('vary'), 'Accept'))
  headers.delete('content-length')
  headers.delete('content-encoding')
  headers.delete('etag')

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
