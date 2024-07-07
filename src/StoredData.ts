export interface User {
    lastSuccessfulLoginDate: Date | null;
    lastFailedLoginDate: Date | null;
    failedLoginCountLastWeek: number;
}

interface Device {
    isKnown: boolean;
}

interface IP {
    isKnown: boolean;
    isInternal: boolean;
}

export class DataStore {
    users: { [key: string]: User } = {};
    devices: { [key: string]: Device } = {};
    ips: { [key: string]: IP } = {};
}

const dataStore = new DataStore();
export default dataStore;


