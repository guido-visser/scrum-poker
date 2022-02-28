import { Button, Input } from "antd";
import React, { PureComponent } from "react";
import ClientSocket from "./ClientSocket";

interface HomeProps {
    room?: string;
    onRoomChange?: (room: string) => void;
}

interface State {
    username: string;
    roomName: string;
}

class Home extends PureComponent<HomeProps, State> {
    constructor(props: HomeProps) {
        super(props);
        this.state = { username: "", roomName: "" };
    }

    handleCreateJoin = () => {
        const { roomName, username } = this.state;
        ClientSocket.connect();
        ClientSocket.subscribe("createdRoom", (roomId: string) => {
            this.props.onRoomChange(roomId);
        });
        ClientSocket.emit("createJoin", { roomName, username });
    };

    render() {
        return (
            <div className="home">
                <h1 className="app__title">Scrum Poker</h1>
                <h2>Get the most out of your refinement meeting</h2>
                <div className="app__form">
                    <Input
                        className="txtField"
                        placeholder="Name"
                        size="large"
                        onChange={(e: any) =>
                            this.setState({ username: e?.target?.value })
                        }
                    />
                    <hr />
                    <Input
                        className="txtField"
                        placeholder="Room name"
                        size="large"
                        onChange={(e: any) =>
                            this.setState({ roomName: e?.target?.value })
                        }
                        value={this.state.roomName}
                    />
                    <Button
                        onClick={this.handleCreateJoin}
                        style={{ width: "100%", marginTop: 10 }}
                    >
                        Create / Join
                    </Button>
                </div>
            </div>
        );
    }
}

export default Home;
