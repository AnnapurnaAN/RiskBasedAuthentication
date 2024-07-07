import { Request, Response } from 'express';
import dataStore, { User } from './StoredData'; // Adjust import based on your data structure

export const printUsersHandler = (req: Request, res: Response) => {
    console.log('Users in dataStore:', dataStore.users);
    res.status(200).json({ status: 'Users printed to console' });
};