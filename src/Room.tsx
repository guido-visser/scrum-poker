import React from "react";
import ClientSocket from "./ClientSocket";
import UserCard from "./components/UserCard";
import { RoomObj, UserObj } from "./Types";
import "./Room.scss";
import Voting from "./components/Voting";
import _, { Dictionary } from "lodash";
import Stories from "./components/Stories";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface RoomProps {
    room: RoomObj;
    user: UserObj;
    onUpdate: (room: RoomObj) => void;
}

interface State {
    editStories: boolean;
    lastVoteTime: number;
}

class Room extends React.PureComponent<RoomProps, State> {
    state: State = { editStories: false, lastVoteTime: 0 };
    leaving = window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        this.handleLeaveRoom();
    });

    componentDidMount() {
        ClientSocket.subscribe("roomUpdate", (room) => {
            this.props.onUpdate(room);
        });

        setInterval(() => {
            this.setState({ lastVoteTime: this.state.lastVoteTime + 1 });
        }, 60000);
    }

    componentWillUnmount() {
        this.handleLeaveRoom();
    }

    handleLeaveRoom = () => {
        ClientSocket.emit("leaveRoom", {
            roomId: this.props.room.id,
            userId: this.props.user.id,
        });
        ClientSocket.unsubscribe(this.props.room.id);
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
        return Math.round((total / totalUsers + Number.EPSILON) * 100) / 100;
    };

    handleEditStories = () => {
        this.setState({ editStories: true });
    };

    handleSaveStories = (stories: Dictionary<string>) => {
        ClientSocket.emit("saveStories", {
            roomId: this.props.room.id,
            stories,
        });
        this.setState({ editStories: false });
    };

    render() {
        const { room, user } = this.props;
        const specs = Object.keys(room.spectators).map((id) => {
            const spec = room.spectators[id];
            return spec.username;
        });

        const spectators =
            specs.length > 1
                ? specs.slice(0, -1).join(", ") + " and " + specs.slice(-1)
                : specs.join(", ");

        return (
            <div className="room">
                <h1 className="app__title">{room?.name}</h1>
                {spectators ? (
                    <div>{`${spectators} ${
                        specs.length > 1 ? "are" : "is"
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
                        room={room}
                    />
                ) : null}
                {!this.state.editStories ? (
                    <>
                        <div className="users">
                            {Object.keys(room.users)
                                .filter((user) => !room.users[user].spectator)
                                .map((id) => (
                                    <UserCard
                                        key={id}
                                        user={room.users[id]}
                                        small={
                                            !room.voting &&
                                            _.isEmpty(room.votes)
                                        }
                                        room={room}
                                    />
                                ))}
                        </div>
                        {!room.voting && !user.spectator ? (
                            <button onClick={this.handleStartVoting}>
                                Start voting
                            </button>
                        ) : !user.spectator ? (
                            <Voting
                                ids={{
                                    room: room.id,
                                    user: user.username,
                                }}
                                stories={room.stories}
                                votes={room.votes}
                            />
                        ) : (
                            "You are a spectator and can't vote"
                        )}
                        {!room.voting && user.master ? (
                            <div style={{ marginTop: 10 }}>
                                <button onClick={this.handleEditStories}>
                                    Edit stories
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
        );
    }
}

export default Room;
