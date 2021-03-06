import React from "react";

const Svg = ({ innerRef, ...props }) => (
  <svg
    ref={innerRef}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  />
);

const Path = ({ innerRef, ...props }) => (
  <path fill="none" stroke="none" ref={innerRef} {...props} />
);

function useAvailableLength({ pathRef, textRef }) {
  const [availableLength, setAvailableLength] = React.useState(0);

  React.useEffect(() => {
    const { current: pathNode } = pathRef;
    const { current: textNode } = textRef;

    // get last tspan node
    const lastTspan = textNode.childNodes[textNode.childNodes.length - 1];
    const availableLength =
      pathNode.getTotalLength() - lastTspan.getComputedTextLength();

    setAvailableLength(availableLength);
  }, [pathRef, textRef]);

  return availableLength;
}

function usePickerSwitch({ svgRef, length, defaultActive = 0 }) {
  const [currentActive, setCurrentActive] = React.useState(defaultActive);
  const [previousActive, setPreviousActive] = React.useState(null);

  React.useEffect(() => {
    const { current: svgNode } = svgRef;

    setPreviousActive(currentActive);
    svgNode.style.setProperty("--length", length);
    svgNode.style.setProperty("--active", currentActive);
  }, [svgRef, currentActive, length]);

  return [currentActive, previousActive, setCurrentActive];
}

export default function Picker({
  items,
  fontSize = 2,
  startOffset = "0",
  defaultActive = 0,
  onClick = () => {}
}) {
  const svgRef = React.createRef();
  const pathRef = React.createRef();
  const textRef = React.createRef();

  const availableLength = useAvailableLength({ pathRef, textRef });
  const [currentActive, previousActive, setCurrentActive] = usePickerSwitch({
    svgRef,
    length: items.length - 1,
    defaultActive
  });

  return (
    <Svg innerRef={svgRef} id="picker">
      <Path innerRef={pathRef} id="path" d="M 5, 50 a 1,1 0 1,1 90,0" />
      <text>
        <textPath
          ref={textRef}
          href="#path"
          startOffset={startOffset}
          fontSize={fontSize}
        >
          {items.map((item, i) => {
            const percent = i / (items.length - 1);
            return (
              <tspan
                onClick={() => {
                  setCurrentActive(i);
                  onClick({ current: i, previous: previousActive });
                }}
                style={{
                  "--opacity": getOpacity(currentActive, i)
                }}
                x={percent * availableLength}
                key={i}
              >
                {item}
              </tspan>
            );
          })}
        </textPath>
      </text>
    </Svg>
  );
}

function getOpacity(currentActive, i) {
  // Item after 1 / step will be completely transparent
  const step = 0.25;
  const result = 1 - step * Math.abs(currentActive - i);

  return result >= 0 ? result : 0;
}
