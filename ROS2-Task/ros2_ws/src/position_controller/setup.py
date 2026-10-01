from setuptools import find_packages, setup

package_name = 'position_controller'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Nhi Ngo',
    maintainer_email='nhiyngo0@gmail.com',
    description='Tracks a clamped 2D position from movement commands, gated by an emergency stop.',
    license='Apache-2.0',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            'controller = position_controller.controller:main',
        ],
    },
)
