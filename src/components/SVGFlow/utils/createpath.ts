/**
 * 求点与线段的垂足，没有返回null
 * 
 * @param pt 
 * @param line 
 * @returns 
 */
export function getFootOfPerpendicular(pt, line) {
  const { x: x0, y: y0 } = pt
  const { x1, y1, x2, y2 } = line
  // 1. 处理线段水平的情况
  if (y1 === y2) {
    // 如果线段水平，垂足的 y 坐标就是 y1，x 坐标是 x0
    if (x0 >= Math.min(x1, x2) && x0 <= Math.max(x1, x2)) {
        return { x: x0, y: y1 };  // 返回垂足
    } else {
        return null; // 如果垂足不在线段范围内，返回 null
    }
  }

  // 2. 处理线段垂直的情况
  if (x1 === x2) {
      // 如果线段垂直，垂足的 x 坐标就是 x1，y 坐标是 y0
      if (y0 >= Math.min(y1, y2) && y0 <= Math.max(y1, y2)) {
          return { x: x1, y: y0 };  // 返回垂足
      } else {
          return null; // 如果垂足不在线段范围内，返回 null
      }
  }
  // 1. 计算线段 AB 的斜率 m
  const m = (y2 - y1) / (x2 - x1);

  // 2. 垂线的斜率是 -1/m
  const m_perpendicular = -1 / m;

  // 3. 线段 AB 的方程: y = m * (x - x1) + y1
  //    垂线的方程: y = m_perpendicular * (x - x0) + y0

  // 4. 联立两方程求解 x 和 y
  const x_f = (m * x1 - m_perpendicular * x0 + y0 - y1) / (m - m_perpendicular);
  const y_f = m * (x_f - x1) + y1;

  // 5. 判断交点是否在线段 AB 上
  if (x_f >= Math.min(x1, x2) && x_f <= Math.max(x1, x2) && y_f >= Math.min(y1, y2) && y_f <= Math.max(y1, y2)) {
    return { x: x_f, y: y_f }; // 返回垂足坐标
  }

  return null; // 如果垂足不在线段上，返回 null
}

/**
 * 判断点是否在线段上
 * 
 * @param pt 
 * @param start 
 * @param end 
 * @returns 
 */
export function isPointOnLine(pt, start, end) {
  pt.x = +(pt.x.toFixed(0))
  pt.y = +(pt.y.toFixed(0))
  start.x = +(start.x.toFixed(0))
  start.y = +(start.y.toFixed(0))
  end.x = +(end.x.toFixed(0))
  end.y = +(end.y.toFixed(0))
  const { x: x0, y: y0 } = pt 
  const { x: x1, y: y1 } = start
  const { x: x2, y: y2 } = end
  // debugger
  // 判断点是否在线段的垂直线上
  if (x0 === x1 && x1 === x2) {  // 垂直线段
    // 判断点的 y 坐标是否在线段的 y 范围内
    return y0 >= Math.min(y1, y2) && y0 <= Math.max(y1, y2);
  }

  // Step 1: 判断点 P 是否在直线上
  let m = (y2 - y1) / (x2 - x1);  // 计算斜率 m
  let expectedY = m * (x0 - x1) + y1;  // 计算点 P 对应的 y 值

  // 如果 P 不在直线上，直接返回 false
  if (y0 !== expectedY) {
      return false;
  }

  // Step 2: 判断点 P 是否在线段的范围内
  if (x0 < Math.min(x1, x2) || x0 > Math.max(x1, x2)) {
      return false;
  }
  if (y0 < Math.min(y1, y2) || y0 > Math.max(y1, y2)) {
      return false;
  }

  // 如果都满足条件，返回 true
  return true;
}

/**
 * 根据旋转角度判断方向
 * 
 * @param angle - 旋转角度
 * @returns 方向
 */
export function getEdge(angle) {
  const direction = ['top','right','bottom','left']
  if (angle > 315 || angle <= 45) return direction[0]; // 上边
  if (angle > 45 && angle <= 135) return direction[1]; // 右边
  if (angle > 135 && angle <= 225) return direction[2]; // 下边
  if (angle > 225 && angle <= 315) return direction[3]; // 左边
}

/**
 * 
 * @param a 点
 * @param b 线段端点
 * @param c 线段端点
 * @returns 点到直线的水平交点
 */
