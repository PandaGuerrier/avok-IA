import type { Email } from '../schema/mailSchema';

export const FAKE_EMAILS: Email[] = [
  { id: 1, folder: 'inbox', sender: 'GitHub', subject: 'Action requise : Mise à jour de sécurité', snippet: 'Veuillez mettre à jour vos clés SSH avant le...', body: 'Bonjour,\n\nNous avons détecté l\'utilisation d\'anciennes clés SSH sur votre compte. Veuillez les mettre à jour avant le 30 du mois pour éviter toute interruption de service.\n\nCordialement,\nL\'équipe sécurité GitHub', time: '10:30', unread: true },
  { id: 2, folder: 'inbox', sender: 'Netflix', subject: 'De nouveaux films ajoutés cette semaine !', snippet: 'Découvrez les dernières nouveautés de notre catalogue...', body: 'Bonjour,\n\nVoici votre sélection de la semaine :\n- Inception\n- Interstellar\n- Matrix\n\nBon visionnage !', time: 'Hier', unread: false },
  { id: 3, folder: 'starred', sender: 'Maman', subject: 'Repas de dimanche', snippet: 'Coucou ! N\'oublie pas d\'acheter le pain pour...', body: 'Coucou mon chéri !\n\nN\'oublie pas d\'acheter le pain pour le repas de dimanche midi, prends deux baguettes s\'il te plaît.\n\nBisous, Maman.', time: '12 Mars', unread: true },
  { id: 4, folder: 'starred', sender: 'Banque Populaire', subject: 'Vos documents importants', snippet: 'Votre contrat d\'assurance habitation est disponible...', body: 'Cher client,\n\nVotre contrat est désormais disponible dans votre espace personnel. Conservez ce message précieusement.\n\nVotre conseiller.', time: '2 Fév', unread: false },
  { id: 5, folder: 'sent', sender: 'Moi', subject: 'Candidature - Développeur React', snippet: 'Madame, Monsieur, Veuillez trouver ci-joint mon CV...', body: 'Madame, Monsieur,\n\nSuite à votre annonce, je vous prie de bien vouloir trouver ci-joint mon CV pour le poste de développeur React.\n\nCordialement.', time: '8 Mars', unread: false },
  { id: 6, folder: 'drafts', sender: 'Moi', subject: 'Idées de cadeaux pour Noël', snippet: 'Liste : 1. Clavier mécanique, 2. Casque audio...', body: 'Liste des cadeaux à acheter :\n1. Clavier mécanique pour mon frère\n2. Casque audio pour moi\n3. Un livre pour papa', time: 'Brouillon', unread: false },
  { id: 7, folder: 'snoozed', sender: 'Amazon', subject: 'Votre commande a été expédiée', snippet: 'Bonne nouvelle ! Votre colis est en route.', body: 'Votre commande #12345 a été expédiée et arrivera demain avant 20h.', time: 'En pause', unread: false },
];

export interface Profile {
  firstName: string;
  lastName: string;
  age: number;
  avatar: string;
}

export const MY_PROFILE: Profile = {
  firstName: 'Théo',
  lastName: 'M.',
  age: 25,
  avatar: '👨‍💻'
};
