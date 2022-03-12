import React from "react";
import ClientSocket from "./ClientSocket";
import UserCard from "./components/UserCard";
import { RoomObj, UserObj } from "./Types";
import "./Room.scss";
import Voting from "./components/Voting";
import _ from "lodash";

interface RoomProps {
    room: RoomObj;
    user: UserObj;
    onUpdate: (room: RoomObj) => void;
}

interface State {
    voting: boolean;
}

class Room extends React.PureComponent<RoomProps, State> {
    leaving = window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        this.handleLeaveRoom();
    });

    componentDidMount() {
        ClientSocket.subscribe("roomUpdate", (room) => {
            console.log("ROOM UPDATE", room);
            this.props.onUpdate(room);
        });
    }

    componentWillUnmount() {
        this.handleLeaveRoom();
    }

    handleLeaveRoom = () => {
        ClientSocket.emit("leaveRoom", {
            roomId: this.props.room.id,
            userId: this.props.user.id,
        });
        ClientSocket.disconnect();
        this.props.onUpdate(null);
    };

    handleStartVoting = () => {
        ClientSocket.emit("startVoting", this.props.room.id);
    };

    calculateResult = (): number => {
        let total = 0;
        let totalUsers = Object.keys(this.props.room.votes).length;
        Object.keys(this.props.room.votes).forEach((vote) => {
            total = total + this.props.room.votes[vote];
        });
        return total / totalUsers;
    };

    render() {
        return (
            <div className="room">
                <h1 className="app__title">{this.props.room?.name}</h1>
                {!_.isEmpty(this.props.room.votes) &&
                !this.props.room.voting ? (
                    <div className="result">{this.calculateResult()}</div>
                ) : null}
                <div className="users">
                    {Object.keys(this.props.room.users).map((id) => (
                        <UserCard
                            key={id}
                            user={this.props.room.users[id]}
                            small={
                                !this.props.room.voting &&
                                _.isEmpty(this.props.room.votes)
                            }
                            room={this.props.room}
                        />
                    ))}
                </div>
                {!this.props.room.voting ? (
                    <button onClick={this.handleStartVoting}>
                        Start voting
                    </button>
                ) : (
                    <Voting
                        ids={{
                            room: this.props.room.id,
                            user: this.props.user.id,
                        }}
                        stories={this.props.room.stories}
                        votes={this.props.room.votes}
                    />
                )}
            </div>
        );
    }
}

export default Room;
