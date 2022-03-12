import { Dictionary } from "lodash";
import React, { PureComponent } from "react";
import ClientSocket from "../ClientSocket";
import { RoomObj } from "../Types";
import "./Stories.scss";

interface StoriesProps {
    onCancel: () => void;
    onSave: (stories: Dictionary<string>) => void;
    stories: Dictionary<string>;
    room: RoomObj;
}

interface State {
    stories: Dictionary<string>;
}

class Stories extends PureComponent<StoriesProps, State> {
    constructor(props: StoriesProps) {
        super(props);
        this.state = {
            stories: props.stories,
        };
    }

    handlePointChange = (story: string) => (e: any) => {
        //No more than 1 story can have an empty point input value at a time
        if (Object.keys(this.state.stories).find((story) => story === "")) {
            return;
        }
        this.setState({
            stories: {
                ...this.state.stories,
                [e.target.value]: this.state.stories[e.target.value],
            },
        });
    };

    handleStoryNameChange = (story: string) => (e: any) => {
        this.setState({
            stories: { ...this.state.stories, [story]: e.target.value },
        });
    };

    render() {
        return (
            <div className="stories">
                {Object.keys(this.state.stories).map((story) => {
                    return (
                        <div>
                            <input
                                style={{ width: 30 }}
                                type="number"
                                value={story}
                                onChange={this.handlePointChange(story)}
                            />{" "}
                            <input
                                type="text"
                                value={this.state.stories[story]}
                                onChange={this.handleStoryNameChange(story)}
                            />
                        </div>
                    );
                })}
                <div style={{ marginTop: 10 }}>
                    <button
                        onClick={this.props.onCancel}
                        style={{ marginRight: 10 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            ClientSocket.emit("saveStories", {
                                roomId: this.props.room.id,
                            });
                            this.props.onSave(this.state.stories);
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }
}

export default Stories;
