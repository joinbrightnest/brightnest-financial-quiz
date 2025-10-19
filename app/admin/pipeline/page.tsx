"use client";

import { useState, useEffect } from 'react';

interface Lead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  scheduledAt: string;
  status: 'new' | 'booked_call' | 'not_interested' | 'follow_up' | 'converted' | 'callback_requested' | 'rescheduled';
  notes: string;
  saleValue?: number;
  closer?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

const PIPELINE_COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-100 border-blue-200' },
  { id: 'booked_call', title: 'Booked Call', color: 'bg-green-100 border-green-200' },
  { id: 'follow_up', title: 'Follow Up', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'callback_requested', title: 'Callback Requested', color: 'bg-purple-100 border-purple-200' },
  { id: 'converted', title: 'Converted', color: 'bg-emerald-100 border-emerald-200' },
  { id: 'not_interested', title: 'Not Interested', color: 'bg-red-100 border-red-200' },
  { id: 'rescheduled', title: 'Rescheduled', color: 'bg-gray-100 border-gray-200' },
];

export default function PipelineView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/pipeline/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      } else {
        setError('Failed to fetch leads');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/pipeline/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        ));
      } else {
        setError('Failed to update lead status');
      }
    } catch (error) {
      setError('Network error updating lead');
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/pipeline/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setLeads(leads.map(lead => 
          lead.id === leadId ? { ...lead, notes } : lead
        ));
        setShowNotesModal(false);
        setSelectedLead(null);
      } else {
        setError('Failed to update lead notes');
      }
    } catch (error) {
      setError('Network error updating notes');
    }
  };

  const openNotesModal = (lead: Lead) => {
    setSelectedLead(lead);
    setNotesText(lead.notes);
    setShowNotesModal(true);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    updateLeadStatus(leadId, targetStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and track leads through your sales pipeline</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {PIPELINE_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 rounded-lg border-2 ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {column.title} ({getLeadsByStatus(column.id).length})
              </h3>
              
              <div className="space-y-3">
                {getLeadsByStatus(column.id).map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {lead.customerName}
                      </h4>
                      <button
                        onClick={() => openNotesModal(lead)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Add/Edit Notes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {lead.customerEmail}
                    </div>
                    
                    {lead.customerPhone && (
                      <div className="text-xs text-gray-500 mb-2">
                        {lead.customerPhone}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDate(lead.scheduledAt)}
                    </div>
                    
                    {lead.closer && (
                      <div className="text-xs text-blue-600 mb-2">
                        Assigned: {lead.closer.name}
                      </div>
                    )}
                    
                    {lead.saleValue && (
                      <div className="text-xs font-medium text-green-600 mb-2">
                        Sale: ${Number(lead.saleValue).toFixed(2)}
                      </div>
                    )}
                    
                    {lead.notes && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                        {lead.notes.length > 100 ? `${lead.notes.substring(0, 100)}...` : lead.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notes for {selectedLead.customerName}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-500"
                  placeholder="Add notes about this lead..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedLead(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateLeadNotes(selectedLead.id, notesText)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
