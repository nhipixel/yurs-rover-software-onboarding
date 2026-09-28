import random

import rclpy
from geometry_msgs.msg import Twist
from rclpy.node import Node


class RandomVelocityPublisher(Node):
    def __init__(self):
        super().__init__("random_velocity_publisher")
        self.publisher = self.create_publisher(Twist, "movement_command", 10)
        self.command_timer = self.create_timer(1.0, self.publish_command)

    # Publishes a random linear velocity on the x and y axis every 1-3 seconds.
    def publish_command(self):
        self.command_timer.cancel()
        command = Twist()
        command.linear.x = random.uniform(-3.0, 3.0)
        command.linear.y = random.uniform(-3.0, 3.0)
        self.publisher.publish(command)
        self.get_logger().info(
            f"Movement command: x={command.linear.x:.2f}, y={command.linear.y:.2f}"
        )
        self.command_timer = self.create_timer(random.uniform(1.0, 3.0), self.publish_command)


def main(args=None):
    rclpy.init(args=args)
    node = RandomVelocityPublisher()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
