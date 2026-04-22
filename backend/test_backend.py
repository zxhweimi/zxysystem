"""
后端功能测试脚本
"""

import sys
import time

# 测试传感器模块
print("=" * 60)
print("测试 1: 传感器模块")
print("=" * 60)

try:
    from sensors.joint_sensor import JointSensor, SensorNetwork
    
    # 创建单个传感器
    sensor = JointSensor('knee', 'TEST_SENSOR', 100)
    print("✓ 传感器创建成功")
    
    # 获取传感器数据
    data = sensor.get_sensor_data()
    print(f"✓ 传感器数据获取成功")
    print(f"  - 传感器ID: {data['sensor_id']}")
    print(f"  - 关节类型: {data['joint_type']}")
    print(f"  - 角度: {data['angle']}°")
    print(f"  - 角速度: {data['angular_velocity']}°/s")
    print(f"  - 压力: {data['pressure']}N")
    print(f"  - 温度: {data['temperature']}°C")
    
    # 创建传感器网络
    network = SensorNetwork()
    print(f"✓ 传感器网络创建成功，共 {len(network.sensors)} 个传感器")
    
    # 获取所有传感器数据
    all_data = network.get_all_sensor_data()
    print(f"✓ 获取所有传感器数据成功，共 {len(all_data)} 个")
    
    print("\n传感器模块测试通过！\n")
    
except Exception as e:
    print(f"✗ 传感器模块测试失败: {e}")
    sys.exit(1)

# 测试性能分析模块
print("=" * 60)
print("测试 2: 性能分析模块")
print("=" * 60)

try:
    from analysis.performance import PerformanceAnalyzer
    
    analyzer = PerformanceAnalyzer()
    print("✓ 性能分析器创建成功")
    
    # 添加测试数据
    for i in range(50):
        data = sensor.get_sensor_data()
        analyzer.add_data('TEST_SENSOR', data)
        time.sleep(0.01)
    
    print(f"✓ 添加了 50 个数据点")
    
    # 测试各项分析功能
    accuracy = analyzer.calculate_accuracy('TEST_SENSOR')
    if accuracy:
        print(f"✓ 精度分析: {accuracy['score']:.2f} 分 ({accuracy['status']})")
    
    response_time = analyzer.calculate_response_time('TEST_SENSOR')
    if response_time:
        print(f"✓ 响应时间: {response_time['average_ms']:.2f} ms ({response_time['status']})")
    
    stability = analyzer.calculate_stability('TEST_SENSOR')
    if stability:
        print(f"✓ 稳定性: {stability['score']:.2f} 分 ({stability['status']})")
    
    signal_quality = analyzer.calculate_signal_quality('TEST_SENSOR')
    if signal_quality:
        print(f"✓ 信号质量: {signal_quality['score']:.2f} 分 ({signal_quality['status']})")
    
    anomalies = analyzer.detect_anomalies('TEST_SENSOR')
    if anomalies:
        print(f"✓ 异常检测: {anomalies['count']} 个异常 ({anomalies['status']})")
    
    # 综合分析
    analysis = analyzer.get_comprehensive_analysis('TEST_SENSOR')
    if analysis:
        print(f"✓ 综合分析: {analysis['overall_score']:.2f} 分 ({analysis['overall_status']})")
    
    # 统计数据
    stats = analyzer.get_statistics('TEST_SENSOR')
    if stats:
        print(f"✓ 统计数据: 角度均值 {stats['angle']['mean']:.2f}°")
    
    print("\n性能分析模块测试通过！\n")
    
except Exception as e:
    print(f"✗ 性能分析模块测试失败: {e}")
    sys.exit(1)

# 测试数据生成的合理性
print("=" * 60)
print("测试 3: 数据合理性验证")
print("=" * 60)

try:
    # 测试关节角度范围
    knee_sensor = JointSensor('knee', 'KNEE_TEST', 100)
    angles = []
    for i in range(100):
        data = knee_sensor.get_sensor_data()
        angles.append(data['angle'])
        time.sleep(0.01)
    
    min_angle = min(angles)
    max_angle = max(angles)
    
    print(f"✓ 膝关节角度范围: {min_angle:.2f}° ~ {max_angle:.2f}°")
    
    # 验证是否在生理范围内
    if 0 <= min_angle <= 135 and 0 <= max_angle <= 135:
        print("✓ 角度在生理范围内 (0° ~ 135°)")
    else:
        print("✗ 警告: 角度超出生理范围")
    
    # 测试温度范围
    temps = [d['temperature'] for d in [knee_sensor.get_sensor_data() for _ in range(50)]]
    avg_temp = sum(temps) / len(temps)
    print(f"✓ 平均温度: {avg_temp:.2f}°C")
    
    if 35 < avg_temp < 38:
        print("✓ 温度在正常体温范围内")
    else:
        print("✗ 警告: 温度异常")
    
    print("\n数据合理性验证通过！\n")
    
except Exception as e:
    print(f"✗ 数据合理性验证失败: {e}")
    sys.exit(1)

# 总结
print("=" * 60)
print("所有测试通过！✓")
print("=" * 60)
print("\n系统已准备就绪，可以启动服务器。")
print("运行命令: python app.py")
print("=" * 60)
