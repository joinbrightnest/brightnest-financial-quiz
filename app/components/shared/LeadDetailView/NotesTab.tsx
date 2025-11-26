"use client";

import { useState } from 'react';
import { Note, UserRole } from './types';

interface NotesTabProps {
    notes: Note[];
    loading: boolean;
    leadEmail: string;
    userRole: UserRole;
    onRefresh: () => void;
}

export default function NotesTab({ notes, loading, leadEmail, userRole, onRefresh }: NotesTabProps) {
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

    const handleCreateNote = async () => {
        if (!newNoteContent.trim() || !leadEmail) return;

        setIsSubmittingNote(true);
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadEmail,
                    content: newNoteContent,
                    createdBy: userRole === 'closer' ? 'Closer' : 'Admin',
                    createdByType: userRole,
                }),
            });

            if (response.ok) {
                setNewNoteContent('');
                setShowNoteForm(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error creating note:', error);
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    return (
        <div>
            <div className="mb-6">
                {!showNoteForm ? (
                    <button
                        onClick={() => setShowNoteForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Note
                    </button>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                    placeholder="Write your note here..."
                                />
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNoteForm(false);
                                            setNewNoteContent('');
                                        }}
                                        className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateNote}
                                        disabled={!newNoteContent.trim() || isSubmittingNote}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                    >
                                        {isSubmittingNote ? 'Saving...' : 'Save Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="relative">
                    {notes.length > 0 && <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>}
                    <div className="space-y-4">
                        {notes.length > 0 ? (
                            notes.map((note) => (
                                <div key={note.id} className="relative flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center z-10">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500 mb-2">
                                                    {new Date(note.createdAt).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </p>
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ml-2"
                                                aria-label="Delete note"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !showNoteForm && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-600">No notes have been added for this lead.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
