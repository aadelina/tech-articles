#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');
const {static_classify_data,static_data} = require('./node_handle_data');
/**
 * 解析命令行参数，获取文件路径
 * @returns {string|null} 文件路径，如果未提供则返回 null
 */
function getFilePathFromArgs() {
    // 命令行参数从 process.argv[2] 开始
    const filePath = process.argv[2];

    console.log("filePath",filePath)
    
    if (!filePath) {
        console.error('错误: 请提供需要计算的文件路径');
        console.log('使用方法: node data-processor.js <文件路径>');
        return null;
    }
    
    // 解析为绝对路径
    return path.resolve(filePath);
}

/**
 * 验证文件是否存在且可访问
 * @param {string} filePath 文件路径
 * @returns {Promise<boolean>} 如果文件有效则返回 true，否则返回 false
 */
async function validateFile(filePath) {
    try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
            console.error(`错误: ${filePath} 不是一个文件`);
            return false;
        }
        return true;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`错误: 文件 ${filePath} 不存在`);
        } else {
            console.error(`错误: 无法访问文件 ${filePath} - ${err.message}`);
        }
        return false;
    }
}

/**
 * 读取文件内容
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readFileContent(filePath) {
    try {
        console.log(`正在读取文件: ${filePath}`);
        return await fs.readFile(filePath, 'utf8');
    } catch (err) {
        console.error(`错误: 读取文件失败 - ${err.message}`);
        throw err;
    }
}

/**
 * 解析文件中的数据（假设是每行一个数字）
 * @param {string} content 文件内容
 * @returns {number[]} 解析后的数字数组
 */
function parseData(content) {
    console.log('正在解析数据...');

    return JSON.parse(content);
}

/**
 * 核心计算函数 - 计算数据的统计信息
 * @param {number[]} data 输入数据
 * @returns {Object} 包含统计信息的对象
 */
function processData(data) {
    console.log('正在进行数据计算...');
    
    const all_data = [...data.nodes,...data.edges]

    const res_weight= static_data(all_data,"weight")

    const res_region = static_classify_data(data.nodes,"value","region")

    const res_year = static_classify_data(data.nodes,"value","year","region")

    const res_resource = static_classify_data(data.edges,"value","resource")

    // console.log("==res_weight===",res_weight)

    // console.log("==res_region===",res_region)

    // console.log("==res_year===",res_year)

    // console.log("==res_resource===",res_resource)
}

/**
 * 主函数
 */
async function main() {
    try {
        // 获取并验证文件路径
        const filePath = getFilePathFromArgs();
        if (!filePath) {
            process.exit(1);
        }
        
        if (!(await validateFile(filePath))) {
            process.exit(1);
        }

        // 1. 使用 console.time 标记关键步骤
        console.time('数据处理');
        // 你的处理逻辑
        console.timeEnd('数据处理');

        // 2. 更详细的性能分析（Node.js）
        const { performance } = require('perf_hooks');
        const start = performance.now();
        
        // 读取并解析数据
        const content = await readFileContent(filePath);
        const data = parseData(content);
        
        if (data.length === 0) {
            console.log('没有可处理的数据');
            process.exit(0);
        }
        
        // 处理数据并显示结果
        const results = processData(data);
        // displayResults(results);

        
        // 你的处理逻辑
        console.log(`耗时: ${(performance.now() - start).toFixed(2)}ms`);
        
    } catch (err) {
        console.error(`程序执行失败: ${err.message}`);
        process.exit(1);
    }
}

// 启动程序
main();
