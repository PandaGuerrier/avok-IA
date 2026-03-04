import { z } from 'zod';

// On crée le schéma pour un seul email, en se basant sur la structure de FAKE_EMAILS
export const EmailSchema = z.object({
  id: z.number().default(0),
  folder: z.string().default('inbox'),
  sender: z.string().default(''),
  subject: z.string().default(''),
  snippet: z.string().default(''),
  body: z.string().default(''),
  time: z.string().default(''),
  unread: z.boolean().default(false),
  isStarred: z.boolean().optional(),
  attachments: z.array(
    z.object({
      name: z.string(),
      size: z.string(),
      type: z.string().optional()
    })
  ).optional()
});

// Votre schéma de tableau, prêt à l'emploi
export const EmailListSchema = z.array(EmailSchema).default([]);

// Génération des types
export type Email = z.infer<typeof EmailSchema>;
export type EmailList = z.infer<typeof EmailListSchema>;
