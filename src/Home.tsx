import React, { PureComponent } from "react";
import cn from "classnames";
import ClientSocket from "./ClientSocket";
import { getRoomIdFromUrl, LsWrapper, setRoomUrl } from "./Helper";
import { RoomObj, UserObj } from "./Types";

interface HomeProps {
    onJoin?: (room: RoomObj, user: UserObj) => void;
    onUpdate?: (room: RoomObj | null) => void;
}

interface State {
    username: string;
    roomName: string;
    spectator: boolean;
    loading: boolean;
    loadingRoom: boolean;
    message: string;
    messageType: "error" | "info" | null;
    roomId: string | null;
}

class Home extends PureComponent<HomeProps, State> {
    state: State = {
        username: "",
        roomName: "",
        spectator: false,
        loading: false,
        loadingRoom: false,
        message: "",
        messageType: null,
        roomId: null,
    };

    componentDidMount() {
        const room = LsWrapper.getItem("sp-room");
        const user = LsWrapper.getItem("sp-user");
        const roomIdFromUrl = getRoomIdFromUrl();

        this.setState({
            username: user?.username || "",
            roomName: room?.name || "",
            roomId: roomIdFromUrl || room?.id || null,
        });

        if (roomIdFromUrl) {
            this.loadRoomFromLink(roomIdFromUrl);
        }
    }

    loadRoomFromLink = async (roomId: string) => {
        this.setState({ loadingRoom: true, message: "", messageType: null });

        try {
            const response = await fetch(`/api/rooms/${roomId}`);
            if (!response.ok) {
                throw new Error("This room link is no longer active.");
            }

            const room = (await response.json()) as Pick<RoomObj, "id" | "name">;
            this.setState({
                roomName: room.name,
                roomId: room.id,
                loadingRoom: false,
                message: "Shared room loaded. Enter your name to join.",
                messageType: "info",
            });
        } catch (error) {
            setRoomUrl(null);
            this.setState({
                loadingRoom: false,
                roomId: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "This room link is no longer active.",
                messageType: "error",
            });
        }
    };

    handleCreateJoin = () => {
        if (this.state.loading || this.state.loadingRoom) {
            return;
        }

        if (this.state.roomName.trim() === "" || this.state.username.trim() === "") {
            this.setState({
                message: "Please fill in all fields",
                messageType: "error",
            });
            return;
        }

        this.setState({ loading: true, message: "", messageType: null });
        ClientSocket.connect();
        ClientSocket.emit(
            "createJoin",
            {
                roomId: this.state.roomId,
                roomName: this.state.roomName,
                username: this.state.username,
                spectator: this.state.spectator,
            },
            ({ room, user, message, messageType, error }) => {
                if (error) {
                    this.setState({
                        loading: false,
                        message: error,
                        messageType: "error",
                    });
                    return;
                }

                if (message && messageType) {
                    this.setState({ loading: false, message, messageType });
                    return;
                }

                this.setState({ loading: false, roomId: room.id });
                this.props.onJoin?.(room, user);
            }
        );
    };

    handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            this.handleCreateJoin();
        }
    };

    handleUsernameChange = (username: string) => {
        this.setState({
            username,
            message: "",
            messageType: null,
        });
    };

    handleRoomNameChange = (roomName: string) => {
        const hasJoinParam = Boolean(getRoomIdFromUrl());
        this.setState({
            roomName,
            roomId: hasJoinParam ? null : this.state.roomId,
            message: "",
            messageType: null,
        });

        if (hasJoinParam) {
            setRoomUrl(null);
        }
    };

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
                        onChange={(e) => this.handleUsernameChange(e.target.value)}
                        value={this.state.username}
                    />
                    <input
                        className="txtField"
                        placeholder="Room name"
                        type="text"
                        onKeyDown={this.handlePressEnter}
                        onChange={(e) => this.handleRoomNameChange(e.target.value)}
                        value={this.state.roomName}
                    />
                    <label htmlFor="chkSpectator">
                        Spectator:{" "}
                        <input
                            id="chkSpectator"
                            type="checkbox"
                            checked={this.state.spectator}
                            onChange={(e) =>
                                this.setState({
                                    spectator: e.target.checked,
                                    message: "",
                                    messageType: null,
                                })
                            }
                        />
                    </label>

                    <button
                        disabled={this.state.loading || this.state.loadingRoom}
                        onClick={this.handleCreateJoin}
                        style={{ width: "100%", marginTop: 10 }}
                    >
                        {this.state.loadingRoom ? "Loading room..." : "Create / Join"}
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
