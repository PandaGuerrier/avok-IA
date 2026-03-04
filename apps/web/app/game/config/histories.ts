export interface HistoryScript {
  id: string
  content: string
  /** Labels des images pré-stockées dans public/images/histories/{id}/img-N.png */
  images: string[]
  pdf: string[]
}

export const histories: HistoryScript[] = [
  {
    id: 'vol_college',
    content: `Un élève de 14 ans, Théo Marchand, est accusé d'avoir volé l'ordinateur portable d'un professeur de mathématiques, M. Delorme. L'appareil a disparu du casier 14B le mardi 12 mars à 18h42, après les cours. Théo était en retenue ce soir-là et aurait donc été dans le couloir à l'heure du vol. Plusieurs camarades ont remarqué qu'il avait récemment montré de l'argent et un nouvel écouteur Bluetooth. Ses notes ont chuté ce trimestre et il a eu plusieurs conflits avec M. Delorme. Sa mère affirme qu'il était rentré à 19h30 ce soir-là, mais aucune preuve ne le confirme.`,
    images: [
      'Enregistrement caméra de surveillance — couloir A, 18h42',
      'Photo du sac à dos retrouvé — preuve physique',
    ],
    pdf: [
      "Procès-verbal de constatation n°2024-0312 : Ordinateur portable HP EliteBook 840 G9 (SN: FR2024K789) disparu du casier 14B, couloir A, bâtiment principal. Dernier accès enregistré au système de contrôle d'accès le 12 mars 2024 à 18h42. Constaté par M. Dupont, agent de sécurité, le 13 mars à 07h15. Valeur estimée : 1 200 €. Plainte déposée par M. Delorme, professeur de mathématiques.",
    ],
  },
  {
    id: 'disparition_chien',
    content: `La chienne Noisette, un golden retriever appartenant à la famille Bertrand, a disparu le samedi 8 mars en début de soirée. La voisine de 15 ans, Camille Sorel, est suspectée : elle avait exprimé son désir d'avoir un chien similaire sur ses réseaux sociaux et avait eu une altercation avec Mme Bertrand deux semaines avant la disparition. Le portail du jardin des Bertrand a été trouvé ouvert alors qu'ils le ferment toujours à clé. Camille prétend être allée chez une amie toute la soirée, mais son téléphone a été géolocalisé à 300 mètres du domicile des Bertrand à 19h15.`,
    images: [
      'Avis de disparition — Noisette, golden retriever',
      'Photo du portail retrouvé ouvert — scène de crime',
    ],
    pdf: [
      "Déclaration de disparition animale - Commissariat de police de Saint-Cloud. Date : 08/03/2024 à 20h30. Propriétaire : Famille Bertrand, 12 rue des Lilas. Animal : Chienne golden retriever répondant au nom de Noisette, 4 ans, puce électronique n°250268501034567. Dernière observation : 17h45 dans le jardin. Portail retrouvé ouvert à 20h15. Témoins potentiels : Mme Leconte (voisine, n° de tel fourni), M. Girard (passant). Enquête confiée à l'agent Roux.",
    ],
  },
]
