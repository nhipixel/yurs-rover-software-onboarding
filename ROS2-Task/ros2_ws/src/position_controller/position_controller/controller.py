import rclpy
from geometry_msgs.msg import Point, Twist
from rclpy.node import Node
from std_msgs.msg import Bool


class PositionController(Node):
    def __init__(self):
        super().__init__("position_controller")
        self.emergency_stop_active = False
        self.create_subscription(Bool, "emergency_stop", self.on_estop, 10)
        self.x = 0.0
        self.y = 0.0
        self.publisher = self.create_publisher(Point, "position", 10)
        self.create_subscription(Twist, "movement_command", self.on_movement, 10)

    def on_estop(self, message):
        self.emergency_stop_active = message.data

    def on_movement(self, command):
        self.x += command.linear.x
        self.y += command.linear.y
        position = Point()
        position.x = self.x
        position.y = self.y
        self.publisher.publish(position)


def main(args=None):
    rclpy.init(args=args)
    node = PositionController()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
