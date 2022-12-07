// 类定义
const 瓜的种类 = new (class {
    西瓜 = 'tap';
    南瓜 = 'drag';
    黄瓜 = 'flick';
})();
const 事件的种类 = new (class {
    缺省 = 'default';
    沿X轴移动 = 'moveX';
    沿Y轴移动 = 'moveY';
    旋转 = 'rotate';
    透明度 = 'transparent';
    速度 = 'speed';
})();
class 带分数 {
    constructor(整数部分 = 0, 分子 = 0, 分母 = 1) {
        this.整数部分 = 整数部分;
        this.分子 = 分子;
        this.分母 = 分母;
    }
    plus(另一个加数 = new 带分数(0)) {
        let 分母1 = this.分母;
        let 分子1 = this.分子;
        let 分母2 = 另一个加数.分母;
        let 分子2 = 另一个加数.分子;
        let 整数1 = this.整数部分;
        let 整数2 = 另一个加数.整数部分;
        let 分母的最小公倍数 = 0;
        for (let i = 1; i <= 114514; i++) {
            // 求两个分母的最小公倍数
            分母的最小公倍数 = 分母1 * i;
            if (分母的最小公倍数 % 分母2 == 0) break;
        }
        let 新分子 =
            (分子1 * 分母的最小公倍数) / 分母2 +
            (分子2 * 分母的最小公倍数) / 分母1;
        let 整数 = 整数1 + 整数1 + parseInt(新分子 / 分母的最小公倍数);
        新分子 = 新分子 % 分母的最小公倍数;
        return new 带分数(整数, 新分子, 分母的最小公倍数);
    }
    转为小数 = () => {
        return this.整数部分 + this.分子 / this.分母;
    };
}
class 瓜 {
    /* 瓜：
                    瓜在《瓜了个瓜》中充当传统音游中Note的角色，即当瓜下落到判定线上时，玩家需做出正确的动作，即：
                    西瓜(Tap)：尽可能准确地点击；黄瓜(Flick)：手指在其上滑动；南瓜(Drag)：接住即可。
                */
    constructor(种类 = 瓜的种类.西瓜, 判定时间 = new 带分数(0), 相对位置 = 0) {
        this.种类 = 种类;
        this.判定时间 = 判定时间;
        this.相对位置 = 相对位置;
        this.延迟判定 = false;
    }
}
class 事件 {
    constructor(
        类型 = 事件的种类.缺省,
        发生时间 = new 带分数(0),
        持续时间 = new 带分数(0),
        起点数值 = 0,
        终点数值 = 0
    ) {
        this.类型 = 类型;
        this.发生时间 = 发生时间;
        this.持续时间 = 持续时间;
        this.终点数值 = 终点数值;
        this.起点数值 = 起点数值;
    }
}
class 判定线 {
    // 当瓜下落到判定线上时，玩家需做出正确的动作
    constructor(事件列表 = new Array(), 瓜列表 = new Array()) {
        /**
         * @type {事件[]}
         */
        this.事件列表 = 事件列表;
        /**
         * @type {瓜[]}
         */
        this.瓜列表 = 瓜列表;
        this.x坐标 = 0;
        this.y坐标 = 0;
        this.角度 = 0;
        this.透明度 = 1;
        this.流速倍率 = 1;
    }
    生成瓜(瓜的对象 = new 瓜()) {
        this.瓜列表.push(瓜的对象);
    }
    添加事件(事件的对象 = new 事件()) {
        this.事件列表.push(事件的对象);
    }
}
/**
 * @type { 判定线[] }
 */
var 判定线列表 = new Array();

// 游戏常量定义
/* 解析网址参数 */
const 网址参数 = (function () {
    let 请求的网址 = window.location.search.substring(1);
    let 所有键值对 = 请求的网址.split('&');
    let 结果 = {};
    for (let i = 0; i < 所有键值对.length; i++) {
        let 键值对 = 所有键值对[i].split('=');
        if (键值对[0] != '') {
            结果[键值对[0]] = 键值对[1];
        }
    }
    return 结果;
})(); // 类似于PHP中的$_GET
const 解码 = (s) => decodeURI(atob(s));
const 数据类型 = 网址参数['datatype'];
var 音频地址 = '',
    曲绘地址 = '',
    获取谱面 = '';

