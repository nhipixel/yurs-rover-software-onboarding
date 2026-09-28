# ROS 2 Position Controller Task

## Before you begin

This task uses **ROS 2 Humble Hawksbill** on **Ubuntu 22.04 LTS**. In a terminal, navigate to the `ros2_ws` folder and run these commands after every change:

**Platform options:** Windows users are recommended to run Ubuntu through **WSL**. macOS users are recommended to run an Ubuntu virtual machine with **UTM**. Dual booting or another virtual-machine tool is also acceptable. Use the approach that works best on your machine.

### My recommended alternative to the ones above: prepared Docker image

The fastest route is this [preconfigured Docker image folder](https://drive.google.com/drive/folders/1UcQWMOJx9tc7BAHrczsvOzE37cBWTaED?usp=drive_link). It already contains the required environment. Install Docker Desktop, download the image that matches your computer, load the downloaded `.tar` file, and run the container. No manually managed VM or dual boot is required. On Windows, Docker Desktop normally uses the WSL 2 backend. If Docker Desktop is already working on your machine, this route can often get you running in under an hour.

Choose one image and use its corresponding commands below:

- **Apple Silicon Macs** (M1/M2/M3/M4) and other ARM64 computers: download `rover-arm64.tar`.
- **Intel or AMD computers** (including most Windows PCs and Intel Macs): download `rover-amd64.tar`.

From inside a folder on your computer that you want to be accessible from inside the Docker container:

**ARM64 (Apple Silicon / ARM64)**

```bash
docker load -i /path/to/rover-arm64.tar
docker run --name rover --hostname=c44192d8f274 --env=LANG=C.UTF-8 --env=LC_ALL=C.UTF-8 --env=ROS_DISTRO=humble --env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin --volume=$(pwd):/workspace --network=bridge -p 5001:5001/udp -p 6080:6080 -p 8080:8080 -p 8889:8889 --restart=no --label='org.opencontainers.image.version=22.04' --runtime=runc -t -d rover-arm64
```

**AMD64 (Intel / AMD)**

```bash
docker load -i /path/to/rover-amd64.tar
docker run --name rover --hostname=c44192d8f274 --env=LANG=C.UTF-8 --env=LC_ALL=C.UTF-8 --env=ROS_DISTRO=humble --env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin --volume=$(pwd):/workspace --network=bridge -p 5001:5001/udp -p 6080:6080 -p 8080:8080 -p 8889:8889 --restart=no --label='org.opencontainers.image.version=22.04' --runtime=runc -t -d rover-amd64
```
It will be in the container as the `/workspace` folder.

Then to go into the running container:

```bash
docker exec -it rover bash
cd /workspace
```

When you are finished developing with Docker, quit Docker Desktop by clicking the three-dot menu in the bottom-left corner and selecting **Quit Docker Desktop** to properly close it so it's not running in the background.

Windows users should then also run the following in their terminal to stop the WSL and release the RAM it uses:

```powershell
wsl --shutdown
```

The setup is BY FAR the hardest part of this task, which is why I recommend using the Docker image I provided you with above. Otherwise, if you are new to Ubuntu, expect the initial setup to take 2 hours or more. If you are new to ROS 2, allow at least 30 minutes to get your environment working. Confirm the provided packages build and run before writing your controller.

```bash
source /opt/ros/humble/setup.bash
cd ros2_ws
colcon build
source install/setup.bash
```

For a native Ubuntu, WSL, or VM installation, `source /opt/ros/humble/setup.bash` loads ROS 2 itself. The prepared Docker image may already do this for you.

`colcon build` builds every ROS 2 package in the workspace. Run it again whenever you change any code or configuration.

`source install/setup.bash` makes the packages you just built available to ROS 2. Run it in every new terminal before using `ros2 run` or `ros2 launch`.

See the [Articulated Robotics “Build a Robot” series](https://www.youtube.com/watch?v=Gg25GfA456o) or the [ROS 2 Humble documentation](https://docs.ros.org/en/humble/) if you think you'll need it.

## What is a `Twist`?

`geometry_msgs/Twist` is a ROS 2 message type. It contains `linear` and `angular` vectors, each with (X, Y, Z) values.

For this task, you only need to use `linear.x` and `linear.y` as 2D movement inputs. Ignore `linear.z` and all `angular` values.

Although `Twist` normally represents velocity, treat `linear.x` and `linear.y` as direct position increments for this task. Do not multiply them by elapsed time.

## Provided packages

You start with two Python packages:

| Package | Nodes | Purpose |
| --- | --- | --- |
| `command_simulator` | `emergency_stop_publisher`, `random_velocity_publisher` | Publishes e-stop state and random `Twist` movement commands. |
| `position_checker` | `position_checker` | Checks the position published by YOUR node and reports `Correct` or `Incorrect`. |

Do not modify either provided package.

command_simulator publishes these topics:

| Topic | Type | Meaning |
| --- | --- | --- |
| `/movement_command` | `Twist` | Random movement command. Use only `linear.x` and `linear.y`. |
| `/emergency_stop` | `Bool` | `true` means the e-stop is engaged and movement must be blocked. |

## Your task

Create a package named `position_controller` with one node (the node can have any name).
Even though the provided packages above are in Python, you can make your package in Python or C++, whichever you prefer.

Your node must:

1. Start at position `(0, 0)`.
2. Subscribe to `/movement_command` and `/emergency_stop`.
3. For each movement command, add `linear.x` and `linear.y` to the current X/Y position.
4. Clamp both coordinates to the inclusive range `-10` through `10`.
5. If the e-stop is engaged, do not change the current position for a movement command.
6. Publish the current `geometry_msgs/Point` on `/position` for every movement command, including commands received while the e-stop is engaged.

Create a Python package with:

```bash
cd ros2_ws/src
ros2 pkg create position_controller --build-type ament_python --dependencies rclpy geometry_msgs std_msgs
```

Or create a C++ package with:

```bash
cd ros2_ws/src
ros2 pkg create position_controller --build-type ament_cmake --dependencies rclcpp geometry_msgs std_msgs
```

## Run and test

Build and source the workspace first. Then open two terminals: keep your controller running in the first terminal and run the checker in the second. **Start your controller before the checker**:

```bash
ros2 run position_controller <your_node_name>
```

In a second terminal, start the simulator and checker. Leave your controller running in the first terminal:

```bash
ros2 launch position_checker position_demo.launch.py
```

The checker will print `Correct` when your published `/position` matches the expected result, and `Incorrect` otherwise.
