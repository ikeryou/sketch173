import ballVs from '../glsl/simple.vert';
import ballFs from '../glsl/item.frag';
import boxVs from '../glsl/base.vert';
import boxFs from '../glsl/box.frag';
import { MyObject3D } from "../webgl/myObject3D";
import { Util } from "../libs/util";
import { Mesh } from 'three/src/objects/Mesh';
import { DoubleSide } from 'three/src/constants';
import { Func } from "../core/func";
import { Vector3 } from "three/src/math/Vector3";
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Color } from 'three/src/math/Color';
import { Object3D } from "three/src/core/Object3D";
import { Scroller } from "../core/scroller";
import { Val } from '../libs/val';
import { Tween } from '../core/tween';
import { Param } from '../core/param';
import { Conf } from '../core/conf';

export class Item extends MyObject3D {

  private _boxCon:Array<Object3D> = []
  private _box:Array<Array<Object3D>> = []

  private _ball:Object3D

  private _shakeVal:Array<Val> = []
  private _posNoise:Vector3 = new Vector3()

  public itemPos:Vector3 = new Vector3()
  public itemSize:Vector3 = new Vector3()

  constructor(opt:any = {}) {
    super()

    this.itemPos.x = opt.ix
    this.itemPos.y = opt.iy

    // ハコ
    const boxNum = 10
    for(let l = 0; l < boxNum; l++) {
      const boxCon = new Object3D()
      this.add(boxCon)
      this._boxCon.push(boxCon)

      this._shakeVal.push(new Val(0))

      this._box.push([])
      for(let i = 0; i < 6; i++) {
        const box = new Mesh(
          opt.boxGeo,
          new ShaderMaterial({
            vertexShader:boxVs,
            fragmentShader:boxFs,
            transparent:true,
            side:DoubleSide,
            uniforms:{
              alpha:{value:1},
              gray:{value:1},
              brightness:{value:0},
              color:{value:new Color(opt.col[i])},
            }
          })
        )
        boxCon.add(box)
        this._box[l].push(box)
        if(i == 0 || i == 2) box.visible = false
      }
    }

    // ボール
    this._ball = new Mesh(
      opt.ballGeo,
      new ShaderMaterial({
        vertexShader:ballVs,
        fragmentShader:ballFs,
        transparent:true,
        side:DoubleSide,
        uniforms:{
          alpha:{value:1},
          shadow:{value:1},
          color:{value:new Color(opt.col[3])},
        }
      })
    )
    this.add(this._ball)
  }


  // ---------------------------------
  // ゆらす
  // ---------------------------------
  private _shake(key:number):void {
    const sv = this._shakeVal[key]
    if(sv.val > 0) return

    Tween.instance.a(sv, {
      val:[0, 1.1]
    }, 0.2, 0)
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()
    const s = Scroller.instance.val.y

    const fixRate = Util.instance.map(s, 0, 1, 0, sh)

    let rate = fixRate
    if(!Param.instance.isStart) rate = 0

    const size = (Math.max(sh, sw) * 1) / this._boxCon.length
    this.itemSize.x = size

    // ハコ
    const bs = this.itemSize.x
    const d = this.itemSize.x * 0.5
    this._box.forEach((val) => {
      val[1].scale.set(bs, bs, 1)
      val[1].quaternion.setFromAxisAngle(new Vector3(0,1,0), Util.instance.radian(-90))
      val[1].position.x = d

      val[3].scale.set(bs, bs, 1)
      val[3].quaternion.setFromAxisAngle(new Vector3(0,1,0), Util.instance.radian(90));
      val[3].position.x = -d

      val[4].scale.set(bs, bs, 1)
      val[4].quaternion.setFromAxisAngle(new Vector3(0,0,0), Util.instance.radian(0));
      val[4].position.z = -d

      val[5].scale.set(bs, bs, 1)
      val[5].quaternion.setFromAxisAngle(new Vector3(1,0,0), Util.instance.radian(180));
      val[5].position.z = d
    })

    // ハコのY位置
    const boxShakeRange = size * 0.2
    this._boxCon.forEach((val,i) => {
      val.position.x = 0
      val.position.y = (bs * 1 + Conf.instance.MARGIN) * -i + this._posNoise.y * boxShakeRange

      const sv = this._shakeVal[i]
      if(sv.val > 0 && sv.val < 1) {
        val.position.x += Util.instance.range(boxShakeRange)
        val.position.y += Util.instance.range(boxShakeRange)
      }

      // ボール通り過ぎたかチェック
      const hit = (val.position.y > this._ball.position.y)
      this._box[i].forEach((val2) => {
        this._setUni(val2 as Mesh, 'gray', hit ? 0 : 1)
      })
      if(!hit && sv.val != 0) {
        Tween.instance.kill(sv)
        sv.val = 0
      }

      // ゆれる
      if(hit) this._shake(i)
    })

    // ボール
    const ballYRange = sh * 0.5
    this._ball.position.x = 0
    this._ball.position.y = Util.instance.mix(ballYRange + sh * 0.5, -ballYRange - sh * 1, rate)
    const ballSizeOffset = 0.7
    this._ball.scale.set(size * ballSizeOffset, size * ballSizeOffset, size * ballSizeOffset)
  }
}