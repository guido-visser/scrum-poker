import { Dictionary } from "lodash";
import React, { PureComponent } from "react";
import ClientSocket from "../ClientSocket";
import { UserObj } from "../Types";
import "./Voting.scss";

interface VotingProps {
    roomId: string;
    user: UserObj;
    stories: Dictionary<string>;
    votes: Dictionary<number>;
}

class Voting extends PureComponent<VotingProps> {
    render() {
        return (
            <div className="voting">
                {this.props.votes[this.props.user.username] === undefined
                    ? Object.keys(this.props.stories).map((story) => (
                          <Story
                              key={story}
                              point={Number(story)}
                              name={this.props.stories[story]}
                          />
                      ))
                    : null}
                {this.props.user.master ? (
                    <button
                        className="danger"
                        onClick={() => ClientSocket.emit("stopVoting")}
                    >
                        Stop voting
                    </button>
                ) : null}
            </div>
        );
    }
}

interface StoryProps {
    point: number;
    name: string;
}

class Story extends PureComponent<StoryProps> {
    handleClick = () => {
        ClientSocket.emit("castVote", {
            vote: this.props.point,
        });
    };

    render() {
        return (
            <div className="story" onClick={this.handleClick}>
                <div className="story__number">{this.props.point}</div>
                <div className="story__name">{this.props.name}</div>
            </div>
        );
    }
}

export default Voting;