export function horizontalIntersection(start, end, pt) {
  const { x: x2, y: y2 } = start
  const { x: x3, y: y3 } = end
  const { x: x1, y: y1 } = pt
  // 检查水平线是否与线段在纵向上重叠
  if (y1 < Math.min(y2, y3) || y1 > Math.max(y2, y3)) {
    return null; // 水平线与线段不相交
  }

  // 检查线段是否垂直 (x2 === x3)
  if (x2 === x3) {
    // 如果线段是垂直线，只需判断垂直线段是否包含水平线的 y 值
    return { x: x2, y: y1 };
  }

  // 计算线段的斜率 m 和截距 b
  let m = (y3 - y2) / (x3 - x2); // 斜率
  let b = y2 - m * x2;           // 截距

  // 计算交点的 x 坐标
  let intersectionX = (y1 - b) / m;

  // 判断交点是否在线段的 x 范围内
  if (intersectionX >= Math.min(x2, x3) && intersectionX <= Math.max(x2, x3)) {
      return { x: intersectionX, y: y1 }; // 返回交点坐标
  }

  return null; // 如果交点不在线段上，返回 null
}

/**
 * 
 * @param a 点
 * @param b 线段端点
 * @param c 线段端点
 * @returns 点到直线垂直交点
 */
export function verticalIntersection(start, end, x) {
  const { x: x1, y: y1 } = start
  const { x: x2, y: y2 } = end

  // 步骤 1: 检查垂直线是否与线段横跨
  if (x < Math.min(x1, x2) || x > Math.max(x1, x2)) {
      return null;  // 垂直线与线段没有交点
  }

  // 步骤 2: 计算线段 AB 的斜率 m
  if (x2 === x1) {
      // 如果 x1 == x2，AB 是一条垂直线，无法计算斜率
      return null;
  }

  let m = (y2 - y1) / (x2 - x1);  // 斜率 m
  let b = y1 - m * x1;            // 截距 b

  // 步骤 3: 计算交点的 y 坐标
  let intersectionY = m * x + b;  // 交点 y 坐标

  // 步骤 4: 判断交点是否在线段 AB 上
  if (intersectionY >= Math.min(y1, y2) && intersectionY <= Math.max(y1, y2)) {
      return { x: x, y: intersectionY };  // 返回交点坐标
  }

  return null;  // 如果交点不在线段上，返回 null
}

const diff = {
  'right': {
    x: 20,
    y: 0
  },
  'left': {
    x: -20,
    y: 0
  },
  'top': {
    x: 0,
    y: -20
  },
  'bottom': {
    x: 0,
    y: 20
  }
}
const diffCubic = {
  'right': {
    x: 1,
    y: 0
  },
  'left': {
    x: -1,
    y: 0
  },
  'top': {
    x: 0,
    y: -1
  },
  'bottom': {
    x: 0,
    y: 1
  }
}
const oppsite = {
  'right': 'left',
  'left': 'right',
  'bottom': 'top',
  'top': 'bottom',
}
const ratio = 1.5
export const createCubicBezierPath = (origin,target,sdir,edir) => {
  let _x = Math.abs(target.x - origin.x) / ratio
  let _y = Math.abs(target.y - origin.y) / ratio
  // console.log(_x,'_x----');

  _x = _x <= 50 ? 50 : _x
  _y = _y <= 50 ? 50 : _y
  // 起点内联点
  
  const start = {
    x: origin.x + diffCubic[sdir].x * _x,
    y: origin.y + diffCubic[sdir].y * _y
  }

  // 从node出来没有连接其他node的情况，目标dir为空
  if(sdir && !edir) {
    if(sdir == 'left' || sdir == 'right') {
      edir = target.x > origin.x ? 'left' : 'right'
      console.log(edir,'edir');
    }else {
      edir = target.y < origin.y ? 'bottom' : 'top'
    }
  }

  // 终点内联点
  const end = {
    x: target.x + diffCubic[edir].x * _x,
    y: target.y + diffCubic[edir].y * _y
  }

  return {
    begin: origin,
    end: target,
    d: `M${origin.x},${origin.y} C${start.x},${start.y} ${end.x},${end.y} ${target.x},${target.y}`
  }
}

