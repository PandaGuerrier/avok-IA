import { DateTime } from 'luxon'
import { z } from 'zod'

export interface ContactData {
  id: number
  name: string
  role: string
}

export default interface DataGameType {
  insta: {
    conversations: ConversationInstaData[],
    posts: PostInstaData[]
  }
  mails: MailData[]
  notes: {
    calendar: CalendarData[]
    notes: NoteData[]
  }
  contacts: ContactData[]
}

export const GameSchema = z.object({
  insta: z
    .object({
      conversations: z.array(z.object({
        conversationId: z.number().default(0),
        messages: z.array(z.object({
          id: z.number().default(0),
          content: z.string().default(''),
          isMine: z.boolean().default(false),
        })).default([]),
      })).default([]),
      posts: z.array(z.any()).default([]),
    })
    .default({}),

  mails: z
    .array(
      z.object({
        mailId: z.number().default(0),
        subject: z.string().default(''),
        content: z.string().default(''),
        sender: z.string().default(''),
        isRead: z.boolean().default(false),
      })
    )
    .default([]),

  contacts: z.array(z.object({
    id: z.number().default(0),
    name: z.string().default(''),
    role: z.string().default(''),
  })).default([]),

  notes: z
    .object({
      calendar: z.array(z.object({
        date: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).default('monday'),
        events: z.array(z.object({
          id: z.number().default(0),
          title: z.string().default(''),
          description: z.string().default(''),
          })).default([]),
      })).default([]),
      notes: z
        .array(
          z.object({
            coef: z.number().default(1),
            note: z.number().default(0),
            date: z.preprocess(() => DateTime.now().toISO(), z.string()), // Auto-génère la date ISO
          })
        )
        .default([]),
    })
    .default({}),
})

export interface CalendarData {
  date: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  events: {
    id: number
    title: string
    description: string
  }[]
}

export interface NoteData {
  coef: number
  note: number
  date: DateTime
}

export interface MailData {
  mailId: number
  subject: string
  content: string
  sender: string
  isRead: boolean
}

export interface ConversationInstaData {
  conversationId: number
  messages: {
    id: number
    content: string
    isMine: boolean
  }[],
}

export interface PostInstaData {
  postId: number
  content: string
  imageUrl: string
  comments: {
    id: number
    content: string
    author: string
  }[],
}
