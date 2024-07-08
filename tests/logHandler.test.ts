import { Request, Response } from 'express';
import { processLog, logHandler } from '../src/log'; // Adjust the import path as needed
import dataStore from '../src/StoredData'; // Adjust the import path as needed

jest.mock('../src/StoredData', () => ({
    users: {},
    devices: {},
    ips: {}
}));

jest.mock('../src/log', () => {
    const originalModule = jest.requireActual('../src/log');
    return {
        ...originalModule,
        processLog: jest.fn(originalModule.processLog)
    };
});

type EventType = 'login_success' | 'login_failure';

interface LogEntry {
    username: string;
    deviceId: string;
    ip: string;
    event: EventType;
    date: string;
}

function createLogEntry(event: 'login_success' | 'login_failure', date: string) {
    return {
        username: 'testuser',
        deviceId: 'device123',
        ip: '192.168.0.1',
        event,
        date,
    };
}

describe('processLog', () => {
    beforeEach(() => {
        // Clear the dataStore before each test
        dataStore.users = {};
        dataStore.devices = {};
        dataStore.ips = {};

        // Reset testuser data
        dataStore.users['testuser'] = {
            lastSuccessfulLoginDate: null,
            lastFailedLoginDate: null,
            failedLoginCountLastWeek: 0,
        };
    });

    const createLogEntry = (event: EventType, date: string): LogEntry => ({
        username: 'testuser',
        deviceId: 'device123',
        ip: '192.168.0.1',
        event,
        date
    });

    test('should add new user and update on login success', () => {
        const entry = createLogEntry('login_success', new Date().toISOString());
        (processLog as jest.Mock).mockImplementationOnce(require('../src/log').processLog);

        processLog(entry);

        expect(dataStore.users['testuser']).toBeDefined();
        expect(dataStore.users['testuser'].lastSuccessfulLoginDate).toBeInstanceOf(Date);
        expect(dataStore.users['testuser'].failedLoginCountLastWeek).toBe(0);
    });

    test('should update failed login count on login failure', () => {
        const entry = createLogEntry('login_failure', new Date().toISOString());
        (processLog as jest.Mock).mockImplementationOnce(require('../src/log').processLog);

        processLog(entry);
        processLog(entry);

        expect(dataStore.users['testuser']).toBeDefined();
        expect(dataStore.users['testuser'].lastFailedLoginDate).toBeInstanceOf(Date);
        expect(dataStore.users['testuser'].failedLoginCountLastWeek).toBe(2);
    });


    test('should handle devices and IPs correctly', () => {
        const entry = createLogEntry('login_success', new Date().toISOString());

        processLog(entry);

        expect(dataStore.devices['device123']).toBeDefined();
        expect(dataStore.devices['device123'].isKnown).toBe(true);

        expect(dataStore.ips['192.168.0.1']).toBeDefined();
        expect(dataStore.ips['192.168.0.1'].isKnown).toBe(true);
        expect(dataStore.ips['192.168.0.1'].isInternal).toBe(false); // Adjust based on expected behavior
    });


    test('should handle internal IPs correctly', () => {
        const entry: LogEntry = {
            username: 'testuser',
            deviceId: 'device123',
            ip: '10.97.2.1',
            event: 'login_success',
            date: new Date().toISOString()
        };

        (processLog as jest.Mock).mockImplementationOnce(require('../src/log').processLog);

        processLog(entry);

        expect(dataStore.ips['10.97.2.1']).toBeDefined();
        expect(dataStore.ips['10.97.2.1'].isInternal).toBe(true);
    });
});

describe('logHandler', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let json: jest.Mock;

    beforeEach(() => {
        json = jest.fn();
        res = {
            status: jest.fn().mockReturnValue({ json })
        };
    });

    test('should return 400 for missing fields', () => {
        req = {
            body: {}
        };

        logHandler(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({ error: 'Missing or invalid log entry fields' });
    });

    test('should process log entry and return 200 for valid input', () => {
        req = {
            body: {
                username: 'testuser',
                deviceId: 'device123',
                ip: '192.168.0.1',
                event: 'login_success',
                date: new Date().toISOString()
            }
        };

        logHandler(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({ status: 'success' });
    });

    test('should return 400 for Missing or invalid log entry fields', () => {
        const req = { body: createLogEntry('login_failure', new Date().toISOString()) } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        delete req.body.username;

        logHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid log entry fields'});
    });
    
});