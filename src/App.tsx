import React, { PureComponent } from "react";
import ClientSocket from "./ClientSocket";
import Home from "./Home";
import { LsWrapper, setRoomUrl } from "./Helper";
import Room from "./Room";
import { RoomObj, UserObj } from "./Types";
import "./App.scss";

interface State {
    room: RoomObj | null;
    user: UserObj | null;
}

class App extends PureComponent<Record<string, never>, State> {
    state: State = {
        room: null,
        user: null,
    };

    handleJoin = (room: RoomObj, user: UserObj) => {
        setRoomUrl(room.id);
        LsWrapper.setItem("sp-user", user);
        LsWrapper.setItem("sp-room", { id: room.id, name: room.name });
        this.setState({ room, user });
    };

    handleRoomUpdate = (room: RoomObj | null) => {
        this.setState((state) => {
            if (!room || !state.user) {
                ClientSocket.disconnect();
                setRoomUrl(null);
                LsWrapper.removeItem("sp-user");
                LsWrapper.removeItem("sp-room");
                return {
                    room: null,
                    user: null,
                };
            }

            const updatedUser =
                room.users[state.user.username] ??
                room.spectators[state.user.username] ??
                null;

            if (!updatedUser) {
                ClientSocket.disconnect();
                setRoomUrl(null);
                LsWrapper.removeItem("sp-user");
                LsWrapper.removeItem("sp-room");
                return {
                    room: null,
                    user: null,
                };
            }

            setRoomUrl(room.id);
            LsWrapper.setItem("sp-user", updatedUser);
            LsWrapper.setItem("sp-room", { id: room.id, name: room.name });

            return {
                room,
                user: updatedUser,
            };
        });
    };

    render() {
        const { room, user } = this.state;

        return (
            <div className="app">
                {!room || !user ? (
                    <Home onUpdate={this.handleRoomUpdate} onJoin={this.handleJoin} />
                ) : (
                    <Room room={room} user={user} onUpdate={this.handleRoomUpdate} />
                )}
            </div>
        );
    }
}

export default App;