if (数据类型 == 'lib') {
    // 在本仓库中获取
    音频地址 = './audio/' + 解码(网址参数['music']);
    曲绘地址 = './image/' + 解码(网址参数['illu']);
    document.getElementsByTagName('iframe')[0].src =
        'chart/' + 解码(网址参数['chart']);
    获取谱面 = () =>
        document
            .getElementsByTagName('iframe')[0]
            .contentWindow.document.querySelector('pre').innerHTML;
} else {
    // 读取外部链接
    音频地址 = 解码(网址参数['music']);
    曲绘地址 = 解码(网址参数['illu']);

    获取谱面 = () => {
        axios
            .get(解码(网址参数['chart']))
            .then((res) => {
                return res.data;
            })
            .catch((err) => alert('加载谱面出现错误, 详细信息：' + err));
    };
}
const music = new Audio(音频地址);

/* 世界坐标和屏幕坐标：
                为了便于在不同设备间进行统一，在游戏中采用“世界坐标”描述位置。
                世界坐标的范围：x[-{世标宽度}, {世标宽度}],y [-{世标高度}, {世标高度}]
                原点：屏幕中心 x正半轴：向右 y正半轴：向上
                屏幕坐标的范围：x[0, {屏幕宽度}],y [0, {屏幕高度}]
                原点：屏幕左上方 x正半轴：向右 y正半轴：向下（即相当于css中的top和left属性）
                */
const 世标宽度 = 400;
const 世标高度 = 225;
const 屏幕宽度 = window.innerWidth;
const 屏幕高度 = window.innerHeight;
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number[]}
 */
const 世转屏 = function (x, y) {
    x = ((x + 世标宽度) * 屏幕宽度) / 2 / 世标宽度;
    y = -((y + 世标高度) * 屏幕高度) / 2 / 世标高度 + 屏幕高度;
    return [x, y];
};
const 屏转世 = function (x, y) {
    x = (x * 2 * 世标宽度) / 屏幕宽度 - 世标宽度;
    y = ((y - 屏幕高度) * 世标高度 * -2) / 屏幕高度 - 世标高度;
    return [x, y];
};
/* 流速：
                游戏中瓜的下落速度被称为流速。一个瓜的流速等于基础流速×判定线流速倍率，单位为"世界坐标/节拍"
            */
const 基础流速 = 100;
/* 谱面信息 */
var 音乐BPM = 120;
const 曲绘作者 = 解码(网址参数['ia']);
const 谱面作者 = 解码(网址参数['ca']);
const 谱面名称 = 解码(网址参数['name']);
const 谱面难度 = 解码(网址参数['level']);
const 谱面位移 = 0; // 单位：毫秒

var 物量 = 0;

const 浏览器宽度 = window.innerWidth;
const 浏览器高度 = window.innerHeight;

const 图片宽度 = 120;
const 图片高度 = 120;

const 节拍转毫秒 = (拍) => {
    return (拍.转为小数() / 音乐BPM) * 60000;
};
const 毫秒转节拍 = (毫秒) => {
    return (毫秒 / 60000) * 音乐BPM;
};

// 游戏变量定义
var 毫秒计时 = 0;
var 节拍计时 = new 带分数(0);
var 计时起始时间戳 = 0;
/**
 * @type {number[]}
 */
var 判定记录 = new Array();

// 与游戏底层相关的函数
const 时间戳 = function () {
    let dt = new Date();
    return dt.getTime();
};

// 与游戏逻辑相关的函数
/**
 * @returns {string}
 */
function 计算分数和连击数() {
    let 分数 = 0;
    let ACC = 0;
    let ACC_100percent = 100 / 物量;
    let 判定分_100percent = 950000 / 物量;
    let 连击 = 0;
    let 最大连击 = 0;
    let abs = Math.abs;

    for (let i = 0; i < 判定记录.length; i++) {
        let 本次判定 = 判定记录[i];
        if (abs(本次判定) <= 160) {
            连击++;
        } else {
            连击 = 0;
        }
        最大连击 = Math.max(连击, 最大连击);

        if (abs(本次判定) <= 25) {
            // Pure Perfect
            ACC += 1.25 * ACC_100percent;
            分数 += 1 * 判定分_100percent;
        } else if (abs(本次判定) <= 60) {
            // Normal Perfect
            ACC += 1 * ACC_100percent;
            分数 += 1 * 判定分_100percent;
        } else if (abs(本次判定) <= 160) {
            let 临 = (0.4 * (160 - abs(本次判定)) + 40) / 100;
            ACC += 临 * ACC_100percent;
            分数 += 临 * 判定分_100percent;
        } else if (abs(本次判定) <= 180) {
            ACC += 0;
            分数 += 0.025 * 判定分_100percent;
        }
    }

    分数 += (最大连击 / 物量) * 50000;
    分数 = Math.round(分数);
    return ['0'.repeat(7 - 分数.toString().length) + 分数, 连击];
}

