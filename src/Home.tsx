import React, { PureComponent } from "react";
import ClientSocket from "./ClientSocket";
import { RoomObj, UserObj } from "./Types";

interface HomeProps {
    room?: string;
    onJoin?: (room: RoomObj, user: UserObj) => void;
    onUpdate?: (room: RoomObj) => void;
}

interface State {
    username: string;
    roomName: string;
    loading: boolean;
}

class Home extends PureComponent<HomeProps, State> {
    constructor(props: HomeProps) {
        super(props);
        this.state = { username: "Guido", roomName: "S4M", loading: false };
    }

    handleCreateJoin = () => {
        this.setState({ loading: true });
        ClientSocket.connect();
        ClientSocket.emit(
            "createJoin",
            {
                roomName: this.state.roomName,
                username: this.state.username,
            },
            ({ room, user }) => {
                this.setState({ loading: false });
                this.props.onJoin(room, user);
            }
        );
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
                        onChange={(e: any) => {
                            console.log(e);
                            this.setState({ username: e?.target?.value });
                        }}
                        value={this.state.username}
                    />
                    <input
                        className="txtField"
                        placeholder="Room name"
                        type="text"
                        onChange={(e: any) => {
                            console.log(e);
                            this.setState({ roomName: e?.target?.value });
                        }}
                        value={this.state.roomName}
                    />
                    <button
                        disabled={this.state.loading}
                        onClick={this.handleCreateJoin}
                        style={{ width: "100%", marginTop: 10 }}
                    >
                        Create / Join
                    </button>
                </div>
            </div>
        );
    }
}

export default Home;
