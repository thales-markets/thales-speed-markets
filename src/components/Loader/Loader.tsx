import React from "react";
import styled from "styled-components";

// need to add circular loader

const Loader: React.FC = () => {
  return (
    <Wrapper>
      <></>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  backdrop-filter: blur(4px);
  background: ${(props) => props.theme.background.primary};
`;

export default Loader;
