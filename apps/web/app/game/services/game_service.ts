import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs/promises'
import path from 'node:path'
import IAService from '#ia/services/ia_service'
import User from '#users/models/user'
import type DataGameType from '#game/types/data'

export interface HistoryPreuve {
  nom: string
  type: 'image' | 'pdf'
  texte?: string
}

export interface HistoryPost {
  postId: number
  content: string
}

export interface HistoryJson {
  content: string
  // Format v1
  preuves?: HistoryPreuve[]
  posts?: HistoryPost[]
  // Format v2
  instagram_posts?: string[]
  images?: string[]
  pdf?: string[]
}

export interface StaticPost {
  postId: number
  content: string
  imageUrl: string
  username?: string
}

export interface LoadedHistory {
  id: string
  json: HistoryJson
  imageProofs: { nom: string; url: string }[]
  pdfProofs: { nom: string; texte: string }[]
  staticPosts: StaticPost[]
}

/**
 * Parse a v2 instagram_post string like:
 * "@chloe.smn : Selfie... Légende : « caption » (Posté le...)"
 */
function parseInstagramPostString(postStr: string, index: number, picked: string): StaticPost {
  const usernameMatch = postStr.match(/^@([\w.]+)/)
  const username = usernameMatch ? `@${usernameMatch[1]}` : undefined
  const captionMatch = postStr.match(/«\s*(.*?)\s*»/)
  const content = captionMatch ? captionMatch[1] : postStr
  const imageUrl = username ? `/images/histories/${picked}/Posts/${username}.png` : ''
  return { postId: index + 1, content, imageUrl, username }
}

@inject()
export default class GameService {
  constructor(protected ia: IAService) {}

  async loadRandom(): Promise<LoadedHistory> {
    const historiesPath = app.publicPath('images/histories')

    const entries = await fs.readdir(historiesPath, { withFileTypes: true })
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => Number(a) - Number(b))

    if (dirs.length === 0) throw new Error('Aucune histoire trouvée dans public/histories/')

    const picked = dirs[Math.floor(Math.random() * dirs.length)]
    const folderPath = path.join(historiesPath, picked)

    const json = JSON.parse(
      await fs.readFile(path.join(folderPath, 'histoire.json'), 'utf-8')
    ) as HistoryJson

    // ── Proofs ───────────────────────────────────────────────────────────────

    // v1 format: preuves[]
    const imageProofs: { nom: string; url: string }[] = (json.preuves ?? [])
      .filter((p) => p.type === 'image')
      .map((p) => ({ nom: p.nom, url: `/images/histories/${picked}/${p.nom}.png` }))

    const pdfProofs: { nom: string; texte: string }[] = (json.preuves ?? [])
      .filter((p) => p.type === 'pdf')
      .map((p) => ({ nom: p.nom, texte: p.texte ?? '' }))

    // v2 format: images[] + pdf[]
    for (const img of json.images ?? []) {
      const nom = img.replace(/\.(png|jpg|webp)$/i, '')
      imageProofs.push({ nom, url: `/images/histories/${picked}/${img}` })
    }
    ;(json.pdf ?? []).forEach((texte, i) => {
      pdfProofs.push({ nom: `Document ${i + 1}`, texte })
    })

    // ── Static posts ──────────────────────────────────────────────────────────

    let staticPosts: StaticPost[] = []

    if (json.instagram_posts && json.instagram_posts.length > 0) {
      // v2 format: parse @username + caption from string
      staticPosts = json.instagram_posts.map((postStr, i) =>
        parseInstagramPostString(postStr, i, picked)
      )
    } else if (json.posts && json.posts.length > 0) {
      // v1 format: assign images from Posts/ folder by index
      let postFiles: string[] = []
      try {
        postFiles = (await fs.readdir(path.join(folderPath, 'Posts')))
          .filter((f) => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'))
          .sort()
      } catch {
        // No Posts/ folder
      }

      staticPosts = json.posts.map((p, i) => ({
        postId: p.postId,
        content: p.content,
        imageUrl: postFiles[i] ? `/images/histories/${picked}/Posts/${postFiles[i]}` : '',
      }))
    }

    return { id: picked, json, imageProofs, pdfProofs, staticPosts }
  }

  async init(user: User): Promise<{ data: DataGameType; history: LoadedHistory }> {
    const history = await this.loadRandom()

    const staticPostsForIA = history.staticPosts.map((p) => ({
      postId: p.postId,
      content: p.content,
    }))

    const rawData = await this.ia.generateData(user, history.json.content, staticPostsForIA)
    const cleaned = rawData.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const data = JSON.parse(cleaned) as DataGameType

    data.history = { id: history.id, content: history.json.content }

    // Merge static posts (fixed content + imageUrl) with IA-generated comments
    if (history.staticPosts.length > 0) {
      const aiPosts = data.insta?.posts ?? []
      data.insta.posts = history.staticPosts.map((staticPost, i) => ({
        postId: staticPost.postId,
        content: staticPost.content,
        imageUrl: staticPost.imageUrl,
        username: staticPost.username,
        comments: aiPosts[i]?.comments ?? [],
      }))
    }

    return { data, history }
  }
}
