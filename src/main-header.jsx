import React from "react";

function MainHeader(props) {
  return (
    <>
      <header className="bg-light py-3">
        <h1>Hi {props.user}, Chat with me!</h1>
      </header>
    </>
  );
} //end 

export default MainHeader;
