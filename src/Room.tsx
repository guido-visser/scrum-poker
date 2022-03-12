import React from "react";
import ClientSocket from "./ClientSocket";
import UserCard from "./components/UserCard";
import { RoomObj, UserObj } from "./Types";
import "./Room.scss";
import Voting from "./components/Voting";
import _, { Dictionary } from "lodash";
import Stories from "./components/Stories";

interface RoomProps {
    room: RoomObj;
    user: UserObj;
    onUpdate: (room: RoomObj) => void;
}

interface State {
    editStories: boolean;
}

class Room extends React.PureComponent<RoomProps, State> {
    state: State = { editStories: false };
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
        return (
            <div className="room">
                <h1 className="app__title">{this.props.room?.name}</h1>
                {!_.isEmpty(this.props.room.votes) &&
                !this.props.room.voting ? (
                    <div className="result">{this.calculateResult()}</div>
                ) : null}
                {this.state.editStories ? (
                    <Stories
                        onCancel={() => this.setState({ editStories: false })}
                        onSave={this.handleSaveStories}
                        stories={this.props.room.stories}
                        room={this.props.room}
                    />
                ) : null}
                {!this.state.editStories ? (
                    <>
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
                        {!this.props.room.voting && this.props.user.isMaster ? (
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