/**
 * 
 * @param origin 
 * @param target 
 * @param sdir      起点延伸方向
 * @param edir      终点延伸方向
 * @return {*}  M100,100 L200,100 L200,200
 */
export const drawLine = (origin, target, sdir, edir, move = false) => {
  // 起点内联点
  const start = {
    x: origin.x + diff[sdir].x,
    y: origin.y + diff[sdir].y
  }

  // 从node出来没有连接其他node的情况，目标dir为空
  if(sdir && !edir) {
    if(sdir == 'left' || sdir == 'right') {
      edir = target.x > origin.x ? 'left' : 'right'
      console.log(edir,'edir');
    }else {
      edir = target.y < origin.y ? 'bottom' : 'top'
    }
  }



  // 终点内联点
  const end = {
    x: target.x + diff[edir].x,
    y: target.y + diff[edir].y
  }

  // 求x轴延伸到终点
  const p1 = {
    x: end.x,
    y: start.y
  }

  const points1 = [
    origin,
    start,
    p1,
    end,
    target,
  ]

  // 求y轴延伸到终点
  const p3 = {
    x: start.x,
    y: end.y
  }

  const points2 = [
    origin,
    start,
    p3,
    end,
    target,
  ]

  let isCross1 = isCrossPoint(start,p1,origin,end,p1,target)
  let isCross2 = isCrossPoint(start,p3,origin,end,p3,target)
  
  // 不合格
  if(isCross1 && isCross2) {
    // console.log('不合格'); 
    // 都不合格，取没经过起点的进行中点延伸
    const crossStart1 = isCrossPoint(points1[2],points1[1],points1[0])
    const crossStart2 = isCrossPoint(points2[2],points2[1],points2[0])

    const p = !crossStart1 ? generateExtPoint(points1, 1) : generateExtPoint(points2, 2)
    return computed(p)
  }
  const angle1 = countRightAngles(points1)
  const angle2 = countRightAngles(points2)
  // 取弯折少的
  const extX = generateExtPoint(points1, 1)
  const extY = generateExtPoint(points2, 2)
  // 都合格
  if(!isCross1 && !isCross2) {   
    // console.log('都合格'); 
    const extXAngle = countRightAngles(extX)
    const extYAngle = countRightAngles(extY)
    
    if(sdir == 'right' || sdir == 'left') {
      if(arePointsCollinear(extX[0],extX[1],extX[2]) && isCrossPoint(extX[0],extX[1],extX[2])) {
        if(target.x < origin.x) {
          return computed(points2)
        }
        return computed(extY)
      }
      if(edir == oppsite[sdir]) {
        
        return computed(extX)
      }

      if(arePointsCollinear(points1[3],points1[4],points1[2]) && isCrossPoint(points1[3],points1[4],points1[2])){
        return computed(extX)
      }
      return computed(points1)
    }

    if(sdir == 'bottom' || sdir == 'top') {
      if(arePointsCollinear(extY[0],extY[1],extY[2]) && isCrossPoint(extY[0],extY[1],extY[2])) {
        if(target.y > origin.y && sdir == edir) {
          return computed(points1)
        }
        if(target.y < origin.y) {
          return computed(points1)
        }
        return computed(extX)
      }
      if(edir == oppsite[sdir]) {
        return computed(extY)
      }

      if(arePointsCollinear(points2[3],points2[4],points2[2]) && isCrossPoint(points2[3],points2[4],points2[2])){
        return computed(extY)
      }
      return computed(points2)
    }

  }
  // 一个合格
  else {
    // console.log('一个合格'); 
    // 取一个：过起始终点的为true
    // 1为真穿过两点取points2
    const p = isCross1 ? points2 : points1
    const tempAngle = isCross1 ? angle2 : angle1

    // 经过
    const extX = generateExtPoint(points1,1)
    const extY = generateExtPoint(points2,2)
    const crossX = isCrossPoint(extX[2],extX[1],extX[0],extX[3],extX[4],extX[extX.length - 1])
    const crossY = isCrossPoint(extY[2],extY[1],extY[0],extY[3],extY[4],extY[extY.length - 1])
    if(crossX && crossY) return computed(p)
    if(!crossX && !crossY) {
      if(isCrossPoint(extY[0],extY[1],extY[2])) {
        if(countRightAngles(extX) > tempAngle) return computed(p)
        return computed(extX)
      }else {
        if(countRightAngles(extY) > tempAngle) return computed(p)
        if(arePointsCollinear(extY[5],extY[4],extY[3]) && isCrossPoint(extY[5],extY[4],extY[3])) {
          return computed(p)
        }
        return computed(extY)
      }
    }
    if(crossX) {
      // 需要检查拐点是否在内联点和终点之间
      if(arePointsCollinear(extY[5],extY[4],extY[3]) && isCrossPoint(extY[5],extY[4],extY[3])) {
        return computed(p)
      }
      if(countRightAngles(extY) > tempAngle) return computed(p)
      if(arePointsCollinear(extY[0],extY[1],extY[2]) && isCrossPoint(extY[0],extY[1],extY[2])) {
        return computed(p)
      }
      return computed(extY)
    }
    if(crossY){
      // 需要检查拐点是否在内联点和终点之间
      if(arePointsCollinear(extX[5],extX[4],extX[3]) && isCrossPoint(extX[5],extX[4],extX[3])) {
        return computed(p)
      }
      if(countRightAngles(extX) > tempAngle) return computed(p)
      if(arePointsCollinear(extX[0],extX[1],extX[2]) && isCrossPoint(extX[0],extX[1],extX[2])) {
        return computed(p)
      }
      return computed(extX)
    }
    // return computed(p)
  }
}

