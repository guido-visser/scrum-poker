import { Dictionary } from "lodash";

export interface RoomObj {
    id: string;
    name: string;
    users: Dictionary<UserObj>;
    votes: Dictionary<number>;
    voting: boolean;
    stories: Dictionary<string>;
}

export interface UserObj {
    id: string;
    username: string;
    master?: boolean;
    spectator?: boolean;
}
