import React from "react";

const Tab = (props) => (
  <div className={`tab-${props.active ? "active" : "inactive"}`} {...props}>
    {props.children}
  </div>
);

export default Tab;
