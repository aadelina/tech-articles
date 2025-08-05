const myInstanceOf = (obj,constructor) => {
    //类型判断
    if((!obj || typeof obj !== "object") && typeof obj !== "function") return false

    let prototype = Reflect.getPrototypeOf(obj)

    while(prototype){

        if(prototype === constructor.prototype){
            return true
        }

        prototype = Reflect.getPrototypeOf(prototype)

    }

    return false

}


console.log(myInstanceOf(1,Number)) //false
console.log(myInstanceOf(NaN,Number)) //false
console.log(myInstanceOf('1',String)) //false
console.log(myInstanceOf(true,Boolean)) //false
console.log(myInstanceOf(null,Object)) //false
console.log(myInstanceOf(undefined,Object)) //false
console.log(myInstanceOf(Symbol.for('a'),Symbol)) //false
console.log(myInstanceOf(10n,BigInt)) //false



console.log(myInstanceOf({},Object)) //true
console.log(myInstanceOf([],Array)) //true
console.log(myInstanceOf(function(){},Function)) //true
console.log(myInstanceOf(new Date(),Date)) //true
console.log(myInstanceOf(new RegExp(''),RegExp)) //true


console.log(myInstanceOf(new Number(1),Number)) // true
console.log(1111,typeof new Number(1))

const num = new Number(1),num2 = new Number(2)
console.log(typeof num)

class Father {
    //姓氏
    static familyName = '张';
    constructor(name) {
        this.name = Father.familyName + name;
    }
}

class Son extends Father {
    constructor(name) {
        super()
        this.name = Son.familyName +  name;
    }
}

const f = new Father('一');
console.log(f) // Father { name: '张一' }
const s = new Son('三');
console.log(s) // Son { name: '张三' }
// console.log(myInstanceOf(f, Father)); // true
// console.log(myInstanceOf(s, Father)); // true
// console.log(myInstanceOf(s, Son)); // true
// console.log(myInstanceOf(f, Son)); // false

console.log(f instanceof Father); // true
console.log(s instanceof Father); // true
console.log(s instanceof Son); // true
console.log(f instanceof Son); // false