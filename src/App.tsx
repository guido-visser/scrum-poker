import React, { PureComponent } from "react";
import { getParams } from "./Helper";
import Home from "./Home";
import Room from "./Room";
import { RoomObj, UserObj } from "./Types";

interface State {
    room: RoomObj;
    user: UserObj;
}

class App extends PureComponent<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { room: getParams?.join || "", user: null };
    }

    handleJoin = (room: RoomObj, user: UserObj) => {
        this.setState({ room, user });
    };

    handleRoomUpdate = (room: RoomObj) => {
        this.setState({ room });
    };

    render() {
        const { room } = this.state;
        return (
            <div className="app">
                {!room ? (
                    <Home
                        onUpdate={this.handleRoomUpdate}
                        onJoin={this.handleJoin}
                    />
                ) : (
                    <Room
                        room={this.state.room}
                        user={this.state.user}
                        onUpdate={this.handleRoomUpdate}
                    />
                )}
            </div>
        );
    }
}

export default App;
