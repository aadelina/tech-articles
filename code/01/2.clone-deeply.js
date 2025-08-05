const cloneDeeply = (o) => {

    if(!(o instanceof Object)) return o;

    const res = Array.isArray(o) ? [] : {}

    for(const [key,value] of Object.entries(o)){
        res[key] = cloneDeeply(value)
    }

    return res;

}
const obj = {a: 1, b: {c: 2}};
const newObj = cloneDeeply(obj)
newObj.b.c = "更改以后的";
console.log(newObj,obj); // { a: 1, b: { c: '更改以后的' } } { a: 1, b: { c: 2 } }


const arr = [1, [2, 3]] 
const newArr = cloneDeeply(arr)
newArr[1][0] = "更改以后的";
console.log(newArr,arr); // [ 1, [ '更改以后的', 3 ] ] [ 1, [ 2, 3 ] ]


(JSON.parse(JSON.stringify(obj))) // { a: 1, b: { c: 2 } }

