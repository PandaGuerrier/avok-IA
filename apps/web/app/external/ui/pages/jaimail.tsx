import { useState, useEffect } from 'react';
import { FAKE_EMAILS } from '../data/mockData';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import ComposeModal from '../components/ComposeModal';
import Toast from '../components/Toast';
import type { Email } from '../schema/mailSchema';

type Attachment = NonNullable<Email['attachments']>[number];

export default function Jaimail() {
  const [emails, setEmails] = useState<Email[]>(() => {
    const savedEmails = localStorage.getItem('skymail_emails');
    if (savedEmails) {
      try {
        return JSON.parse(savedEmails) as Email[];
      } catch (error) {
        console.error("Erreur de parsing localStorage", error);
        return FAKE_EMAILS;
      }
    }
    return FAKE_EMAILS;
  });

  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<Attachment[]>([]);

  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('skymail_emails', JSON.stringify(emails));
  }, [emails]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const displayedEmails = emails.filter(email => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return email.subject.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query);
    }
    if (activeTab === 'starred') {
      return email.isStarred || email.folder === 'starred';
    }
    return email.folder === activeTab;
  });

  const openEmail = (email: Email) => {
    setEmails(emails.map(e => e.id === email.id ? { ...e, unread: false } : e));
    setSelectedEmail(email);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedEmail(null);
    setSearchQuery('');
    setSelectedEmails([]);
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === displayedEmails.length && displayedEmails.length > 0) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(displayedEmails.map(email => email.id));
    }
  };

  const toggleSelectEmail = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    e.stopPropagation();
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(emailId => emailId !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const handleSendEmail = () => {
    if (!composeTo || !composeSubject) return alert('Veuillez remplir le destinataire et le sujet.');

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = composeBody;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const newEmail: Email = {
      id: Date.now(),
      folder: 'sent',
      sender: 'Moi',
      subject: composeSubject,
      snippet: plainText.substring(0, 40) + '...',
      body: `<div><strong>À: ${composeTo}</strong><br/><br/>${composeBody}</div>`,
      attachments: composeAttachments,
      time: 'À l\'instant',
      unread: false,
      isStarred: false
    };

    setEmails([newEmail, ...emails]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    setActiveTab('sent');
    showToast('Message envoyé.');
  };

  const handleCloseCompose = () => {
    if (composeTo.trim() || composeSubject.trim() || composeBody.trim() || composeAttachments.length > 0) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = composeBody;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      const newDraft: Email = {
        id: Date.now(),
        folder: 'drafts',
        sender: 'Moi',
        subject: composeSubject || '(Sans objet)',
        snippet: plainText.substring(0, 40) + '...',
        body: `<div><strong>À: ${composeTo}</strong><br/><br/>${composeBody}</div>`,
        attachments: composeAttachments,
        time: 'Brouillon',
        unread: false
      };
      setEmails([newDraft, ...emails]);
      showToast('Brouillon enregistré.');
    }

    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
  };

  const handleDiscardCompose = () => {
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    showToast('Brouillon supprimé.');
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const email = emails.find(em => em.id === id);
    if (email?.folder === 'trash') {
      setEmails(emails.filter(em => em.id !== id));
      showToast('Message supprimé définitivement.');
    } else {
      setEmails(emails.map(em => em.id === id ? { ...em, folder: 'trash' } : em));
      showToast('Conversation mise à la corbeille.');
    }
  };

  const handleEmptyTrash = () => {
    setEmails(emails.filter(em => em.folder !== 'trash'));
    setSelectedEmails([]);
    showToast('La corbeille a été vidée.');
  };

  const handleArchive = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setEmails(emails.map(email => email.id === id ? { ...email, folder: 'archive' } : email));
    showToast('Conversation archivée.');
  };

  const handleSnooze = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setEmails(emails.map(email => email.id === id ? { ...email, folder: 'snoozed' } : email));
    showToast('Conversation mise en attente.');
  };

  const toggleUnread = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const email = emails.find(em => em.id === id);
    setEmails(emails.map(em => em.id === id ? { ...em, unread: !em.unread } : em));
    showToast(email?.unread ? 'Marqué comme lu.' : 'Marqué comme non lu.');
  };

  const toggleStarred = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const email = emails.find(em => em.id === id);
    const currentlyStarred = email?.isStarred || email?.folder === 'starred';

    setEmails(emails.map(em => {
      if (em.id === id) {
        const newFolder = (em.folder === 'starred' && currentlyStarred) ? 'inbox' : em.folder;
        return { ...em, isStarred: !currentlyStarred, folder: newFolder };
      }
      return em;
    }));

    showToast(currentlyStarred ? 'Retiré des favoris.' : 'Ajouté aux favoris.');
  };

  return (
    <div className={`flex flex-col h-screen w-full font-sans relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-brand-dark'}`}>
      <Header
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        handleTabChange={handleTabChange} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
      />

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <Sidebar
            setIsComposeOpen={setIsComposeOpen} activeTab={activeTab}
            handleTabChange={handleTabChange} isDarkMode={isDarkMode}
          />
        )}

        <main className="flex-1 bg-white dark:bg-slate-900 sm:m-4 sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors relative">
          {selectedEmail ? (
            <EmailDetail selectedEmail={selectedEmail} setSelectedEmail={setSelectedEmail} />
          ) : (
            <EmailList
              displayedEmails={displayedEmails} searchQuery={searchQuery} openEmail={openEmail}
              showToast={showToast} handleArchive={handleArchive} handleDelete={handleDelete} toggleUnread={toggleUnread}
              selectedEmails={selectedEmails} toggleSelectAll={toggleSelectAll} toggleSelectEmail={toggleSelectEmail}
              activeTab={activeTab} handleEmptyTrash={handleEmptyTrash} toggleStarred={toggleStarred}
              handleSnooze={handleSnooze}
            />
          )}
          <Toast message={toast} />
        </main>
      </div>

      <ComposeModal
        isComposeOpen={isComposeOpen}
        composeTo={composeTo} setComposeTo={setComposeTo}
        composeSubject={composeSubject} setComposeSubject={setComposeSubject}
        composeBody={composeBody} setComposeBody={setComposeBody}
        composeAttachments={composeAttachments} setComposeAttachments={setComposeAttachments}
        handleSendEmail={handleSendEmail}
        handleCloseCompose={handleCloseCompose}
        handleDiscardCompose={handleDiscardCompose}
      />
    </div>
  );
}
