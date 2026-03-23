import { Dictionary } from "lodash";
import React, { PureComponent } from "react";
import "./Stories.scss";

interface StoriesProps {
    onCancel: () => void;
    onSave: (stories: Dictionary<string>) => void;
    stories: Dictionary<string>;
}

interface State {
    stories: Dictionary<string>;
}

class Stories extends PureComponent<StoriesProps, State> {
    constructor(props: StoriesProps) {
        super(props);
        this.state = {
            stories: { ...props.stories },
        };
    }

    handlePointChange = (story: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextPoint = e.target.value;
        if (nextPoint !== story && this.state.stories[nextPoint] !== undefined) {
            return;
        }

        const nextStories = { ...this.state.stories };
        delete nextStories[story];
        nextStories[nextPoint] = nextStories[nextPoint] ?? "";
        this.setState({ stories: nextStories });
    };

    handleStoryNameChange =
        (story: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                stories: { ...this.state.stories, [story]: e.target.value },
            });
        };

    render() {
        return (
            <div className="stories">
                {Object.keys(this.state.stories).map((story) => (
                    <div key={story}>
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
                ))}
                <div style={{ marginTop: 10 }}>
                    <button onClick={this.props.onCancel} style={{ marginRight: 10 }}>
                        Cancel
                    </button>
                    <button onClick={() => this.props.onSave(this.state.stories)}>
                        Save
                    </button>
                </div>
            </div>
        );
    }
}

export default Stories;
