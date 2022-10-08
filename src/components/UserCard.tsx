import React, { PureComponent } from "react";
import { RoomObj, UserObj } from "../Types";
import cn from "classnames";
import "./UserCard.scss";
import Loading from "./Loading";

interface UserCardProps {
    user: UserObj;
    small?: boolean;
    room: RoomObj;
}

class UserCard extends PureComponent<UserCardProps> {
    render() {
        const { user } = this.props;
        return (
            <div className={cn("user-card", { small: this.props.small })}>
                <div className="user-card__top">
                    <div
                        className={cn("user-card__top__status", {
                            online: user.status === "online",
                            offline: user.status === "offline",
                        })}
                    ></div>
                </div>
                <div className="user-card__name">
                    {this.props.user.username}
                </div>
                {!this.props.small && user.status === "online" ? (
                    <div className="user-card__result">
                        {this.props.room.votes[this.props.user.username] !==
                        undefined ? (
                            this.props.room.voting ? (
                                "✔"
                            ) : (
                                this.props.room.votes[this.props.user.username]
                            )
                        ) : this.props.room.voting ? (
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
