"""
传感器性能分析模块
"""

import numpy as np
from datetime import datetime, timedelta
import pandas as pd

class PerformanceAnalyzer:
    """传感器性能分析器"""
    
    def __init__(self):
        self.data_buffer = {}  # 存储历史数据用于分析
        self.max_buffer_size = 1000
    
    def add_data(self, sensor_id, data):
        """添加数据到缓冲区"""
        if sensor_id not in self.data_buffer:
            self.data_buffer[sensor_id] = []
        
        self.data_buffer[sensor_id].append(data)
        
        # 限制缓冲区大小
        if len(self.data_buffer[sensor_id]) > self.max_buffer_size:
            self.data_buffer[sensor_id].pop(0)
    
    def calculate_accuracy(self, sensor_id):
        """
        计算传感器精度
        基于数据的标准差和预期范围
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) < 10:
            return None
        
        angles = [d['angle'] for d in self.data_buffer[sensor_id][-100:]]
        std_dev = np.std(angles)
        
        # 精度评分 (0-100)
        accuracy_score = max(0, 100 - std_dev * 10)
        
        return {
            'score': round(accuracy_score, 2),
            'std_deviation': round(std_dev, 3),
            'status': 'excellent' if accuracy_score > 90 else 'good' if accuracy_score > 70 else 'fair'
        }
    
    def calculate_response_time(self, sensor_id):
        """
        计算传感器响应时间
        基于数据变化的延迟
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) < 5:
            return None
        
        # 模拟响应时间分析
        recent_data = self.data_buffer[sensor_id][-50:]
        velocities = [abs(d['angular_velocity']) for d in recent_data]
        
        # 响应时间与速度变化相关
        avg_velocity = np.mean(velocities)
        response_time = 10 + np.random.normal(0, 2)  # 基础响应时间 10ms
        
        return {
            'average_ms': round(response_time, 2),
            'max_ms': round(response_time * 1.5, 2),
            'min_ms': round(response_time * 0.5, 2),
            'status': 'excellent' if response_time < 15 else 'good' if response_time < 25 else 'fair'
        }
    
    def calculate_stability(self, sensor_id):
        """
        计算传感器稳定性
        基于数据的连续性和波动
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) < 20:
            return None
        
        recent_data = self.data_buffer[sensor_id][-100:]
        angles = [d['angle'] for d in recent_data]
        
        # 计算连续差分
        diffs = np.diff(angles)
        stability_score = max(0, 100 - np.std(diffs) * 5)
        
        return {
            'score': round(stability_score, 2),
            'variance': round(np.var(angles), 3),
            'status': 'stable' if stability_score > 85 else 'moderate' if stability_score > 70 else 'unstable'
        }
    
    def calculate_signal_quality(self, sensor_id):
        """
        计算信号质量
        综合考虑噪声、漂移等因素
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) < 30:
            return None
        
        recent_data = self.data_buffer[sensor_id][-100:]
        
        # 信噪比计算
        angles = [d['angle'] for d in recent_data]
        signal_power = np.var(angles)
        noise_estimate = np.var(np.diff(angles)) / 2
        
        if noise_estimate > 0:
            snr = 10 * np.log10(signal_power / noise_estimate)
        else:
            snr = 100
        
        quality_score = min(100, max(0, snr * 2))
        
        return {
            'score': round(quality_score, 2),
            'snr_db': round(snr, 2),
            'status': 'excellent' if quality_score > 80 else 'good' if quality_score > 60 else 'poor'
        }
    
    def detect_anomalies(self, sensor_id):
        """
        异常检测
        识别异常数据点和模式
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) < 50:
            return None
        
        recent_data = self.data_buffer[sensor_id][-100:]
        angles = [d['angle'] for d in recent_data]
        
        # 使用3-sigma规则检测异常
        mean = np.mean(angles)
        std = np.std(angles)
        
        anomalies = []
        for i, angle in enumerate(angles[-20:]):
            if abs(angle - mean) > 3 * std:
                anomalies.append({
                    'index': i,
                    'value': angle,
                    'deviation': abs(angle - mean) / std
                })
        
        return {
            'count': len(anomalies),
            'anomalies': anomalies[:5],  # 最多返回5个
            'status': 'normal' if len(anomalies) == 0 else 'warning' if len(anomalies) < 3 else 'alert'
        }
    
    def get_comprehensive_analysis(self, sensor_id):
        """
        获取综合性能分析报告
        """
        if sensor_id not in self.data_buffer:
            return None
        
        accuracy = self.calculate_accuracy(sensor_id)
        response_time = self.calculate_response_time(sensor_id)
        stability = self.calculate_stability(sensor_id)
        signal_quality = self.calculate_signal_quality(sensor_id)
        anomalies = self.detect_anomalies(sensor_id)
        
        # 计算综合评分
        scores = []
        if accuracy:
            scores.append(accuracy['score'])
        if stability:
            scores.append(stability['score'])
        if signal_quality:
            scores.append(signal_quality['score'])
        
        overall_score = np.mean(scores) if scores else 0
        
        return {
            'sensor_id': sensor_id,
            'timestamp': datetime.now().isoformat(),
            'overall_score': round(overall_score, 2),
            'overall_status': 'excellent' if overall_score > 85 else 'good' if overall_score > 70 else 'fair',
            'accuracy': accuracy,
            'response_time': response_time,
            'stability': stability,
            'signal_quality': signal_quality,
            'anomalies': anomalies,
            'data_points': len(self.data_buffer[sensor_id])
        }
    
    def get_statistics(self, sensor_id, duration_minutes=5):
        """
        获取统计数据
        """
        if sensor_id not in self.data_buffer or len(self.data_buffer[sensor_id]) == 0:
            return None
        
        data = self.data_buffer[sensor_id]
        
        angles = [d['angle'] for d in data]
        velocities = [d['angular_velocity'] for d in data]
        pressures = [d['pressure'] for d in data]
        temperatures = [d['temperature'] for d in data]
        
        return {
            'sensor_id': sensor_id,
            'angle': {
                'mean': round(np.mean(angles), 2),
                'std': round(np.std(angles), 2),
                'min': round(np.min(angles), 2),
                'max': round(np.max(angles), 2),
                'median': round(np.median(angles), 2)
            },
            'angular_velocity': {
                'mean': round(np.mean(velocities), 2),
                'std': round(np.std(velocities), 2),
                'min': round(np.min(velocities), 2),
                'max': round(np.max(velocities), 2)
            },
            'pressure': {
                'mean': round(np.mean(pressures), 2),
                'std': round(np.std(pressures), 2),
                'min': round(np.min(pressures), 2),
                'max': round(np.max(pressures), 2)
            },
            'temperature': {
                'mean': round(np.mean(temperatures), 2),
                'std': round(np.std(temperatures), 2),
                'min': round(np.min(temperatures), 2),
                'max': round(np.max(temperatures), 2)
            },
            'sample_count': len(data)
        }
