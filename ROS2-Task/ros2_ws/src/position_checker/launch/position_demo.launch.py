from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(package="command_simulator", executable="random_velocity_publisher", output="screen"),
        Node(package="command_simulator", executable="emergency_stop_publisher", output="screen"),
        Node(package="position_checker", executable="position_checker", output="screen"),
    ])
