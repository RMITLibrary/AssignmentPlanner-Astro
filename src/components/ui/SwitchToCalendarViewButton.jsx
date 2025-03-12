// src/components/SwitchToCalendarViewButton.jsx
import { h } from 'preact';
import { fireDataLayerEvent, scrollToView } from '../../utils'; // Import scrollToView

const SwitchToCalendarViewButton = () => {
  const switchToCalendarView = () => {

    fireDataLayerEvent({
      event: 'view_switch_click',
      formType: 'assignment_planner',
      viewSwitchName: 'calendar-view',
    });


    const calendarTab = document.querySelector('#calendar-tab');
    const navTabs = document.querySelector('.nav-tabs');
    if (calendarTab) {
      calendarTab.click();
      calendarTab.focus();
      if (navTabs) {
        scrollToView('.nav-tabs');
        //navTabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button className="btn btn-default" onClick={switchToCalendarView} type="button" tabIndex="0">
      <span className="visually-hidden">Switch and navigate to </span>Calendar view
    </button>
  );
};

export default SwitchToCalendarViewButton;

