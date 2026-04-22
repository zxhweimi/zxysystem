"""
Flask应用主入口
提供RESTful API接口
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import threading
import time

from sensors.joint_sensor import SensorNetwork
from analysis.performance import PerformanceAnalyzer

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化传感器网络和性能分析器
sensor_network = SensorNetwork()
performance_analyzer = PerformanceAnalyzer()

# 数据采集线程
data_collection_active = False

def data_collection_worker():
    """后台数据采集线程"""
    global data_collection_active
    while data_collection_active:
        # 采集所有传感器数据
        all_data = sensor_network.get_all_sensor_data()
        
        # 添加到性能分析器
        for sensor_id, data in all_data.items():
            performance_analyzer.add_data(sensor_id, data)
        
        time.sleep(0.1)  # 100Hz采样率

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """获取传感器列表"""
    sensors = sensor_network.get_sensor_list()
    return jsonify({
        'success': True,
        'data': sensors,
        'count': len(sensors)
    })

@app.route('/api/sensors/<sensor_id>', methods=['GET'])
def get_sensor_data(sensor_id):
    """获取指定传感器的实时数据"""
    data = sensor_network.get_sensor_data(sensor_id)
    
    if data:
        return jsonify({
            'success': True,
            'data': data
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Sensor not found'
        }), 404

@app.route('/api/sensors/all', methods=['GET'])
def get_all_sensors_data():
    """获取所有传感器的实时数据"""
    all_data = sensor_network.get_all_sensor_data()
    
    return jsonify({
        'success': True,
        'data': all_data,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analysis/<sensor_id>', methods=['GET'])
def get_sensor_analysis(sensor_id):
    """获取传感器性能分析"""
    analysis = performance_analyzer.get_comprehensive_analysis(sensor_id)
    
    if analysis:
        return jsonify({
            'success': True,
            'data': analysis
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Insufficient data for analysis'
        }), 404

@app.route('/api/statistics/<sensor_id>', methods=['GET'])
def get_sensor_statistics(sensor_id):
    """获取传感器统计数据"""
    stats = performance_analyzer.get_statistics(sensor_id)
    
    if stats:
        return jsonify({
            'success': True,
            'data': stats
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No data available'
        }), 404

@app.route('/api/analysis/all', methods=['GET'])
def get_all_analysis():
    """获取所有传感器的性能分析"""
    sensors = sensor_network.get_sensor_list()
    analyses = {}
    
    for sensor in sensors:
        sensor_id = sensor['sensor_id']
        analysis = performance_analyzer.get_comprehensive_analysis(sensor_id)
        if analysis:
            analyses[sensor_id] = analysis
    
    return jsonify({
        'success': True,
        'data': analyses,
        'count': len(analyses)
    })

@app.route('/api/history/<sensor_id>', methods=['GET'])
def get_sensor_history(sensor_id):
    """获取传感器历史数据"""
    limit = request.args.get('limit', 100, type=int)
    
    if sensor_id in performance_analyzer.data_buffer:
        history = performance_analyzer.data_buffer[sensor_id][-limit:]
        return jsonify({
            'success': True,
            'data': history,
            'count': len(history)
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No history data available'
        }), 404

@app.route('/api/export/<sensor_id>', methods=['GET'])
def export_sensor_data(sensor_id):
    """导出传感器数据"""
    if sensor_id in performance_analyzer.data_buffer:
        data = performance_analyzer.data_buffer[sensor_id]
        
        # 转换为CSV格式
        csv_lines = ['timestamp,angle,angular_velocity,pressure,temperature']
        for d in data:
            csv_lines.append(f"{d['timestamp']},{d['angle']},{d['angular_velocity']},{d['pressure']},{d['temperature']}")
        
        csv_content = '\n'.join(csv_lines)
        
        return jsonify({
            'success': True,
            'data': csv_content,
            'format': 'csv',
            'filename': f'{sensor_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No data to export'
        }), 404

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    """获取系统状态"""
    return jsonify({
        'success': True,
        'data': {
            'status': 'running',
            'sensors_count': len(sensor_network.sensors),
            'data_collection_active': data_collection_active,
            'timestamp': datetime.now().isoformat(),
            'uptime': time.time() - sensor_network.sensors[list(sensor_network.sensors.keys())[0]].start_time
        }
    })

@app.route('/api/system/start', methods=['POST'])
def start_data_collection():
    """启动数据采集"""
    global data_collection_active
    
    if not data_collection_active:
        data_collection_active = True
        thread = threading.Thread(target=data_collection_worker, daemon=True)
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Data collection started'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Data collection already running'
        })

@app.route('/api/system/stop', methods=['POST'])
def stop_data_collection():
    """停止数据采集"""
    global data_collection_active
    
    if data_collection_active:
        data_collection_active = False
        
        return jsonify({
            'success': True,
            'message': 'Data collection stopped'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Data collection not running'
        })

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """获取仪表板数据"""
    all_data = sensor_network.get_all_sensor_data()
    
    # 计算总体统计
    total_sensors = len(all_data)
    active_sensors = sum(1 for d in all_data.values() if d['status'] == 'normal')
    
    # 获取所有分析数据
    analyses = {}
    for sensor_id in all_data.keys():
        analysis = performance_analyzer.get_comprehensive_analysis(sensor_id)
        if analysis:
            analyses[sensor_id] = analysis
    
    # 计算平均性能分数
    avg_score = 0
    if analyses:
        scores = [a['overall_score'] for a in analyses.values()]
        avg_score = sum(scores) / len(scores)
    
    return jsonify({
        'success': True,
        'data': {
            'summary': {
                'total_sensors': total_sensors,
                'active_sensors': active_sensors,
                'average_performance': round(avg_score, 2),
                'data_collection_active': data_collection_active
            },
            'sensors': all_data,
            'analyses': analyses
        }
    })

if __name__ == '__main__':
    # 启动数据采集
    data_collection_active = True
    thread = threading.Thread(target=data_collection_worker, daemon=True)
    thread.start()
    
    print("=" * 60)
    print("人体关节监测传感器仿真系统")
    print("Human Joint Monitoring Sensor Simulation System")
    print("=" * 60)
    print(f"服务器启动于: http://localhost:5001")
    print(f"传感器数量: {len(sensor_network.sensors)}")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)
