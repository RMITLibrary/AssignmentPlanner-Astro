// Clock.jsx
import { h } from 'preact';
import IconClock from '../../assets/clock.svg?raw'; // Import the SVG

const Clock = ({ customClass }) => {
  // Modify the SVG string to include the ID
  const svgWithId = IconClock.replace('<svg', '<svg id="icon-clock"');
  return <div className={customClass ? customClass : 'icon-clock-container'} dangerouslySetInnerHTML={{ __html: svgWithId }} />;
};

export default Clock;
