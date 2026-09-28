import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool


class EmergencyStopPublisher(Node):
    def __init__(self):
        super().__init__("emergency_stop_publisher")
        self.emergency_stop_active = False
        self.publisher = self.create_publisher(Bool, "emergency_stop", 10)
        self.create_timer(0.1, self.publish_state)
        self.create_timer(3.0, self.toggle_state)
        self.publish_state()

    # Publishes the current state of the E-Stop every 0.1 seconds
    def publish_state(self):
        message = Bool()
        message.data = self.emergency_stop_active
        self.publisher.publish(message)

    # Toggles the E-Stop every 3 seconds
    def toggle_state(self):
        self.emergency_stop_active = not self.emergency_stop_active
        state = (
            "ENGAGED — movement blocked"
            if self.emergency_stop_active
            else "DISENGAGED — movement allowed"
        )
        self.get_logger().warning(f"Emergency stop {state}")


def main(args=None):
    rclpy.init(args=args)
    node = EmergencyStopPublisher()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