// 点击时判定
/**
 * @type {TouchList}
 */
let 触摸点列 = new Array();
/**
 * @type {number[][]}
 */
let 延迟判定 = new Array();

/**
 *
 * @param {number[]} 世界坐标
 * @param {number} 单击时时间戳
 * @returns {null}
 */
function 判定西瓜(世界坐标, 单击时时间戳) {
    let 最小纵向距离 = 2147483647;
    let 最小横向距离 = 2147483647;
    let 对应的瓜 = [-1, -1];
    for (let i = 0; i < 判定线列表.length; i++) {
        let 正在遍历的判定线 = 判定线列表[i];
        for (let j = 0; j < 正在遍历的判定线.瓜列表.length; j++) {
            let 正在遍历的音符 = 正在遍历的判定线.瓜列表[j];
            if (正在遍历的音符 === undefined) continue;
            if (正在遍历的音符.种类 != 瓜的种类.西瓜) continue;
            let 横向距离 = Math.abs(正在遍历的音符.相对位置 - 世界坐标[0]);
            let 纵向距离 =
                节拍转毫秒(正在遍历的音符.判定时间) -
                单击时时间戳 +
                计时起始时间戳;
            if (横向距离 > 屏幕宽度 / 10) continue;
            if (纵向距离 < -160 || 纵向距离 > 180) continue;
            if (纵向距离 < 最小纵向距离) {
                最小纵向距离 = 纵向距离;
                最小横向距离 = 横向距离;
                对应的瓜 = [i, j];
            } else if (纵向距离 == 最小纵向距离 && 横向距离 < 最小横向距离) {
                最小横向距离 = 横向距离;
                对应的瓜 = [i, j];
            }
        }
    }
    if (对应的瓜[0] == -1) return;
    delete 判定线列表[对应的瓜[0]].瓜列表[对应的瓜[1]];
    let 音符容器 = document.getElementById(
        'note_' + 对应的瓜[0] + '_' + 对应的瓜[1]
    );
    音符容器.removeChild(音符容器.children[0]);
    音符容器.remove();
    判定记录.push(最小纵向距离);
}
function 判定黄瓜(世界坐标, 单击时时间戳) {
    let 最小纵向距离 = 2147483647;
    let 最小横向距离 = 2147483647;
    let 对应的瓜 = [-1, -1];
    for (let i = 0; i < 判定线列表.length; i++) {
        let 正在遍历的判定线 = 判定线列表[i];
        for (let j = 0; j < 正在遍历的判定线.瓜列表.length; j++) {
            let 正在遍历的音符 = 正在遍历的判定线.瓜列表[j];
            if (正在遍历的音符 === undefined) continue;
            if (正在遍历的音符.种类 != 瓜的种类.黄瓜) continue;
            let 横向距离 = Math.abs(正在遍历的音符.相对位置 - 世界坐标[0]);
            let 纵向距离 =
                节拍转毫秒(正在遍历的音符.判定时间) -
                单击时时间戳 +
                计时起始时间戳;
            if (正在遍历的音符.延迟判定) continue;
            if (横向距离 > 屏幕宽度 / 10) continue;
            if (纵向距离 < -160 || 纵向距离 > 180) continue;
            if (纵向距离 < 最小纵向距离) {
                最小纵向距离 = 纵向距离;
                最小横向距离 = 横向距离;
                对应的瓜 = [i, j];
            } else if (纵向距离 == 最小纵向距离 && 横向距离 < 最小横向距离) {
                最小横向距离 = 横向距离;
                对应的瓜 = [i, j];
            }
        }
    }
    if (对应的瓜[0] == -1) return;
    if (最小纵向距离 > 0) {
        延迟判定.push(对应的瓜);
        判定线列表[对应的瓜[0]].瓜列表[对应的瓜[1]].延迟判定 = true;
    } else {
        delete 判定线列表[对应的瓜[0]].瓜列表[对应的瓜[1]];
        let 音符容器 = document.getElementById(
            'note_' + 对应的瓜[0] + '_' + 对应的瓜[1]
        );
        音符容器.removeChild(音符容器.children[0]);
        音符容器.remove();
    }
    判定记录.push(0);
}
function 判定南瓜(单击时时间戳) {
    for (let p = 0; p < 触摸点列.length; p++) {
        let 触摸点 = 触摸点列[p];
        let 世界坐标 = 屏转世(触摸点['clientX'], 触摸点['clientY']);
        for (let i = 0; i < 判定线列表.length; i++) {
            let 正在遍历的判定线 = 判定线列表[i];
            for (let j = 0; j < 正在遍历的判定线.瓜列表.length; j++) {
                let 正在遍历的音符 = 正在遍历的判定线.瓜列表[j];
                if (正在遍历的音符 === undefined) continue;
                if (正在遍历的音符.种类 != 瓜的种类.南瓜) continue;
                let 横向距离 = Math.abs(正在遍历的音符.相对位置 - 世界坐标[0]);
                let 纵向距离 =
                    节拍转毫秒(正在遍历的音符.判定时间) -
                    单击时时间戳 +
                    计时起始时间戳;
                if (正在遍历的音符.延迟判定) continue;
                if (横向距离 > 屏幕宽度 / 10) continue;
                if (纵向距离 < -160 || 纵向距离 > 180) continue;
                let 对应的瓜 = [i, j];
                延迟判定.push(对应的瓜);
                判定线列表[对应的瓜[0]].瓜列表[对应的瓜[1]].延迟判定 = true;
                判定记录.push(0);
            }
        }
    }
}
function 延判() {
    for (let i = 0; i < 延迟判定.length; i++) {
        if (延迟判定[i] === undefined) continue;
        let 位置 = 延迟判定[i];
        let 判定线对象 = 判定线列表[位置[0]];
        let 瓜对象 = 判定线对象.瓜列表[位置[1]];

        let 纵向距离 = 节拍转毫秒(瓜对象.判定时间) - 时间戳() + 计时起始时间戳;

        if (纵向距离 <= 0) {
            delete 判定线列表[位置[0]].瓜列表[位置[1]];
            let 音符容器 = document.getElementById(
                'note_' + 位置[0] + '_' + 位置[1]
            );
            音符容器.removeChild(音符容器.children[0]);
            音符容器.remove();
            delete 延迟判定[i];
        }
    }
}
/**
 * 在触摸时执行。作为addEventListener()的回调函数。
 * @param {TouchEvent} 事件对象
 */
