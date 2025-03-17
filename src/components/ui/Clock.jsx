// Clock.jsx
import { h } from 'preact';
import IconClock from '../../assets/clock.svg?raw'; // Import the SVG

const Clock = ({ customClass, ariaLabel }) => {
  // Set a default aria-label if one is not provided
  const defaultAriaLabel = 'Clock icon for special consideration';
  const label = ariaLabel || defaultAriaLabel;

  // Modify the SVG string to include the ID and aria-label
  const svgWithAttributes = IconClock.replace('<svg', `<svg id="icon-clock" aria-label="${label}" role="img"`);
  return <div className={customClass ? customClass : 'icon-clock-container'} dangerouslySetInnerHTML={{ __html: svgWithAttributes }} />;
};

export default Clock;
