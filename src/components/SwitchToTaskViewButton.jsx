// src/components/SwitchToTaskViewButton.jsx
import { h } from 'preact';

const SwitchToTaskViewButton = () => {
  const switchToTaskView = () => {
    // Data Layer Push for Switch to Task View
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_switch_click',
        formType: 'assignment_planner',
        viewSwitchName: 'task-view',
      });
      console.log('view_switch_click - task_view dataLayer pushed');
    }

    const taskTab = document.querySelector('#task-tab');
    const navTabs = document.querySelector('.nav-tabs');
    console.log(taskTab);
    if (taskTab) {
      taskTab.click();
      if (navTabs) {
        navTabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button className="btn btn-default" onClick={switchToTaskView} type="button" tabIndex="0">
      Task view
    </button>
  );
};

export default SwitchToTaskViewButton;
