// Clock.jsx
import { h } from 'preact';
import IconClock from '../../assets/header-image.svg?raw'; // Import the SVG

const HeaderImage = ({ customClass }) => {
  // Modify the SVG string to include the ID
  const svgWithId = IconClock.replace('<svg', '<svg id="header-image"');
  return <div className={customClass ? customClass : 'header-image-container'} dangerouslySetInnerHTML={{ __html: svgWithId }} />;
};

export default HeaderImage;
