"""
人体关节传感器仿真模块
基于生物力学原理的真实数据模拟
"""

import numpy as np
from datetime import datetime
import time

class JointSensor:
    """关节传感器基类"""
    
    # 人体关节的生理运动范围 (度)
    JOINT_RANGES = {
        'knee': {'min': 0, 'max': 135, 'neutral': 0},      # 膝关节
        'elbow': {'min': 0, 'max': 145, 'neutral': 0},     # 肘关节
        'shoulder': {'min': -40, 'max': 180, 'neutral': 0}, # 肩关节
        'hip': {'min': -15, 'max': 125, 'neutral': 0},     # 髋关节
        'ankle': {'min': -45, 'max': 20, 'neutral': 0},    # 踝关节
        'wrist': {'min': -70, 'max': 80, 'neutral': 0}     # 腕关节
    }
    
    def __init__(self, joint_type, sensor_id, sampling_rate=100):
        """
        初始化关节传感器
        
        Args:
            joint_type: 关节类型 (knee, elbow, shoulder, hip, ankle, wrist)
            sensor_id: 传感器ID
            sampling_rate: 采样率 (Hz)
        """
        self.joint_type = joint_type
        self.sensor_id = sensor_id
        self.sampling_rate = sampling_rate
        self.start_time = time.time()
        
        # 传感器特性参数
        self.noise_level = 0.5  # 噪声水平 (度)
        self.drift_rate = 0.01  # 漂移率 (度/秒)
        self.accuracy = 0.1     # 精度 (度)
        self.response_time = 0.01  # 响应时间 (秒)
        
        # 运动模式参数
        self.motion_frequency = np.random.uniform(0.5, 2.0)  # 运动频率 (Hz)
        self.motion_amplitude = np.random.uniform(0.3, 0.8)  # 运动幅度系数
        
        # 获取关节范围
        self.range = self.JOINT_RANGES.get(joint_type, {'min': 0, 'max': 90, 'neutral': 0})
        
    def get_realistic_angle(self, t):
        """
        生成真实的关节角度数据
        基于正弦波叠加和生理运动范围
        
        Args:
            t: 时间 (秒)
            
        Returns:
            angle: 关节角度 (度)
        """
        # 基础运动: 主频率正弦波
        base_motion = np.sin(2 * np.pi * self.motion_frequency * t)
        
        # 添加谐波 (更真实的运动模式)
        harmonic1 = 0.3 * np.sin(2 * np.pi * self.motion_frequency * 2 * t + 0.5)
        harmonic2 = 0.15 * np.sin(2 * np.pi * self.motion_frequency * 3 * t + 1.2)
        
        # 组合运动
        combined_motion = base_motion + harmonic1 + harmonic2
        
        # 映射到关节运动范围
        range_span = self.range['max'] - self.range['min']
        angle = self.range['neutral'] + (combined_motion * self.motion_amplitude * range_span / 2)
        
        # 确保在生理范围内
        angle = np.clip(angle, self.range['min'], self.range['max'])
        
        # 添加传感器噪声
        noise = np.random.normal(0, self.noise_level)
        
        # 添加漂移
        drift = self.drift_rate * t
        
        return angle + noise + drift
    
    def get_angular_velocity(self, t, dt=0.01):
        """
        计算角速度 (度/秒)
        通过数值微分计算
        """
        angle1 = self.get_realistic_angle(t)
        angle2 = self.get_realistic_angle(t + dt)
        velocity = (angle2 - angle1) / dt
        
        # 添加噪声
        noise = np.random.normal(0, self.noise_level * 10)
        return velocity + noise
    
    def get_acceleration(self, t):
        """
        生成加速度数据 (基于IMU传感器)
        返回三轴加速度 (m/s²)
        """
        # 基于运动状态的加速度
        angle = self.get_realistic_angle(t)
        velocity = self.get_angular_velocity(t)
        
        # 模拟三轴加速度
        ax = np.sin(np.radians(angle)) * 9.8 + np.random.normal(0, 0.1)
        ay = np.cos(np.radians(angle)) * 9.8 + np.random.normal(0, 0.1)
        az = velocity * 0.01 + np.random.normal(0, 0.1)
        
        return {'x': ax, 'y': ay, 'z': az}
    
    def get_gyroscope(self, t):
        """
        生成陀螺仪数据 (度/秒)
        返回三轴角速度
        """
        velocity = self.get_angular_velocity(t)
        
        # 主要旋转轴
        gx = velocity + np.random.normal(0, 1.0)
        gy = np.random.normal(0, 0.5)
        gz = np.random.normal(0, 0.5)
        
        return {'x': gx, 'y': gy, 'z': gz}
    
    def get_pressure(self, t):
        """
        生成压力传感器数据 (N)
        基于关节角度和运动状态
        """
        angle = self.get_realistic_angle(t)
        velocity = abs(self.get_angular_velocity(t))
        
        # 压力与角度和速度相关
        base_pressure = 50 + abs(angle) * 2  # 基础压力
        dynamic_pressure = velocity * 0.5    # 动态压力
        
        pressure = base_pressure + dynamic_pressure + np.random.normal(0, 2)
        return max(0, pressure)
    
    def get_temperature(self, t):
        """
        生成温度数据 (°C)
        考虑运动强度和环境因素
        """
        velocity = abs(self.get_angular_velocity(t))
        
        # 基础体温
        base_temp = 36.5
        
        # 运动产热
        heat = velocity * 0.01
        
        # 环境波动
        ambient_variation = 0.3 * np.sin(2 * np.pi * 0.1 * t)
        
        temp = base_temp + heat + ambient_variation + np.random.normal(0, 0.1)
        return temp
    
    def get_sensor_data(self):
        """
        获取完整的传感器数据包
        """
        t = time.time() - self.start_time
        
        angle = self.get_realistic_angle(t)
        velocity = self.get_angular_velocity(t)
        acceleration = self.get_acceleration(t)
        gyroscope = self.get_gyroscope(t)
        pressure = self.get_pressure(t)
        temperature = self.get_temperature(t)
        
        return {
            'sensor_id': self.sensor_id,
            'joint_type': self.joint_type,
            'timestamp': datetime.now().isoformat(),
            'time': t,
            'angle': round(angle, 2),
            'angular_velocity': round(velocity, 2),
            'acceleration': {
                'x': round(acceleration['x'], 3),
                'y': round(acceleration['y'], 3),
                'z': round(acceleration['z'], 3)
            },
            'gyroscope': {
                'x': round(gyroscope['x'], 2),
                'y': round(gyroscope['y'], 2),
                'z': round(gyroscope['z'], 2)
            },
            'pressure': round(pressure, 2),
            'temperature': round(temperature, 2),
            'status': 'normal'
        }


