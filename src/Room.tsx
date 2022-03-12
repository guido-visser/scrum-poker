import React from "react";
import "./App.scss";
import ClientSocket from "./ClientSocket";
import { RoomObj, UserObj } from "./Types";

interface RoomProps {
    room: RoomObj;
    user: UserObj;
    onUpdate: (room: RoomObj) => void;
}

class Room extends React.PureComponent<RoomProps> {
    componentDidMount() {
        ClientSocket.subscribe("roomUpdate", (room) => {
            console.log("ROOM UPDATE", room);
            this.props.onUpdate(room);
        });
    }

    componentWillUnmount() {
        ClientSocket.disconnect();
    }

    handleClick = () => {
        ClientSocket.emit("roomUpdateTest", this.props.room.id);
    };

    render() {
        return (
            <div className="room">
                <h1 onClick={this.handleClick}>{this.props.room?.name}</h1>
                Welcome{" "}
                {Object.keys(this.props.room.users)
                    .map((id) => this.props.room.users[id].username)
                    .join(", ")}
                !
            </div>
        );
    }
}

export default Room;
