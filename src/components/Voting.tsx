import { Dictionary } from "lodash";
import React, { PureComponent } from "react";
import ClientSocket from "../ClientSocket";
import "./Voting.scss";

interface VotingProps {
    stories: Dictionary<string>;
    ids: Ids;
    votes: Dictionary<number>;
}

interface Ids {
    room: string;
    user: string;
}

class Voting extends PureComponent<VotingProps> {
    render() {
        console.log();
        return (
            <div className="voting">
                {this.props.votes[this.props.ids.user] === undefined
                    ? Object.keys(this.props.stories).map((story) => {
                          return (
                              <Story
                                  key={story}
                                  ids={this.props.ids}
                                  point={parseInt(story)}
                                  name={this.props.stories[story]}
                              />
                          );
                      })
                    : null}
            </div>
        );
    }
}

interface StoryProps {
    point: number;
    name: string;
    ids: Ids;
}

class Story extends PureComponent<StoryProps> {
    handleClick = () => {
        const { ids, point } = this.props;
        ClientSocket.emit("castVote", {
            roomId: ids.room,
            userId: ids.user,
            vote: point,
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
