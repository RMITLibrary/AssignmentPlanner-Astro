# Assignment Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The Assignment Planner is a web application designed to help students effectively manage their assignments. It allows users to break down assignments into smaller, manageable tasks and schedule them within a specified timeframe. This tool enhances productivity and time management skills, providing a clear roadmap for completing complex academic projects.

## Features

- **Task Breakdown:** Divide assignments into a series of smaller, actionable tasks.
- **Scheduling:** Assign start and end dates to each task, automatically distributing them across the assignment period.
- **Calendar View:** Visualise the task schedule on an interactive calendar.
- **Task View:** See a clear list of tasks with their start and end dates.
- **Export:** Export a task list to a calender application.
- **PDF Option:** Save the assignment plan as a PDF for easy sharing or printing.
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
│   └── imagess
│       └── share-image.png
├── src/
│   ├── components/
│   │   ├── PlanDetails.tsx
│   │   ├── Form.tsx
│   │   ├── TabContentTasks.tsx
│   │   └── TabContentCalendar.tsx
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
│   │   └── index.astro
│   ├── styles/
│   │   ├── app-specific/
│   │   ├── bootstrap/
│   │   └── design-system/
│   ├── content.config.ts
│   └── store.js
└── package.json
└── astro.config.mjs

```

- **`public/`**: Contains static assets, such as the share image.
- **`src/components/`**: Contains Astro & Preact components used throughout the application (e.g., `Calendar.tsx`, `Form.tsx`, `Task.tsx`).
- **`src/content/`**: Contains markdown files that define the assignment types and tasks.
  - **`src/content/project-types/`**: Contains definitions of assignment project types. Each file defines a project type with an `id`, `name`, a list of `tasks` and their weights, and a description. These include:
    - `020-presentation.md`: Defines tasks for a presentation project.
    - `030-reports.md`: Defines tasks for a report project.
    - `040-essay.md`: Defines tasks for an essay project.
    - `040-literature-review.md`: Defines tasks for a literature review project.
  - **`src/content/tasks/`**: Contains the descriptions and possible links for each task. Each file represents an individual task. These include:
    - `essay-task1.md`: Analyse the assignment instructions and brainstorm. _Possible links:_ [rubrics](https://learninglab.rmit.edu.au/index.html), [mind maps](https://learninglab.rmit.edu.au/university-essentials/study-essentials/mind-mapping/)
    - `essay-task2.md`: Research. _Possible links:_ [reading](https://learninglab.rmit.edu.au/university-essentials/study-essentials/reading-skills/), [taking notes](https://learninglab.rmit.edu.au/university-essentials/study-essentials/note-taking/)
    - `essay-task3.md`: First Draft. _Possible links:_ [paraphrase](https://learninglab.rmit.edu.au/referencing/paraphrasing/), [cite](https://learninglab.rmit.edu.au/referencing/understanding-citations/), [reference](https://learninglab.rmit.edu.au/referencing/)
    - `essay-task4.md`: Redraft.
    - `literature-review-task1.md`: Analyse the assignment instructions and brainstorm. _Possible links:_ [rubrics](https://learninglab.rmit.edu.au/index.html), [mind maps](https://learninglab.rmit.edu.au/university-essentials/study-essentials/mind-mapping/)
    - `literature-review-task2.md`: Research. _Possible links:_ [reading](https://learninglab.rmit.edu.au/university-essentials/study-essentials/reading-skills/), [taking notes](https://learninglab.rmit.edu.au/university-essentials/study-essentials/note-taking/)
    - `literature-review-task3.md`: First draft.
    - `literature-review-task4.md`: Redraft.
    - `presentation-task1.md`: Analyse the assignment instructions and brainstorm. _Possible links:_ [rubrics](https://learninglab.rmit.edu.au/index.html), [mind maps](https://learninglab.rmit.edu.au/university-essentials/study-essentials/mind-mapping/)
    - `presentation-task2.md`: Research. _Possible links:_ [reading](https://learninglab.rmit.edu.au/university-essentials/study-essentials/reading-skills/), [taking notes](https://learninglab.rmit.edu.au/university-essentials/study-essentials/note-taking/)
    - `presentation-task3.md`: First draft.
    - `presentation-task4.md`: Practice and Revise. _Possible links:_ [cohesion](https://learninglab.rmit.edu.au/assessments/presentations/creating-cohesion/)
    - `presentation-task5.md`: Before Your Presentation. _Possible links:_ [face-to-face presentations](https://learninglab.rmit.edu.au/assessments/presentations/delivery/), [online presentations](https://learninglab.rmit.edu.au/assessments/presentations/online-presentations/)
    - `report-task1.md`: Analyse the assignment instructions and brainstorm. _Possible links:_ [rubrics](https://learninglab.rmit.edu.au/index.html), [mind maps](https://learninglab.rmit.edu.au/university-essentials/study-essentials/mind-mapping/)
    - `report-task2.md`: Research. _Possible links:_ [reading](https://learninglab.rmit.edu.au/university-essentials/study-essentials/reading-skills/), [taking notes](https://learninglab.rmit.edu.au/university-essentials/study-essentials/note-taking/)
    - `report-task3.md`: First Draft. _Possible links:_ [research topic](https://learninglab.rmit.edu.au/assessments/reports/), [citations and references](https://learninglab.rmit.edu.au/referencing/)
    - `report-task4.md`: Redraft. _Possible links:_ [synthesise information](https://learninglab.rmit.edu.au/writing-fundamentals/academic-style/synthesising/)
- **`src/layouts/`**: Contains the layouts used in the astro application.
- **`src/pages/`**: Contains `.astro` files that define the pages of the website.
- **`src/store/`**: Contains the file that manages the global state of the application using `nanostores`.
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
