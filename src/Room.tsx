import _ from "lodash";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import ClientSocket from "./ClientSocket";
import Stories from "./components/Stories";
import UserCard from "./components/UserCard";
import Voting from "./components/Voting";
import { RoomObj, UserObj } from "./Types";
import "./Room.scss";

dayjs.extend(relativeTime);

interface RoomProps {
    room: RoomObj;
    user: UserObj;
    onUpdate: (room: RoomObj | null) => void;
}

interface State {
    editStories: boolean;
    lastVoteTime: number;
}

class Room extends React.PureComponent<RoomProps, State> {
    state: State = { editStories: false, lastVoteTime: 0 };
    intervalId?: number;

    componentDidMount() {
        ClientSocket.subscribe<RoomObj | null>("roomUpdate", (room) => {
            this.props.onUpdate(room);
        });

        window.addEventListener("beforeunload", this.handleBeforeUnload);
        this.intervalId = window.setInterval(() => {
            this.setState((state) => ({ lastVoteTime: state.lastVoteTime + 1 }));
        }, 60000);
    }

    componentWillUnmount() {
        ClientSocket.unsubscribe("roomUpdate");
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
    }

    handleBeforeUnload = () => {
        ClientSocket.emit("leaveRoom");
    };

    handleLeaveRoom = () => {
        ClientSocket.emit("leaveRoom");
        ClientSocket.unsubscribe("roomUpdate");
        ClientSocket.disconnect();
        this.props.onUpdate(null);
    };

    handleStartVoting = () => {
        ClientSocket.emit("startVoting");
    };

    calculateResult = (): number => {
        let total = 0;
        const totalUsers = Object.keys(this.props.room.votes).length;
        Object.values(this.props.room.votes).forEach((vote) => {
            total += vote;
        });
        return Math.round((total / totalUsers + Number.EPSILON) * 100) / 100;
    };

    handleEditStories = () => {
        this.setState({ editStories: true });
    };

    handleSaveStories = (stories: Record<string, string>) => {
        ClientSocket.emit("saveStories", { stories });
        this.setState({ editStories: false });
    };

    render() {
        const { room, user } = this.props;
        const spectatorNames = Object.keys(room.spectators).map(
            (id) => room.spectators[id].username
        );
        const spectators =
            spectatorNames.length > 1
                ? `${spectatorNames.slice(0, -1).join(", ")} and ${spectatorNames.slice(-1)}`
                : spectatorNames.join(", ");

        return (
            <div className="room">
                <h1 className="app__title">{room.name}</h1>
                {spectators ? (
                    <div>{`${spectators} ${
                        spectatorNames.length > 1 ? "are" : "is"
                    } spectating`}</div>
                ) : null}
                {room.lastVoteTime ? (
                    <div className="last_vote">
                        Last vote: {dayjs(room.lastVoteTime).fromNow()}
                    </div>
                ) : null}
                {!_.isEmpty(room.votes) && !room.voting ? (
                    <div className="result">{this.calculateResult()}</div>
                ) : null}
                {this.state.editStories ? (
                    <Stories
                        onCancel={() => this.setState({ editStories: false })}
                        onSave={this.handleSaveStories}
                        stories={room.stories}
                    />
                ) : null}
                {!this.state.editStories ? (
                    <>
                        <div className="users">
                            {Object.keys(room.users)
                                .filter((username) => !room.users[username].spectator)
                                .map((username) => (
                                    <UserCard
                                        key={username}
                                        user={room.users[username]}
                                        small={!room.voting && _.isEmpty(room.votes)}
                                        room={room}
                                    />
                                ))}
                        </div>
                        {!room.voting && !user.spectator ? (
                            <button onClick={this.handleStartVoting}>Start voting</button>
                        ) : room.voting && !user.spectator ? (
                            <Voting
                                roomId={room.id}
                                user={user}
                                stories={room.stories}
                                votes={room.votes}
                            />
                        ) : (
                            "You are a spectator and can't vote"
                        )}
                        {!room.voting && user.master ? (
                            <div style={{ marginTop: 10 }}>
                                <button onClick={this.handleEditStories}>Edit stories</button>
                            </div>
                        ) : null}
                        <div style={{ marginTop: 10 }}>
                            <button className="danger" onClick={this.handleLeaveRoom}>
                                Leave room
                            </button>
                        </div>
                    </>
                ) : null}
            </div>
        );
    }
}

export default Room;
