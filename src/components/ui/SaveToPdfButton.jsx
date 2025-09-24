// src/components/SaveToPdfButton.jsx
import { h } from 'preact';
import { activeTabStore } from '../../store';
import { fireDataLayerEvent } from '../../utils';

const SaveToPdfButton = () => {
  const changeTab = (tab) => {
    activeTabStore.set(tab);
  };

  const handlePrintPDF = () => {
    // Store the current active tab
    const currentTab = activeTabStore.get();

    // Switch to calendar view if not already active //hack to show calendar in print
    if (currentTab !== 'calendar') {
      changeTab('calendar');
    }

    // Wait for the calendar view to render
    setTimeout(() => {
      // Data Layer Push for PDF Print
      fireDataLayerEvent({
        event: 'pdf_print',
        formType: 'assignment_planner',
      });

      window.print(); // Trigger the print dialog

      // Switch back to the original tab after printing (if not already active) //hack to show calendar in print
      if (currentTab !== 'calendar') {
        changeTab(currentTab);
      }
    }, 100); // Using a timeout of 0 to execute after the current call stack
  };

  return (
    <button className="btn btn-pdf hide-in-iframe" onClick={handlePrintPDF} type="button">
      Save plan to PDF <span className="visually-hidden">(opens print window)</span>
    </button>
  );
};

export default SaveToPdfButton;
