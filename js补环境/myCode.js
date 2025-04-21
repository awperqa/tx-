
// mousemove 事件调用  340   242.857    (30-90,236-250)    1.97647  (332,266)   (187.5,150.2)
// 函数实现，参数 n 单位 毫秒 ；
function sleep ( n ) {
    var start = new Date().getTime() ;
    while ( true ) {
        if ( new Date( ).getTime( ) - start > n ) {
            // 使用  break  实现；
            break;
        }
    }
}

function generateTrajectoryWithRandomStart(startRange, end, frames) {
    /**
     * 生成从快到慢的轨迹数组，起点随机生成在范围内
     *
     * @param {Array} startRange 起点范围 [[xMin, xMax], [yMin, yMax]]
     * @param {Array} end 终点坐标 [x, y]
     * @param {number} frames 轨迹分为的帧数，越大轨迹越平滑
     * @return {Array} 轨迹点数组，每个点是 [x, y]
     */
    // 随机生成起点
    const start = [
        Math.random() * (startRange[0][1] - startRange[0][0]) + startRange[0][0],
        Math.random() * (startRange[1][1] - startRange[1][0]) + startRange[1][0],
    ];
    
    console.log(`随机生成起点: [${start[0].toFixed(2)}, ${start[1].toFixed(2)}]`);
    
    const trajectory = [];
    const totalDistance = [end[0] - start[0], end[1] - start[1]]; // 计算总位移

    for (let i = 0; i <= frames; i++) {
        const t = i / frames; // 当前帧归一化时间 (0 ~ 1)
        const progress = 1 - Math.pow(1 - t, 2); // 减速公式

        // 计算当前点位置
        const currentPosition = [
            start[0] + progress * totalDistance[0],
            start[1] + progress * totalDistance[1],
        ];
        trajectory.push(currentPosition);
    }
    
    return trajectory;
}

// 示例使用
const startRange = [[30, 90], [236, 250]]; // 起点范围
const end = [200, 300]; // 终点
const frames = 60; // 轨迹分为 60 帧

const trajectory = generateTrajectoryWithRandomStart(startRange, end, frames);

// 输出轨迹
// trajectory.forEach((point, index) => {
//     console.log(`Frame ${index}: [${point[0].toFixed(2)}, ${point[1].toFixed(2)}]`);
// });

data = {
    "screenX": 544,
    "screenY": 534,
    "clientX": 35,
    "clientY": 240,
    "movementX": 0,
    "movementY": 0,
    "pageX": 35,
    "pageY": 240,
    "offsetX": 35,
    "offsetY": 240,
};
mouseList = [data];
// sleep(1000+Math.random()*1000);
for(let i = 0;i<frames;i++){
    data.movementX = trajectory[i][0] - data.clientX;
    data.movementY = trajectory[i][1] - data.clientY;
    data.screenX = data.screenX + data.movementX;
    data.screenY = data.screenX + data.movementY;
    data.clientX = trajectory[i][0];
    data.clientY = trajectory[i][1];
    data.pageX = data.clientX;
    data.pageY = data.clientY;
    data.offsetX = data.clientX;
    data.offsetY = data.clientY;
    my_mouse = MouseEvent.getMeDog(data);
    dogvm.memory.listeners["mousemove"][0](my_mouse);
    // if(i==0 || i==1) {
    //     sleep(100 + Math.random() * 10);
    // }
    // else{
    //     sleep(Math.random()*10);
    // }
}
// window.setData 
t = {ft: 'qf_7Pf__H'};
window.TDC.setData(t);

const dtt = window.TDC.getData();
[decodeURIComponent(dtt), decodeURIComponent(dtt).length, window.TDC.getInfo(), www];
// return window.dt;