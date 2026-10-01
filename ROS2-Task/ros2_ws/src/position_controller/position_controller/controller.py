import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool


class PositionController(Node):
    def __init__(self):
        super().__init__("position_controller")
        self.emergency_stop_active = False
        self.create_subscription(Bool, "emergency_stop", self.on_estop, 10)

    def on_estop(self, message):
        self.emergency_stop_active = message.data


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
