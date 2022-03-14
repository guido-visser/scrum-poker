import React, { PureComponent } from "react";
import ClientSocket from "./ClientSocket";
import { RoomObj, UserObj } from "./Types";
import cn from "classnames";

interface HomeProps {
    room?: string;
    onJoin?: (room: RoomObj, user: UserObj) => void;
    onUpdate?: (room: RoomObj) => void;
}

interface State {
    username: string;
    roomName: string;
    spectator: boolean;
    loading: boolean;
    message: string;
    messageType: "error" | "info";
}

class Home extends PureComponent<HomeProps, State> {
    constructor(props: HomeProps) {
        super(props);
        this.state = {
            username: "",
            roomName: "",
            spectator: false,
            loading: false,
            message: "",
            messageType: null,
        };
    }

    handleCreateJoin = () => {
        //Simple validation
        if (this.state.roomName === "" || this.state.username === "") {
            this.setState({
                message: "Please fill in all fields",
                messageType: "error",
            });
            return;
        }
        this.setState({ loading: true });
        ClientSocket.connect();
        ClientSocket.emit(
            "createJoin",
            {
                roomName: this.state.roomName,
                username: this.state.username,
                spectator: this.state.spectator,
            },
            ({ room, user, message, messageType }) => {
                if (message && messageType) {
                    this.setState({ message, messageType, loading: false });
                    return;
                }
                this.setState({ loading: false });
                this.props.onJoin(room, user);
            }
        );
    };

    handlePressEnter = (e: any) =>
        e.keyCode === 13 ? this.handleCreateJoin() : null;

    render() {
        return (
            <div className="home">
                <h1 className="app__title">Scrum Poker</h1>
                <h2>Get the most out of your refinement meeting</h2>
                <div className="app__form">
                    <input
                        className="txtField"
                        placeholder="Name"
                        type="text"
                        onKeyDown={this.handlePressEnter}
                        onChange={(e: any) =>
                            this.setState({ username: e?.target?.value })
                        }
                        value={this.state.username}
                    />
                    <input
                        className="txtField"
                        placeholder="Room name"
                        type="text"
                        onKeyDown={this.handlePressEnter}
                        onChange={(e: any) =>
                            this.setState({ roomName: e?.target?.value })
                        }
                        value={this.state.roomName}
                    />
                    <label htmlFor="chkSpectator">
                        Spectator:{" "}
                        <input
                            id="chkSpectator"
                            type="checkbox"
                            checked={this.state.spectator}
                            onChange={(e) =>
                                this.setState({ spectator: e.target.checked })
                            }
                        />
                    </label>

                    <button
                        disabled={this.state.loading}
                        onClick={this.handleCreateJoin}
                        style={{ width: "100%", marginTop: 10 }}
                    >
                        Create / Join
                    </button>
                    {this.state.message ? (
                        <div
                            className={cn("message", {
                                error: this.state.messageType === "error",
                                info: this.state.messageType === "info",
                            })}
                        >
                            {this.state.message}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default Home;
