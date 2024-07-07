import { Request, Response } from 'express';
import dataStore from './StoredData';
import { log } from 'console';

export const riskHandler = (req: Request, res: Response) => {
    const { parameter } = req.params;
    const value = req.query.value as string;

    let response;

    switch (parameter) {
        case 'isuserknown':
            response = { isUserKnown: !!dataStore.users[value] };
            break;
        case 'isclientknown':
            response = { isClientKnown: !!dataStore.devices[value] };
            break;
        case 'isipknown':
            response = { isIPKnown: !!dataStore.ips[value] };
            break;
        case 'isipinternal':
            response = { isIPInternal: dataStore.ips[value]?.isInternal ?? false };
            break;
        case 'failedlogincountlastweek':
            // Ensure username is provided in the query
            if (typeof value !== 'string') {
                return res.status(400).json({ error: 'Username parameter is required for failedlogincountlastweek' });
            }
            
            const user = dataStore.users[value];
            response = { failedLoginCountLastWeek: user ? user.failedLoginCountLastWeek : 0 };
            break;
        default:
            response = { error: 'Invalid parameter' };
    }

    res.status(200).json(response);
};