function 开始触摸(事件对象) {
    let 触摸点 = 事件对象.changedTouches[0];
    let 单击时时间戳 = 时间戳();
    let 横坐标 = 触摸点.clientX;
    let 纵坐标 = 触摸点.clientY;
    let 世界坐标 = 屏转世(横坐标, 纵坐标);
    世界坐标 = [parseFloat(世界坐标[0]), parseFloat(世界坐标[1])];

    判定西瓜(世界坐标, 单击时时间戳);
    触摸点列 = 事件对象.touches;
    事件对象.preventDefault();
}

/**
 * 在滑动时执行。作为addEventListener()的回调函数。
 * @param {TouchEvent} 事件对象
 */
function 滑动触摸屏(事件对象) {
    let 触摸点 = 事件对象.changedTouches[0];
    let 单击时时间戳 = 时间戳();
    let 横坐标 = 触摸点.clientX;
    let 纵坐标 = 触摸点.clientY;
    let 世界坐标 = 屏转世(横坐标, 纵坐标);
    世界坐标 = [parseFloat(世界坐标[0]), parseFloat(世界坐标[1])];

    判定黄瓜(世界坐标, 单击时时间戳);
    触摸点列 = 事件对象.touches;
    事件对象.preventDefault();
}

// 游戏流程
function 处理事件(当前判定线, 新的数值, 类型) {
    switch (类型) {
        case 事件的种类.沿Y轴移动:
            当前判定线.y坐标 = 新的数值;
            break;
        case 事件的种类.沿X轴移动:
            当前判定线.x坐标 = 新的数值;
            break;
        case 事件的种类.旋转:
            当前判定线.角度 = 新的数值;
            break;
        case 事件的种类.透明度:
            当前判定线.透明度 = 新的数值;
            break;
        case 事件的种类.速度:
            当前判定线.流速倍率 = 新的数值;
            break;
        default:
    }
}
function 帧() {
    毫秒计时 = 时间戳();
    for (let i = 0; i < 判定线列表.length; i++) {
        let 当前判定线 = 判定线列表[i];
        let 流速 = 当前判定线.流速倍率 * 基础流速;
        // 处理事件
        for (let j = 0; j < 当前判定线.事件列表.length; j++) {
            let 当前事件 = 当前判定线['事件列表'][j];
            if (当前事件 === undefined) continue;
            if (
                节拍转毫秒(当前事件.发生时间.plus(当前事件.持续时间)) <=
                毫秒计时 - 计时起始时间戳
            ) {
                处理事件(当前判定线, 当前事件.终点数值, 当前事件.类型);
                delete 当前判定线['事件列表'][j];
                continue;
            } else if (
                节拍转毫秒(当前事件.发生时间) <=
                毫秒计时 - 计时起始时间戳
            ) {
                let 事件已持续时间 = 毫秒计时 - 计时起始时间戳 - 发生时间;
                let 新的数值 =
                    (事件已持续时间 / 当前事件.持续时间) *
                        (当前事件.终点数值 - 当前事件.起点数值) +
                    当前事件.起点数值;
                处理事件(当前事件, 新的数值, 当前事件.类型);
            }
        }
        // 展示判定线
        let 判定线ID = 'judgeline_' + i;
        let 判定线HTML对象 = document.getElementById(判定线ID);
        if (判定线HTML对象) {
            判定线HTML对象.style.top = 世转屏(0, 当前判定线.y坐标)[1] + 'px';
        } else {
            判定线HTML对象 = document.createElement('div');
            判定线HTML对象.style.top = 世转屏(0, 当前判定线.y坐标)[1] + 'px';
            判定线HTML对象.id = 判定线ID;
            document.getElementById('judgelines').appendChild(判定线HTML对象);
        }
        判定线HTML对象.style.borderTopColor =
            'rgba(255, 255, 255, ' + 当前判定线.透明度 + ')';
        // 展示音符
        for (let j = 0; j < 当前判定线.瓜列表.length; j++) {
            let 当前音符 = 当前判定线.瓜列表[j];
            if (当前音符 === undefined) continue;
            let 音符纵向位移 = (function () {
                let 每毫秒流速 = 流速 / 节拍转毫秒(new 带分数(1, 0, 1));
                let 相差毫秒数 =
                    节拍转毫秒(当前音符.判定时间) - 毫秒计时 + 计时起始时间戳;
                let 音符纵向世界坐标 =
                    相差毫秒数 * 每毫秒流速 + 当前判定线.y坐标;
                let 音符纵向屏幕坐标 = 世转屏(0, 音符纵向世界坐标)[1];
                return 音符纵向屏幕坐标 - 图片宽度 / 2;
            })();
            let 音符横向位移 = 世转屏(当前音符.相对位置, 0)[0] - 图片宽度 / 2;
            let 音符ID = 'note_' + i + '_' + j;
            let 音符HTML对象 = document.getElementById(音符ID);
            if (音符纵向位移 < 0) {
                if (音符HTML对象) {
                    let 音符HTML容器 = document.getElementById(音符ID);
                    let 音符HTML对象 = 音符HTML容器.children[0];
                    音符HTML容器.removeChild(音符HTML对象);
                    音符HTML容器.remove();
                    continue;
                } else {
                    continue;
                }
            }
            if (
                音符纵向位移 > 屏幕高度 - 图片高度 ||
                节拍转毫秒(当前音符.判定时间) - 毫秒计时 + 计时起始时间戳 < -160
            ) {
                delete 当前判定线.瓜列表[j];
                let 音符HTML容器 = document.getElementById(音符ID);
                let 音符HTML对象 = 音符HTML容器.children[0];
                音符HTML容器.removeChild(音符HTML对象);
                音符HTML容器.remove();
                判定记录.push(-200);
                continue;
            }
            if (音符HTML对象) {
                // 修改原有对象属性
                音符HTML对象.style.top = 音符纵向位移 + 'px';
                音符HTML对象.style.left = 音符横向位移 + 'px';
            } else {
                // 创建对象
                音符HTML对象 = document.createElement('img');
                let 音符HTML容器 = document.createElement('div');
                音符HTML对象.src = './resource/' + 当前音符.种类 + '.png';
                音符HTML容器.style.top = 音符纵向位移 + 'px';
                音符HTML容器.style.left = 音符横向位移 + 'px';
                音符HTML容器.id = 音符ID;
                音符HTML容器.appendChild(音符HTML对象);
                document.getElementById('notes').appendChild(音符HTML容器);
            }
        }
    }
    判定南瓜(时间戳());
    延判();
    let 分数和连击数 = 计算分数和连击数();
    document.getElementById('scoreNum').innerHTML = 分数和连击数[0];
    document.getElementById('comboNum').innerHTML = 分数和连击数[1];
}
function 游戏中() {
    removeEventListener('click', 游戏中);
    // Flag: 谱面延迟稍后处理
    计时起始时间戳 = 时间戳();
    document.getElementById('ready').innerHTML = '';
    document.getElementById('comboText').innerHTML = 'COMBO';

    addEventListener('touchstart', 开始触摸, { passive: false });
    addEventListener('touchmove', 滑动触摸屏, { passive: false });

    music.play();
    setInterval(帧, 1);
}
window.onload = function () {
    /* 调整大小 */
    let 主体元素 = document.getElementsByTagName('body')[0];
    主体元素.style.width = 浏览器宽度;
    主体元素.style.height = 浏览器高度;
    let 谱面文件内容 = JSON.parse(获取谱面());
    音乐BPM = 谱面文件内容['info']['BPM'];
    let 判线列 = 谱面文件内容['judgelines'];
    for (let i = 0; i < 判线列.length; i++) {
        let 当前判定线 = 判线列[i];
        判定线列表.push(new 判定线());
        let 已经写入 = 判定线列表[判定线列表.length - 1];
        let 当前音符列 = new Array();
        let 音符对象列 = new Array();
        let 事件对象列 = new Array();
        let 当前事件列 = new Array();
        当前音符列 = 当前判定线['notes'];
        当前事件列 = 当前判定线['events'];
        for (let j = 0; j < 当前音符列.length; j++) {
            let 当前音符 = 当前音符列[j];
            let 时 = 当前音符['time'];
            let 当前音符对象 = new 瓜(
                当前音符['type'],
                new 带分数(时[0], 时[1], 时[2]),
                当前音符['x']
            );
            音符对象列.push(当前音符对象);
            物量++;
        }
        for (let j = 0; j < 当前事件列.length; j++) {
            let 当前事件 = 当前事件列[j];
            let 类 = 当前事件['type'];
            let 时 = 当前事件['time'];
            let 持 = 当前事件['last'];
            let 始 = 当前事件['from'];
            let 至 = 当前事件['to'];
            let 当前事件对象 = new 事件(
                类,
                new 带分数(时[0], 时[1], 时[2]),
                new 带分数(持[0], 持[1], 持[2]),
                始,
                至
            );
            事件对象列.push(当前事件对象);
        }
        已经写入.事件列表 = 事件对象列;
        已经写入.瓜列表 = 音符对象列;
    }
    /* 曲绘 */
    let 曲绘图片元素 = document.getElementById('background').children[0];
    曲绘图片元素.src = 'image/' + 解码(网址参数['illu']);
    /* 显示歌名和等级 */
    document.getElementById('nameText').innerHTML = 谱面名称;
    document.getElementById('levelText').innerHTML = 解码(网址参数['level']);
    /* 提醒用户点击屏幕
                原因：浏览器不允许在无操作的情况下自动播放音频
                */
    let 显示的文字 =
        '<div id="ready"><h1>%NAME%</h1><h3>Illustration designed by' +
        ' %ILLUSTRATION%</h3><h3>Chart designed by %CHART%</h3>' +
        '<hr><h1>点击屏幕以开始游戏</h1></div>';
    显示的文字 = 显示的文字
        .replace('%NAME%', 谱面名称)
        .replace('%ILLUSTRATION%', 曲绘作者)
        .replace('%CHART%', 谱面作者);
    document.getElementById('ready').innerHTML = 显示的文字;
    addEventListener('click', 游戏中);
};
