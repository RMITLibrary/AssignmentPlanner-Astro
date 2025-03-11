// src/components/RefinePlanButton.jsx
import { h } from 'preact';
import { scrollToView, fireDataLayerEvent } from '../utils'; // Import the common function

const RefinePlanButton = () => {
  const scrollToRefinePlan = () => {
    fireDataLayerEvent({
      event: 'refine_click',
      formType: 'assignment_planner',
      viewSwitchName: 'refine-plan',
    });
    scrollToView('#planner-details');
  };

  return (
    <a href="#planner-details" className="btn btn-default" role="button" tabIndex="0" onClick={scrollToRefinePlan}>
      Refine plan
    </a>
  );
};

export default RefinePlanButton;
