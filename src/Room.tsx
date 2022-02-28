import React from "react";
import "./App.scss";
import io, { Socket } from "socket.io-client";
import { Button } from "antd";

interface RoomProps {
    room: string;
}

class Room extends React.PureComponent<RoomProps> {
    socket: Socket = null;

    componentDidMount() {
        this.socket = io();
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    handleClick = () => {
        this.socket.emit("message", "world");
    };

    render() {
        return (
            <div className="room">
                <h1>{this.props.room}</h1>
                Welcome!
            </div>
        );
    }
}

export default Room;