class SensorNetwork:
    """传感器网络管理器"""
    
    def __init__(self):
        self.sensors = {}
        self.initialize_sensors()
    
    def initialize_sensors(self):
        """初始化多个关节传感器"""
        joint_configs = [
            ('knee', 'SENSOR_KNEE_L', 100),
            ('knee', 'SENSOR_KNEE_R', 100),
            ('elbow', 'SENSOR_ELBOW_L', 100),
            ('elbow', 'SENSOR_ELBOW_R', 100),
            ('shoulder', 'SENSOR_SHOULDER_L', 100),
            ('shoulder', 'SENSOR_SHOULDER_R', 100),
            ('hip', 'SENSOR_HIP_L', 100),
            ('hip', 'SENSOR_HIP_R', 100),
        ]
        
        for joint_type, sensor_id, rate in joint_configs:
            self.sensors[sensor_id] = JointSensor(joint_type, sensor_id, rate)
    
    def get_all_sensor_data(self):
        """获取所有传感器数据"""
        return {
            sensor_id: sensor.get_sensor_data()
            for sensor_id, sensor in self.sensors.items()
        }
    
    def get_sensor_data(self, sensor_id):
        """获取指定传感器数据"""
        if sensor_id in self.sensors:
            return self.sensors[sensor_id].get_sensor_data()
        return None
    
    def get_sensor_list(self):
        """获取传感器列表"""
        return [
            {
                'sensor_id': sensor_id,
                'joint_type': sensor.joint_type,
                'sampling_rate': sensor.sampling_rate,
                'status': 'active'
            }
            for sensor_id, sensor in self.sensors.items()
        ]
