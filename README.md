# YURS Rover Software Onboarding

Welcome! This repository contains two software tasks for the YURS rover team: a GUI (Frontend) task and a ROS 2 (Backend) task. Choose one task to complete before you begin. You can optionally complete both if you want to help with both the Frontend and Backend (Fullstack), but it's not required, and can also be done later down the road once you are accepted. See the [task-selection guide](task-selection.md) to compare them.

If you have questions at any point, feel free to message the Software Lead or ask in the `#prospect-general` channel on the Discord server.

## Process

1. Decide which task you will complete.
2. Clone this repository to your local computer and enter its folder:

   ```bash
   git clone https://github.com/YorkURobotics/YURS-Rover-Software-Onboarding.git
   cd YURS-Rover-Software-Onboarding
   ```

3. Create a fresh Git repository for your own work. The cloned repository's folder will already contain `.git`, so delete it from your local copy and initialise a new repository. On macOS, Linux, or Git Bash, run:

   ```bash
   rm -rf .git
   ```

   On Windows PowerShell, run:

   ```powershell
   Remove-Item -Recurse -Force .git
   ```

   Then, on any platform, run:

   ```bash
   git init
   git add .
   git commit -m "Initial task setup"
   ```

4. Read the README for your selected task and begin implementing it:

   - [GUI task instructions](GUI-Task/README-GUI.md)
   - [ROS 2 task instructions](ROS2-Task/README-ROS2.md)

5. Commit as you go. Do not put the entire implementation into one commit. It's good practice to break your changes down into smaller commits, since they are easier to review and act as "checkpoints" you can return to if something goes wrong.

## Interview

Both tasks include a 15–20 minute interview to discuss your implementation. There will also be a pair-programming portion where you implement a small additional feature.

LLMs are permitted, but you will be tested on your own understanding of the work you submit during the interview.

## Record and submit your work

When your task is complete, record a short video showing it working, zip your completed repository, and submit it through the [submission form](https://docs.google.com/forms/d/e/1FAIpQLSeEUiwXgm7CIALUBK5SkYLT8M-hY5QNDoWa-54Y8tZPg5Qn8g/viewform?usp=dialog).

Your video must demonstrate the applicable completion criteria:

### GUI task

- Brightness control works.
- Zoom control works.
- Profiles can be selected.

### ROS 2 task

- Your node is running.
- The `position_checker` package is running.
- The terminal for the position_checker displays the `Correct` message.
