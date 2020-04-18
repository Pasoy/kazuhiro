import React from "react";

const ModalHeader = ({ onHide, children }) => (
  <div className="modal-header">
    <div className="title">{children}</div>
    <div className="modal-close" onClick={onHide}>
      <i className="fas fa-times"></i>
    </div>
  </div>
);
const ModalContent = ({ children }) => (
  <div className="modal-content">{children}</div>
);
class Modal extends React.Component {
  render() {
    return (
      <div
        className="blackground"
        style={{ visibility: this.props.show ? "visible" : "hidden" }}
      >
        <div className="Modal-wrapper">
          <div className="Modal">
            <ModalHeader onHide={this.props.onHide}>
              {this.props.title}
            </ModalHeader>
            <ModalContent>{this.props.children}</ModalContent>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
