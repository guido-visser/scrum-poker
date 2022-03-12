import React, { PureComponent } from "react";
import "./Loading.scss";

interface LoadingProps {}

class Loading extends PureComponent<LoadingProps> {
    render() {
        return (
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        );
    }
}

export default Loading;
