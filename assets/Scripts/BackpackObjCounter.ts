import { _decorator, Component, Label, Node } from 'cc';
import { BackpackBehavior, BackpackEvent } from './BackpackBehavior';
import { BackPackObjectBehavior, ObjectType } from './BackPackObjectBehavior';
import { pulseNode } from './Helper';
const { ccclass, property } = _decorator;

@ccclass('BackpackObjCounter')
export class BackpackObjCounter extends Component {
    
    // @property(Label)
    // public FishCounter : Label = null;

    // @property(Label)
    // public GrilledFishCounter : Label = null;

    @property(Label)
    public CoinCounter : Label = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    start() 
    {
        // this.FishCounter.string = '0';
        // this.GrilledFishCounter.string = '0';
        this.CoinCounter.string = '0';

        this.Backpack.node.on(BackpackEvent.ITEM_COLLECTED, this.onItemCollected, this);
        this.Backpack.node.on(BackpackEvent.ITEM_REMOVED, this.onItemRemoved, this);
    }

    update(deltaTime: number) 
    {
        
    }

    private onItemCollected(item : BackPackObjectBehavior)
    {
        switch(item.ObjectType)
        {
            case ObjectType.COIN :
            {
                let currentCount = this.Backpack.GetCoinCount(); //parseInt(this.CoinCounter.string);

                this.CoinCounter.string = (currentCount).toString();
               
                pulseNode(this.CoinCounter.node.parent!, 1, 0.2, 1.2);

                break;
            }

            // case ObjectType.FISH :
            // {
            //     let currentCount = parseInt(this.FishCounter.string);

            //     this.FishCounter.string = (++currentCount).toString();

            //     break;
            // }

            // case ObjectType.GRILLED_FISH :
            // {
            //     let currentCount = parseInt(this.GrilledFishCounter.string);

            //     this.GrilledFishCounter.string = (++currentCount).toString();

            //     break;
            // }
        }
    }

    private onItemRemoved(item : BackPackObjectBehavior)
    {
        switch(item.ObjectType)
        {
            case ObjectType.COIN :
            {
                // let currentCount = parseInt(this.CoinCounter.string);

                // --currentCount;

                // if(currentCount < 0) currentCount = 0;

                // this.CoinCounter.string = currentCount.toString();

                let currentCount = this.Backpack.GetCoinCount(); //parseInt(this.CoinCounter.string);

                this.CoinCounter.string = (currentCount).toString();

                pulseNode(this.CoinCounter.node.parent!, 1, 0.2, 1.2);

                break;
            }

            // case ObjectType.FISH :
            // {
            //     let currentCount = parseInt(this.FishCounter.string);

            //     --currentCount;

            //     if(currentCount < 0) currentCount = 0;

            //     this.FishCounter.string = currentCount.toString();

            //     break;
            // }

            // case ObjectType.GRILLED_FISH :
            // {
            //     let currentCount = parseInt(this.GrilledFishCounter.string);
               
            //     --currentCount;

            //     if(currentCount < 0) currentCount = 0;

            //     this.GrilledFishCounter.string = currentCount.toString();

            //     break;
            // }
        }
    }
}


