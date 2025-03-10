// src/components/SwitchToCalendarViewButton.jsx
import { h } from 'preact';

const SwitchToCalendarViewButton = () => {
  const switchToCalendarView = () => {
    // Data Layer Push for Switch to Task View
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_switch_click',
        formType: 'assignment_planner',
        viewSwitchName: 'calendar-view',
      });
      console.log('view_switch_click - calendar_view dataLayer pushed');
    }

    const calendarTab = document.querySelector('#calendar-tab');
    const navTabs = document.querySelector('.nav-tabs');
    if (calendarTab) {
      calendarTab.click();
      if (navTabs) {
        navTabs.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button className="btn btn-default" onClick={switchToCalendarView} type="button" tabIndex="0">
      Calendar view
    </button>
  );
};

export default SwitchToCalendarViewButton;

