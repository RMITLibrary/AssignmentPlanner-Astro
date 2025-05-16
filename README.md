# Assignment Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

The Assignment Planner is a web application designed to help students effectively manage their assignments. It allows users to break down assignments into smaller, manageable tasks and schedule them within a specified timeframe. This tool enhances productivity and time management skills, providing a clear roadmap for completing complex academic projects.

## Features

- **Task Breakdown:** Divide assignments into a series of smaller, actionable tasks.
- **Scheduling:** Assign start and end dates to each task, automatically distributing them across the assignment period.
- **Calendar View:** Visualise the task schedule on an interactive calendar.
- **Task View:** See a clear list of tasks with their start and end dates.
- **Export:** Export a task list to a calender application.
- **PDF Option:** Save the assignment plan as a PDF for easy sharing or printing.
- **Shareable URLs:** Create and share URLs with assignment details that can be easily reused or shared with others.
- **Responsive Design:** Ensures the app is usable on various devices, including desktops, tablets, and mobile phones.
- **Pre-built Assignment Templates:** Includes templates for common assignment types (e.g., Essays, Reports, Presentations, Literature Reviews).
- **Pre-filled task lists**: Includes pre-filled task lists for common assignement types.

## Technologies Used

- **Astro:** A modern web framework for building fast websites.
- **Preact:** A fast and lightweight JavaScript library for building user interfaces.
- **Bootstrap:** A CSS framework for styling the application.
- **Toast UI Calendar:** An interactive calendar component for scheduling.
- **Nanostores:** A compact state management library.
- **Sass:** A CSS preprocessor for enhanced styling capabilities.

## URL Parameter Feature

The Assignment Planner supports URL parameters that allow users to share and save their assignment plans. When a form is submitted, the URL is automatically updated with the parameters that represent the selected options.

### Supported Parameters

- `type` - The assignment type ID (e.g., essay-project, literature-review-project)
- `start` - The start date in YYYY-MM-DD format
- `end` - The end date in YYYY-MM-DD format
- `name` - (Optional) The name of the assignment
- `group` - (Optional) Set to "yes" if it's a group assignment

### Examples

- Basic URL with required parameters:
  ```
  /AssignmentPlanner/?type=essay-project&start=2023-05-20&end=2023-06-10
  ```

- Complete URL with all parameters:
  ```
  /AssignmentPlanner/?type=literature-review-project&start=2023-05-20&end=2023-06-10&name=Research%20Methods&group=yes
  ```

### Usage

1. Fill out the form and submit it to create an assignment plan
2. The URL in your browser will update with the parameters
3. Copy this URL to save or share your assignment plan
4. When someone visits this URL, the form will be auto-filled with your settings

You can also use the "Copy Shareable Link" button that appears after creating a plan to quickly copy the URL to your clipboard.

## Calendar Export Feature

The Assignment Planner provides a powerful calendar export functionality that helps students integrate their assignment plan into their preferred calendar application (such as Google Calendar, Apple Calendar, or Microsoft Outlook).

### Calendar Export Features

- **Full-Day Events**: Tasks are exported as full-day calendar events rather than timed events, providing better visibility in calendar applications.
- **Sequential Task Numbering**: Each task is prefixed with a sequential number (e.g., "1. Analyse the assignment instructions") to maintain the logical order of tasks.
- **Assignment Context**: The assignment name is included in square brackets at the beginning of each event summary (e.g., "[Literature Review] 1. Research") for easy identification.
- **Formatted Task Descriptions**: Task descriptions include:
  - Properly formatted bullet points with links kept inline for better readability
  - Clean spacing between content sections
  - Support for both HTML and Markdown formatting
- **Date Range Flexibility**: Users can choose between two display options:
  - **Multiday View**: Tasks span their full duration (from start to end date)
  - **Milestone View**: Tasks appear only on their start date

### How to Use Calendar Export

1. Create an assignment plan by filling out the form and submitting it
2. In the generated plan view, click on the "Export to Calendar" button
3. Select your preferred view type (Multiday or Milestone)
4. Click "Export" to download an ICS file
5. Open the downloaded ICS file with your preferred calendar application to import the events

### Technical Implementation

