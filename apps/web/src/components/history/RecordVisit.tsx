'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { saveSearchEntry } from '@/actions/history';

interface RecordVisitProps {
    entityName: string;
}

export function RecordVisit({ entityName }: RecordVisitProps) {
    const queryClient = useQueryClient();
    const hasRecorded = useRef(false);

    useEffect(() => {
        if (!hasRecorded.current) {
            hasRecorded.current = true;

            const record = async () => {
                try {
                    await saveSearchEntry(entityName);
                    // Invalidate user history queries to trigger an update on the home page
                    await queryClient.invalidateQueries({ queryKey: ['user-history'] });
                    await queryClient.invalidateQueries({ queryKey: ['recent-entities'] });
                    await queryClient.invalidateQueries({ queryKey: ['recommended-entities'] });
                } catch (error) {
                    console.error('Failed to record visit:', error);
                }
            };

            record();
        }
    }, [entityName, queryClient]);

    return null;
}
