// src/components/SwitchToTaskViewButton.jsx
import { h } from 'preact';
import { fireDataLayerEvent } from '../../utils'; // Import the common function


const SwitchToTaskViewButton = () => {
  const switchToTaskView = () => {
    // Data Layer Push for Switch to Task View
       fireDataLayerEvent({
         event: 'view_switch_click',
         formType: 'assignment_planner',
         viewSwitchName: 'task-view',
       });

    const taskTab = document.querySelector('#task-tab');
    const navTabs = document.querySelector('.nav-tabs');
    console.log(taskTab);
    if (taskTab) {
      taskTab.click();
      taskTab.focus();
      if (navTabs) {
        navTabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button className="btn btn-default" onClick={switchToTaskView} type="button" tabIndex="0">
      <span className="visually-hidden">Switch and navigate to </span>Task view
    </button>
  );
};

export default SwitchToTaskViewButton;
