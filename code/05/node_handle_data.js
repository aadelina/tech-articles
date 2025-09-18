
/*
* 数据进行分类完进行统计
* @params 
* data  json对象数组原数据
* static_field 字符串 对某一个字段全部统计
* args: 各类分类字段 一级分类字段 region、resource.....、二级分类字段 year、month.....、三级....
* @return map
*/
export const static_classify_data = (data,static_field,...args) => {

    // 判断数据类型
    if(!Array.isArray(data)) {
        console.error('JSON文件内容必须是一个对象数组');
        return;
    }
    const map = new Map()

    for(let i = 0; i < data.length; i++) {

        let j = 0,temp_map = map,level = j + 1

        while(j < args.length && (!temp_map.get(data[i][args[j]]) || level < args.length)){

            if(temp_map.get(data[i][args[j]]) && level < args.length){

                temp_map = temp_map.get(data[i][args[j]])

                j = level++

                continue
            }

            if(j === args.length - 1) {

                temp_map.set(data[i][args[j]],result_data())

                break
            }

            temp_map.set(data[i][args[j]],new Map())

            temp_map = temp_map.get(data[i][args[j]])

            j++
        }

        const last_param = args[args.length - 1]

        const cur_map = temp_map.get(data[i][last_param])

        const value = data[i][static_field]? parseFloat(data[i][static_field]):0

        const value_float3 =  keep_float(value,3)
    
        cur_map.values.push(value_float3)
    
        // 最大值
        cur_map.max = Math.max(cur_map.max,value_float3)
    
        // 最小值
        cur_map.min = Math.min(cur_map.min, value_float3)
    
        // 总和
        cur_map.sum += value_float3

        cur_map.sum = keep_float(cur_map.sum,3)

        // 中位数
        cur_map.center = keep_float(get_center(cur_map.values),3)

        // 平均值
        cur_map.average = keep_float(cur_map.sum / cur_map.values.length,3)

        cur_map.static_field = static_field

        args.forEach((item,index) => {
            cur_map[item] = data[i][item]
        })
    
    }
    
    return map

}
/*
* 全部数据进行统计
* @params 
* data  json对象数组原数据
* static_field 字符串 对某一个字段全部统计
* @return map
*/

export const static_data = (data,static_field) => {

    // 判断数据类型
    if(!Array.isArray(data)) {

        console.error('JSON文件内容必须是一个对象数组');

        return;
    }

    const result = result_data()

    for(let i = 0; i < data.length; i++) {

        const value = data[i][static_field]? parseFloat(data[i][static_field]):0

        const value_float3 =  keep_float(value,3)

        result.values.push(value_float3)

        // 最大值
        result.max = Math.max(result.max,value_float3)

        // 最小值
        result.min = Math.min(result.min,value_float3)

        // 总和
        result.sum += value_float3

        result.sum = keep_float(result.sum,3)
    }
    // 中位数
    result.center = keep_float(get_center(result.values),3)

    // 平均值
    result.average = keep_float(result.sum / result.values.length,3)

    result.static_field = static_field

    return result
}

const result_data = () => {

    return  {
        static_field: '',
        average:0,
        max: 0,
        min: Number.MAX_VALUE,
        center: 0,
        sum: 0,
        values: []
    }

}

// 保留 f 位小数
const keep_float = (value,f)=> {
    return Math.round((value + Number.EPSILON)* Math.pow(10,f)) / (Math.pow(10,f))
}

// 求取中位数
const get_center = (values,f)=> {

    const count = values.length;

    const sorted = [...values].sort((a,b) => a-b)

    let res = null

    if (count % 2 === 0) {
        res = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    } else {
        res = sorted[Math.floor(count / 2)];
    }

    return res
}