The calendar export creates standard ICS (iCalendar) files compatible with most calendar applications. The implementation includes:

- Proper formatting for full-day events using `VALUE=DATE` format
- Correct handling of date ranges according to the iCalendar specification
- Intelligent text processing to format task content appropriately
- Special handling for group assignment content when applicable

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm (comes with Node.js)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/RMITLibrary/AssignmentPlanner-Astro.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd AssignmentPlanner-Astro
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

## Deployment

This application is designed to be flexible and can be deployed to either:

1.  **The root of a domain** (e.g., `https://assignmentplanner.netlify.app/`)
2.  **A subdirectory** (e.g., `https://learninglab.rmit.edu.au/AssignmentPlanner/`)

To accommodate these different deployment scenarios, we use a conditional `base` configuration in the `astro.config.mjs` file.

### Conditional `base` Configuration

The `base` setting in `astro.config.mjs` controls:

*   **Asset Paths:** The paths to your CSS, JavaScript, images, etc.
*   **Sitemap URLs:** The URLs generated in your sitemap.

We use an environment variable to determine the correct `base` at build time.


### Running the Application

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  Open your web browser and navigate to `http://localhost:4321/` to view the application.

### Building for Production

1.  Build the application:

    ```bash
    npm run build
    ```

2.  This will create a `dist` directory containing the production-ready files.

### Previewing the Build

1. Preview the build:

   ```bash
   npm run preview
   ```

## Project Structure

Inside of the Assignment Planner project, you'll see the following folders and files:

```text
/
├── public/
│   └── images/
│       └── share-image.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── features/
│   │   │   ├── ConditionalContent.jsx
│   │   │   ├── CurrentYear.astro
│   │   │   ├── EmbedModal.astro
│   │   │   ├── HeaderControls.astro
│   │   │   ├── Intro.astro
│   │   │   ├── PlanDetails.jsx
│   │   │   ├── TabContentCalendar.jsx
│   │   │   ├── TabContentTasks.jsx
│   │   │   └── ThemeSwitcher.astro
│   │   ├── layout/
│   │   │   ├── Footer.astro
│   │   │   ├── FooterGrid.astro
│   │   │   ├── Head.astro
│   │   │   └── Header.astro
│   │   └── ui/
│   │       ├── Clock.jsx
│   │       ├── EmbedButton.astro
│   │       ├── ExportToCalendarButton.jsx
│   │       ├── FlagImages.astro
│   │       ├── Form.jsx
│   │       ├── LegalLink.astro
│   │       ├── NoFocusImage.astro
│   │       ├── OpenPlannerButton.astro
│   │       ├── RefinePlanButton.jsx
│   │       ├── SaveToPdfButton.jsx
│   │       ├── ShareLinkButton.jsx
│   │       ├── SocialLink.astro
│   │       ├── SwitchToCalendarViewButton.jsx
│   │       ├── SwitchToTaskViewButton.jsx
│   │       ├── ThemeAwareImage.astro
│   │       └── ThemeToggle.astro
│   ├── content/
│   │   ├── project-types/
│   │   │    ├── 020-presentation.md
│   │   │    ├── 030-reports.md
│   │   │    ├── 040-essay.md
│   │   │    └── 040-literature-review.md
│   │   └── tasks/
│   │       ├── essay-task1.md
│   │       ├── essay-task2.md
│   │       ├── essay-task3.md
│   │       ├── literature-review-task1.md
│   │       ├── literature-review-task2.md
│   │       ├── literature-review-task3.md
│   │       ├── presentation-task1.md
│   │       ├── presentation-task2.md
│   │       ├── presentation-task3.md
│   │       ├── presentation-task4.md
│   │       ├── presentation-task5.md
│   │       ├── report-task1.md
│   │       ├── report-task2.md
│   │       ├── report-task3.md
│   │       └── report-task4.md
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── embed-test.astro
│   │   └── index.astro
│   ├── scripts/
│   │   ├── embed-functionality.js
│   │   └── iframe-resize.ts
│   ├── styles/
│   │   ├── app-specific/
│   │   ├── bootstrap/
│   │   └── design-system/
│   ├── utils/
│   │   └── url-params.js
│   ├── content.config.ts
│   ├── store.js
│   └── utils.js
├── CONTENT-LICENSE.md
├── LICENSE
├── README.md
├── astro.config.mjs
├── package.json
├── robots.txt
└── tsconfig.json
```

