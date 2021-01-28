export type CountPerDay = {
    date: string,
    count: number;
}

export type VCCountPerDay = {
    lastJoined: string;
    minutes: number;
    isInVc: boolean;
}

export type OnlineMinutesPerDay = {
    lastJoined: string;
    minutes: number;
    isOnline: boolean;
}