function computed(arry) {
  const result = arry.map((p, i) => {
    if(i == 0) {
      return `M${p.x},${p.y}`
    }
    return `L${p.x},${p.y}`
  })
  return {
    d: result.join(' '),
    end: arry[arry.length - 1],
    begin: arry[0],
  }
}

// 三点共线
function arePointsCollinear(A, B, C) {
  const { x: x1, y: y1 } = A;
  const { x: x2, y: y2 } = B;
  const { x: px, y: py } = C;

  // 使用向量法计算叉积
  const crossProduct = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);

  return crossProduct === 0;
}

// 创建中点延伸折线 type 1 x轴方向的中点延伸 2 y轴方向的中点延伸
function generateExtPoint(points, type = 1) {
  const s = points[1]
  const p = points[2]
  const e = points[3]
  if(type == 1) {
    // console.log('x轴平行线');
    const k1 = {
      x: (p.x - s.x) / 2 + s.x ,
      y: p.y
    }
    const k2 = {
      x: k1.x,
      y: e.y
    }
    return [
      points[0],s,k1,k2,e,
      points[points.length - 1]
    ]
  }else{
    // console.log('y轴平行线');
    // y轴
    const k1 = {
      x: p.x,
      y: (p.y - s.y) / 2 + s.y
    }
    const k2 = {
      x: e.x,
      y: k1.y
    }
    return [
      points[0],s,k1,k2,e,
      points[points.length - 1]
    ]
  }
}

// 是否平行
function areLinesParallel(A, B, C, D) {
  return (B.x - A.x) * (D.y - C.y) === (B.y - A.y) * (D.x - C.x);
}

function isPointBetween(A, B, P) {
  if(!(A && B && P)) return
  // 检查三点是否共线
  const isCollinear = (P.x - A.x) * (B.y - A.y) === (P.y - A.y) * (B.x - A.x);
  // 检查 P 是否在 A 和 B 的中间
  const isBetweenX = Math.min(A.x, B.x) <= P.x && P.x <= Math.max(A.x, B.x);
  const isBetweenY = Math.min(A.y, B.y) <= P.y && P.y <= Math.max(A.y, B.y);
  return isCollinear && isBetweenX && isBetweenY;
}

// 是否经过起点或者终点
function isCrossPoint(p1,p2,p3,p4,p5,p6) {
  return isPointBetween(p1,p2,p3) || isPointBetween(p4,p5,p6)
}

function countRightAngles(points) {
  let rightAngleCount = 0;

  for (let i = 1; i < points.length - 1; i++) {
    // 直接计算前后两条线段的点积
    if 
    (
      (points[i].x - points[i - 1].x) * (points[i + 1].x - points[i].x) 
      + (points[i].y - points[i - 1].y) * (points[i + 1].y - points[i].y) 
      === 0
    ) rightAngleCount++;  
  }
  return rightAngleCount;
}

export default drawLine