import { Request, Response } from 'express';
import dataStore from './StoredData';

interface LogEntry {
    username: string;
    deviceId: string;
    ip: string;
    event: 'login_success' | 'login_failure'; // Define event types
    date: string; 
}

const processLog = (logEntry: LogEntry) => {
    const { username, deviceId, ip, event, date } = logEntry;

    // Initialize user if not already present
    if (!dataStore.users[username]) {
        dataStore.users[username] = {
            lastSuccessfulLoginDate: null,
            lastFailedLoginDate: null,
            failedLoginCountLastWeek: 0,
        };
        console.log(`Added new user: ${username}`);
    }

    // Update user data based on event type
    const user = dataStore.users[username];
    const eventDate = new Date(date);

    if (event === 'login_success') {
        user.lastSuccessfulLoginDate = eventDate;
        user.failedLoginCountLastWeek = 0; // Reset count on success
    } else if (event === 'login_failure') {
        user.lastFailedLoginDate = eventDate;
        
        // Check if the last failed login was within the last week
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        user.failedLoginCountLastWeek = (user.lastFailedLoginDate && user.lastFailedLoginDate >= lastWeek) 
            ? user.failedLoginCountLastWeek + 1 
            : 1;
    }

    // Ensure devices and IPs are tracked
    if (!dataStore.devices[deviceId]) {
        dataStore.devices[deviceId] = { isKnown: true };
    }

    if (!dataStore.ips[ip]) {
        const isInternal = ip.startsWith('10.97.2.'); // Example check for internal IP
        dataStore.ips[ip] = { isKnown: true, isInternal };
    }
};

export const logHandler = (req: Request, res: Response) => {
    const logEntry = req.body as LogEntry;

    // Validate log entry
    if (!logEntry.username || !logEntry.deviceId || !logEntry.ip || !logEntry.event || !logEntry.date) {
        return res.status(400).json({ error: 'Missing or invalid log entry fields' });
    }

    // Process log entry
    try {
        processLog(logEntry);
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error processing log entry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
