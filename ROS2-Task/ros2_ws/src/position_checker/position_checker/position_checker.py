import math

import rclpy
from geometry_msgs.msg import Point, Twist
from rclpy.node import Node
from std_msgs.msg import Bool


class PositionChecker(Node):
    def __init__(self):
        super().__init__("position_checker")
        self.field_limit = self.declare_parameter("field_limit", 10.0).value
        self.emergency_stop_active = False
        self.expected_position = Point()
        self.expected_positions = []
        self.create_subscription(Bool, "emergency_stop", self.on_estop, 10)
        self.create_subscription(Twist, "movement_command", self.on_movement, 10)
        self.create_subscription(Point, "position", self.on_position, 10)

    def on_estop(self, message):
        self.emergency_stop_active = message.data

    def on_movement(self, command):
        if not self.emergency_stop_active:
            self.expected_position.x = max(
                -self.field_limit,
                min(self.field_limit, self.expected_position.x + command.linear.x),
            )
            self.expected_position.y = max(
                -self.field_limit,
                min(self.field_limit, self.expected_position.y + command.linear.y),
            )
        expected = Point()
        expected.x = self.expected_position.x
        expected.y = self.expected_position.y
        self.expected_positions.append(expected)

    def on_position(self, actual):
        if not self.expected_positions:
            self.get_logger().warning("Incorrect: received a position without a movement command")
            return

        expected = self.expected_positions.pop(0)
        correct = math.isclose(actual.x, expected.x, abs_tol=1e-6) and math.isclose(
            actual.y, expected.y, abs_tol=1e-6
        )
        result = "Correct" if correct else "Incorrect"
        self.get_logger().info(
            f"{result} (expected {expected.x:.2f}, {expected.y:.2f}; "
            f"received {actual.x:.2f}, {actual.y:.2f})"
        )


def main(args=None):
    rclpy.init(args=args)
    node = PositionChecker()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
