"use strict";
// Performance monitoring utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCpuUsage = exports.logMemoryUsage = exports.PerformanceMonitor = void 0;
class PerformanceMonitor {
    static start(label) {
        this.startTimes.set(label, Date.now());
    }
    static end(label) {
        const startTime = this.startTimes.get(label);
        if (!startTime) {
            console.warn(`Performance monitor: No start time found for label "${label}"`);
            return 0;
        }
        const duration = Date.now() - startTime;
        this.startTimes.delete(label);
        return duration;
    }
    static measure(label, fn) {
        this.start(label);
        const result = fn();
        if (result instanceof Promise) {
            return result.finally(() => {
                const duration = this.end(label);
                console.log(`⏱️  ${label}: ${duration}ms`);
            });
        }
        else {
            const duration = this.end(label);
            console.log(`⏱️  ${label}: ${duration}ms`);
            return result;
        }
    }
    static log(label, duration) {
        const emoji = duration < 100 ? '⚡' : duration < 500 ? '✅' : duration < 1000 ? '⚠️' : '🐌';
        console.log(`${emoji} ${label}: ${duration}ms`);
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
PerformanceMonitor.startTimes = new Map();
// Memory usage monitoring
const logMemoryUsage = (label = 'Memory Usage') => {
    const usage = process.memoryUsage();
    const formatBytes = (bytes) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };
    console.log(`📊 ${label}:`);
    console.log(`   RSS: ${formatBytes(usage.rss)}`);
    console.log(`   Heap Used: ${formatBytes(usage.heapUsed)}`);
    console.log(`   Heap Total: ${formatBytes(usage.heapTotal)}`);
    console.log(`   External: ${formatBytes(usage.external)}`);
};
exports.logMemoryUsage = logMemoryUsage;
// CPU usage monitoring (basic)
const logCpuUsage = () => {
    const startUsage = process.cpuUsage();
    setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const userTime = currentUsage.user / 1000000; // Convert to seconds
        const systemTime = currentUsage.system / 1000000; // Convert to seconds
        console.log(`🖥️  CPU Usage (1s):`);
        console.log(`   User: ${userTime.toFixed(2)}s`);
        console.log(`   System: ${systemTime.toFixed(2)}s`);
        console.log(`   Total: ${(userTime + systemTime).toFixed(2)}s`);
    }, 1000);
};
exports.logCpuUsage = logCpuUsage;
