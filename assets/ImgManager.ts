import { _decorator, Component, Node ,SpriteFrame} from 'cc';
const { ccclass, property } = _decorator;

//命名新類別
export type TCardId = 1 | 2 | 3 | 4 | 5 | 6;

@ccclass('ImgManager')
export class ImgManager extends Component {


    @property([SpriteFrame]) cardsSF: SpriteFrame[] = [];

    getCardSFById(id: TCardId)
    {
        return this.cardsSF[id];
    }

    getCardBeiSF()
    {
        return this.cardsSF[0];
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
}


