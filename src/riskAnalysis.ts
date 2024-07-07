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
            response = { failedLoginCountLastWeek: dataStore.users[value]?.failedLoginCountLastWeek ?? 0 };
            break;
        default:
            response = { error: 'Invalid parameter' };
    }

    res.status(200).json(response);
};
