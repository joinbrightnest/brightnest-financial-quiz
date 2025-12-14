import { useState, useCallback } from 'react';
import { Appointment } from '../types';
import { getRecordingLink } from '../utils';

interface UseCloserAppointmentsReturn {
    appointments: Appointment[];
    isLoading: boolean;
    error: string;
    fetchAppointments: () => Promise<void>;

    // Selection & Modal State
    selectedAppointment: Appointment | null;
    setSelectedAppointment: (apt: Appointment | null) => void;
    showOutcomeModal: boolean;
    setShowOutcomeModal: (show: boolean) => void;

    // Outcome Data State
    outcomeData: {
        outcome: string;
        notes: string;
        saleValue: string;
        recordingLink: string;
    };
    setOutcomeData: (data: any) => void;

    // Actions
    openOutcomeModal: (appointment: Appointment) => void;
    handleUpdateOutcome: () => Promise<boolean>;

    // Lead Details
    selectedLeadId: string | null;
    setSelectedLeadId: (id: string | null) => void;
    viewLeadDetails: (appointment: Appointment) => Promise<void>;
}

export function useCloserAppointments(endpoint: string): UseCloserAppointmentsReturn {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [outcomeData, setOutcomeData] = useState({
        outcome: '',
        notes: '',
        saleValue: '',
        recordingLink: ''
    });

    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(endpoint, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data.appointments || []);
                setError('');
            } else {
                setError('Failed to load appointments');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError('Network error loading appointments');
        } finally {
            setIsLoading(false);
        }
    }, [endpoint]);

    const openOutcomeModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);

        // Get the existing recording link using shared utility
        const existingRecordingLink = getRecordingLink(appointment);

        setOutcomeData({
            outcome: appointment.outcome || '',
            notes: appointment.notes || '',
            saleValue: appointment.saleValue?.toString() || '',
            recordingLink: existingRecordingLink || ''
        });
        setShowOutcomeModal(true);
    };

    const handleUpdateOutcome = async (): Promise<boolean> => {
        if (!selectedAppointment || !outcomeData.outcome) return false;

        try {
            const response = await fetch(`/api/closer/appointments/${selectedAppointment.id}/outcome`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    outcome: outcomeData.outcome,
                    notes: outcomeData.notes,
                    saleValue: outcomeData.saleValue ? parseFloat(outcomeData.saleValue) : null,
                    recordingLink: outcomeData.recordingLink || null,
                }),
            });

            if (response.ok) {
                setShowOutcomeModal(false);
                setSelectedAppointment(null);
                setOutcomeData({ outcome: '', notes: '', saleValue: '', recordingLink: '' });
                return true;
            } else {
                setError('Failed to update appointment outcome');
                return false;
            }
        } catch (error) {
            setError('Network error updating outcome');
            return false;
        }
    };

    const viewLeadDetails = async (appointment: Appointment) => {
        try {
            const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(appointment.customerEmail)}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.lead && data.lead.id) {
                    setSelectedLeadId(data.lead.id);
                } else {
                    setError('Could not find a valid session for this lead.');
                }
            } else {
                setError('Failed to retrieve lead session details.');
            }
        } catch (e) {
            console.error('Error viewing lead details:', e);
            setError('Error preparing to view lead details.');
        }
    };

    return {
        appointments,
        isLoading,
        error,
        fetchAppointments,
        selectedAppointment,
        setSelectedAppointment,
        showOutcomeModal,
        setShowOutcomeModal,
        outcomeData,
        setOutcomeData,
        openOutcomeModal,
        handleUpdateOutcome,
        selectedLeadId,
        viewLeadDetails,
        setSelectedLeadId
    };
}
