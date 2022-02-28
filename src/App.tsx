import React, { PureComponent } from "react";
import { getParams } from "./Helper";
import Home from "./Home";
import Room from "./Room";

interface State {
    room: string;
}

class App extends PureComponent<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { room: getParams?.join || "" };
    }

    handleSetRoom = (room: string) => {
        this.setState({ room });
    };

    render() {
        const { room } = this.state;
        return (
            <div className="app">
                {!room ? (
                    <Home onRoomChange={this.handleSetRoom} />
                ) : (
                    <Room room={room} />
                )}
            </div>
        );
    }
}

export default App;
