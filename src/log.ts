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
    }

    // Update user data based on event type
    const user = dataStore.users[username];
    const eventDate = new Date(date);

    if (event === 'login_success') {
        user.lastSuccessfulLoginDate = eventDate;
        user.failedLoginCountLastWeek = 0; // Reset count on success
    } else if (event === 'login_failure') {
        user.lastFailedLoginDate = eventDate;
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
        processLog(logEntry);
        res.status(200).json({ status: 'success' });
};
