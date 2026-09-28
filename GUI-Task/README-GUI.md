# GUI Viewer Controls Task

## Before you begin

This task uses **Node.js** and **npm**. Install a current Node.js LTS release if they are not already available on your machine.

From the `GUI-Task` folder, install the project dependencies and start the development server:

```bash
npm install
npm start
```

The app opens in a browser at the URL printed by the development server, normally `http://localhost:3000`.

## Front-end tools used here

### React

React is our primary framework for front-end web development. You do not need previous React experience for this task. The starter code includes a complete Brightness control that demonstrates the pattern you will use.

In `src/App.jsx`, `useState` stores the current brightness value. The range input displays that value and its `onChange` handler updates it. When the state changes, React redraws the interface and passes the new value to the viewer. Start by reading that example, then follow the same pattern for Zoom.

If you would like a longer introduction, use Programming with Mosh's [React tutorial for beginners](https://www.youtube.com/watch?v=SqcY0GlETPk). You do not need to finish the entire tutorial before starting.

### JavaScript, HTML, and CSS

Use JavaScript for behaviour and state, HTML-like JSX for page structure, and CSS for presentation. Basic styling is already provided. You may change it, but visual polish is not part of the assessment. Plain CSS is sufficient; you do not need to learn Tailwind CSS.

### Node.js and npm

Node.js runs the development tooling and npm installs the project's packages and runs its scripts. You do not need to install React, Three.js, or Tailwind globally.

## Provided starting point

You start with a React app containing a Three.js viewer, a 3D model of a robot, and one working Brightness slider. The viewer is already implemented in `src/URDFViewer.jsx`.

You do **not** need prior experience with Three.js, 3D programming, or URDF files. Pass the Brightness and Zoom values to the supplied viewer as React properties (usually called "props"):

```jsx
<URDFViewer brightness={brightness} zoom={zoom} />
```

The viewer accepts these ranges:

| Property | Input range | Starter value |
| --- | --- | --- |
| `brightness` | `0` to `2` | `1` |
| `zoom` | `0` to `1` | `0.5` |

## Your task

Complete the controls for the rover viewer. Read the working Brightness example in `src/App.jsx` first and use it as a pattern.

Your UI must include:

1. The supplied Brightness slider. You may change its appearance, but keep it working.
2. A labelled Zoom slider. Follow the Brightness example, using a new state value with a starting value of `0.5`.
3. Two profile buttons with the following values:
   - **Inspection:** Brightness `1.5`, Zoom `0.25`
   - **Overview:** Brightness `0.8`, Zoom `0.75`
4. Clicking either profile must immediately update both sliders and the viewer.
5. Make it visually clear which profile was most recently selected. If the user manually moves a slider afterward, neither profile needs to remain selected.

Keep the controls easy to understand and use visible labels. You only need to edit `src/App.jsx`; do **not** edit `URDFViewer.jsx`.

## Optional extension

After completing the core task, you may use `localStorage` to save the most recent Brightness and Zoom values and restore them after a browser refresh. This is optional and is not part of the completion criteria.

## Verify your work

1. Run `npm start` and open the app.
2. Adjust the Brightness and Zoom controls. Confirm each one works as intended.
3. Select each profile and confirm it updates both controls and the viewer.
4. Move either slider manually and confirm the profile selection is cleared, if that is how you implemented the selected state.
5. If you completed the optional extension, refresh the browser and confirm the latest values are restored.
