import React from "react";

class ModalInput extends React.Component {
  render() {
    const { label } = this.props;
    return (
      <div className="input-with-label">
        <span className="label">{label}</span>
        <input {...this.props} />
      </div>
    );
  }
}

export default ModalInput;
