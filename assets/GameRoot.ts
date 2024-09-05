import { _decorator, Component, Node, Sprite, UITransform, tween,v3, EventTouch } from 'cc';
import {ImgManager } from './ImgManager';

const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRootImageBitmap extends Component {
    @property( ImgManager) imgManager: ImgManager;
    @property(Node) pointRoot: Node;

    /** 初始牌堆 */
    cards: TCardId[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ,6 ,6];
    /**聲明緩存物件 */
    currentOpenCard = {
        node: null,
        data: -1,

    }
    async start() 
    {
        this.orderAllCards();
        this.createAllCards();
        await this.moveAllCards();
        await this.setCardBeiAnim();
        this.addCardsEvent();
    }

    setCardBeiAnim()
    {
        return new Promise<void>(resolve => {
             this.node.children.forEach((node, index) => {
                tween(node)
                    .to(0.5, { scale: v3(0, 1, 0) })
                    .call(() => {
                        const sprite = node.getComponent(Sprite);
                        sprite.spriteFrame = this.imgManager.getCardBeiSF();
                    })
                    //給Scale做動畫，Z軸不能為0否則點不到
                    .to(0.5, { scale: v3(1, 1, 1) })
                    .start();
            });
            //等待的異步代碼
            this.scheduleOnce(() => {
                resolve();
            }, 1.2);
        })
        
    }

    moveAllCards()
    {
        return new Promise<void>(resolve => {
            //確認信息就從point根節點的child取
            this.node.children.forEach((node, index) => {
                const posX = this.pointRoot.children[index].position.x;
                const posY = this.pointRoot.children[index].position.y;
                //node.setPosition(posX, posY);
                //動畫效果
                tween(node).delay(index * 0.1).to(0.5, { position: v3(posX, posY, 0) }).start();
                //通過selectX的改變模擬翻牌效果
            });
            
 
            this.scheduleOnce(() => {
                resolve();
            }, 2);
        })
        
    }
    orderAllCards()
    {
        this.cards.sort(()=> 0.5 - Math.random());
        this.cards.sort(()=> 0.5 - Math.random());
        this.cards.sort(()=> 0.5 - Math.random());
    }

    addCardsEvent() { 
        this.node.children.forEach((node, index) => {
            node.on(Node.EventType.TOUCH_END, async (event: EventTouch) => {
                //翻開排的邏輯 1.已經翻開的，跳過
                if (node === this.currentOpenCard.node) {
                    return;
                }
                //2.沒翻開的話翻開
                if (!this.currentOpenCard.node) {
                    //讓點擊的卡牌翻過來
                    const id = this.cards[index];
                    this.makeCardTurn(node, false, id);
                    //點擊後將當前點數輸入
                    this.currentOpenCard.node = node;
                    this.currentOpenCard.data = id;
                    console.log('點擊當前節點', this.currentOpenCard);
                } else {
                    //有翻開的判斷兩張牌是否匹配
                    const id = this.cards[index];
                    if (this.currentOpenCard.data === id) {
                        console.log("匹配成功!");
                        //動畫事先翻開點擊的另一張牌，然後讓兩張牌隱藏(消失)
                        await this.makeCardTurn(node, false, id);
                        this.currentOpenCard.node.active = false;
                        this.currentOpenCard.node = null;
                        node.active = false;
                    } else {
                            console.log("匹配失敗!");
                            //翻開兩張牌，再翻回背面，所以先翻開另一張牌
                            await this.makeCardTurn(node, false, id);
                            this.makeCardTurn(node, true);
                            await this.makeCardTurn(this.currentOpenCard.node, true);
                            this.currentOpenCard.node = null;
                    }
                }
               
            }, this) ;
                 
        })
    }
    
    makeCardTurn(node, isBack, id?)
    {
        return new Promise<void>(resolve => {
            tween(node)
            .to(0.5, { scale: v3(0, 1, 1) })
            .call(() => {
                const sprite = node.getComponent(Sprite);
                sprite.spriteFrame = isBack ? this.imgManager.getCardBeiSF() : this.imgManager.getCardSFById(id);
            })
                .to(0.5, { scale: v3(1, 1, 1) })
                .call(()=> resolve())
            .start();
        })
       
    }
    createAllCards()
    {
       console.log('createAllCards', this.cards);
       this.cards.forEach(cardId => {
           this.createOneCard(cardId);
       })
    }

    createOneCard(id)
    {
        //創建節點及圖片組建
        const node = new Node('card');
        this.node.addChild(node);
        const tran = node.addComponent(UITransform);
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        //設定完尺寸模式為Custom之後再改尺寸
        tran.setContentSize(140,200);

        const sf = this.imgManager.getCardSFById(id);

        sprite.spriteFrame = sf;        //插入圖片資源

    }
    update(deltaTime: number) {
        
    }
}


