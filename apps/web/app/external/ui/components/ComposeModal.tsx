import { useRef, useEffect } from 'react';
import type { Email } from '../schema/mailSchema';

type Attachment = NonNullable<Email['attachments']>[number];

interface ComposeModalProps {
  isComposeOpen: boolean;
  composeTo: string;
  setComposeTo: (value: string) => void;
  composeSubject: string;
  setComposeSubject: (value: string) => void;
  composeBody: string;
  setComposeBody: (value: string) => void;
  composeAttachments: Attachment[];
  setComposeAttachments: (attachments: Attachment[]) => void;
  handleSendEmail: () => void;
  handleCloseCompose: () => void;
  handleDiscardCompose: () => void;
}

export default function ComposeModal({
  isComposeOpen,
  composeTo, setComposeTo,
  composeSubject, setComposeSubject,
  composeBody, setComposeBody,
  composeAttachments, setComposeAttachments,
  handleSendEmail,
  handleCloseCompose,
  handleDiscardCompose
}: ComposeModalProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== composeBody) {
      contentEditableRef.current.innerHTML = composeBody || '';
    }
  }, [composeBody]);

  if (!isComposeOpen) return null;

  const handleFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    if (contentEditableRef.current) {
      setComposeBody(contentEditableRef.current.innerHTML);
      contentEditableRef.current.focus();
    }
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      if (contentEditableRef.current) {
        setComposeBody(contentEditableRef.current.innerHTML);
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setComposeBody(e.currentTarget.innerHTML);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newAttachments: Attachment[] = files.map(file => ({
      name: file.name,
      size: file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        : (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    }));

    setComposeAttachments([...composeAttachments, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (indexToRemove: number) => {
    setComposeAttachments(composeAttachments.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="fixed bottom-0 right-4 sm:right-24 w-full sm:w-[450px] bg-white dark:bg-slate-800 shadow-2xl rounded-t-xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden transition-colors">
      <div className="bg-brand-dark dark:bg-slate-900 px-4 py-3 flex justify-between items-center text-white font-medium transition-colors">
        <span>Nouveau message</span>
        <button onClick={handleCloseCompose} className="hover:bg-white/20 p-1 rounded transition-colors text-slate-300 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-4 flex flex-col">
        <input type="text" placeholder="À" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} className="bg-transparent border-b border-slate-100 dark:border-slate-600 py-2 mb-2 outline-none text-brand-dark dark:text-slate-100 focus:border-brand-blue transition-colors placeholder-slate-400" />
        <input type="text" placeholder="Objet" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} className="bg-transparent border-b border-slate-100 dark:border-slate-600 py-2 mb-2 outline-none text-brand-dark dark:text-slate-100 focus:border-brand-blue transition-colors font-medium placeholder-slate-400" />

        <div
          ref={contentEditableRef}
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning={true}
          className="bg-transparent w-full h-32 mt-2 outline-none overflow-y-auto text-slate-700 dark:text-slate-200 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500"
          data-placeholder="Votre message..."
        ></div>

        {composeAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 mb-1 max-h-20 overflow-y-auto">
            {composeAttachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs shadow-sm border border-slate-200 dark:border-slate-600">
                <span className="truncate max-w-[150px]">📎 {att.name}</span>
                <span className="text-slate-500 dark:text-slate-400">({att.size})</span>
                <button onClick={() => removeAttachment(index)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-1">✖</button>
              </div>
            ))}
          </div>
        )}

        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <div className="flex items-center gap-1 mt-2 mb-4 p-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
          <button onClick={() => handleFormat('bold')} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded font-bold">B</button>
          <button onClick={() => handleFormat('italic')} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded italic font-serif">I</button>
          <button onClick={() => handleFormat('underline')} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded underline">U</button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-500 mx-1"></div>
          <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Joindre un fichier">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <button onClick={insertLink} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded" title="Insérer un lien">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={handleSendEmail} className="bg-brand-blue hover:bg-brand-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm">
            Envoyer
          </button>
          <button onClick={handleDiscardCompose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Supprimer le brouillon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
