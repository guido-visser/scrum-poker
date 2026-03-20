import React, { PureComponent } from "react";
import cn from "classnames";
import { RoomObj, UserObj } from "../Types";
import Loading from "./Loading";
import "./UserCard.scss";

interface UserCardProps {
    user: UserObj;
    small?: boolean;
    room: RoomObj;
}

class UserCard extends PureComponent<UserCardProps> {
    render() {
        const { user, room, small } = this.props;
        return (
            <div className={cn("user-card", { small })}>
                <div className="user-card__top">
                    <div
                        className={cn("user-card__top__status", {
                            online: user.status === "online",
                            offline: user.status === "offline",
                        })}
                    ></div>
                </div>
                <div className="user-card__name">{user.username}</div>
                {!small && user.status === "online" ? (
                    <div className="user-card__result">
                        {room.votes[user.username] !== undefined ? (
                            room.voting ? (
                                "🏁"
                            ) : (
                                room.votes[user.username]
                            )
                        ) : room.voting ? (
                            <Loading />
                        ) : (
                            "-"
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default UserCard;
