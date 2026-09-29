import rclpy
from rclpy.node import Node


class PositionController(Node):
    def __init__(self):
        super().__init__("position_controller")


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