- **`public/`**: Contains static assets, such as the share image.
- **`src/assets/`**: Stores project assets like images and icons.
- **`src/components/`**: Contains Astro & Preact components used throughout the application:
  - **`features/`**: Feature-specific components like `PlanDetails.jsx` (which contains the calendar export functionality), tab content components, and modals.
  - **`layout/`**: Layout components such as header, footer, and head elements.
  - **`ui/`**: User interface components like buttons, toggles, and form elements.
- **`src/content/`**: Contains markdown files that define the assignment types and tasks:
  - **`project-types/`**: Contains definitions of assignment project types with their tasks and weights.
  - **`tasks/`**: Contains detailed descriptions and resources for each specific task.
- **`src/layouts/`**: Contains the main `Layout.astro` file defining the application's structure.
- **`src/pages/`**: Contains Astro pages including the main index and embed test pages.
- **`src/scripts/`**: Contains JavaScript utilities for embedding and iframe functionality.
- **`src/styles/`**: Contains stylesheets organized into app-specific, bootstrap, and design system categories.
- **`src/utils/`**: Contains utility functions like URL parameter handling.
- **`src/content.config.ts`**: Configuration file for content collections.
- **`src/store.js`**: State management using nanostores.
- **`src/utils.js`**: General utility functions for the application.
- **`astro.config.mjs`**: Configuration file for Astro.
- **`package.json`**: Lists project dependencies and scripts.

## Assignment Type and Task Definitions

Assignment types and their tasks are defined in markdown files. These files can be found within the `src/content/` folder.

### Project Types (`src/content/project-types/`)

Each file in this folder defines a type of assignment (e.g., `020-presentation.md`, `030-reports.md`, `040-essay.md`, `040-literature-review.md`). A project type defines:

- `id`: A unique identifier (e.g., `essay-project`).
- `name`: The name of the assignment type (e.g., "Essays"). - Used as project name in dropdown.
- `type`: The type or project - currnetly unused.
- `tasks`: A list of task IDs and their weight within the assignment.
- `content`: a short description of the assignment type - this is not used.

### Tasks (`src/content/tasks/`)

Each file in this folder defines a specific task (e.g., `essay-task1.md`, `report-task2.md`). A task defines:

- `id`: A unique identifier (e.g., `essay-task1`).
- `description`: A detailed description of the task - used as task heading.
- `content`: The content of the task - bullet points and links.

## How It Works

1.  **Input:** Users select an assignment type, specify start and end dates, and indicate if it's a group assignment.
2.  **Task Distribution:** The application automatically distributes a set of pre-defined tasks (based on the assignment type) across the specified timeframe, accounting for the weight of each task.
3.  **Display:** The generated plan is presented in both a task view and an interactive calendar view.
4.  **Refinement:** Users can refine the plan and view the tasks as needed.
5.  **Export:** Users can then export the plan to their chosen calendar application, or as a PDF.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Learn More

- **Astro Documentation:** https://docs.astro.build
- **Astro Discord:** https://astro.build/chat

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- UX/UI: Sandy Houston ([sandy.houston@rmit.edu.au](mailto:sandy.houston@rmit.edu.au))
- Content: Matthew Millis ([matthew.millis2@rmit.edu.au](mailto:matthew.millis2@rmit.edu.au))
- Build: Karl Ervine ([karl.ervine@rmit.edu.au](mailto:karl.ervine@rmit.edu.au))

#### © RMIT University Library

###### Developed by RMIT Library Digital Learning

## Contact

- Repo Admin: Jack Dunstan ([jack.dunstan@rmit.edu.au](mailto:jack.dunstan@rmit.edu.au))
- Additional Contact: [digital.learning.library@rmit.edu.au](mailto:digital.learning.library@rmit.edu.au)

## Resources

- [Active RMIT Library GitHub](https://github.com/RMITLibrary)
- [Archived RMIT Library GitHub](https://github.com/RMITLibrary-Archived)
