import { Dictionary } from "lodash";

export interface RoomObj {
    id: string;
    name: string;
    users: Dictionary<UserObj>;
}

export interface UserObj {
    id: string;
    username: string;
    isMaster?: boolean;
}
