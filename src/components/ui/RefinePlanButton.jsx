// src/components/RefinePlanButton.jsx
import { h } from 'preact';
import { scrollToView, fireDataLayerEvent } from '../../utils'; // Import the common function

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
    <a href="#planner-details" className="btn btn-primary" role="button" tabIndex="0" onClick={scrollToRefinePlan}>
      <span className="visually-hidden">Navigate back to form and </span>Revise plan
    </a>
  );
};

export default RefinePlanButton;
