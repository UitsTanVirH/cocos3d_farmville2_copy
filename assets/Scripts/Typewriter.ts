import { _decorator, CCFloat, CCString, Component, EditBox, EventHandheld, EventHandler, Label, Node, RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Typewriter')
export class Typewriter extends Component {


    @property({multiline: true, tooltip: "Enter final text here"})
    public Text: string = "";

    @property(CCFloat)
    public Duration : 1.0;

    @property(EventHandler)
    public DoneCallback : EventHandler = new EventHandler();

    private m_timeBetweenChar = 0;

    private m_elapsedTime = 0;

    private m_currIndex = 0;

    private m_textComponent : RichText | Label = null;

    private m_done = false;

    protected onEnable(): void {
        
        this.m_textComponent = this.getComponent(RichText);

        if(!this.m_textComponent)
        {
            this.m_textComponent = this.getComponent(Label);

            if(!this.m_textComponent)
            {
                throw Error("Typewrite component requires RichText or Label component!");
            }
        }

        this.m_timeBetweenChar = this.Duration / this.Text.length;
    }


    update(deltaTime: number) 
    {
        if(!this.m_textComponent || this.m_done) return;

        // let indexToIncrement = Math.ceil(deltaTime / this.m_timeBetweenChar);

        // if(this.m_currIndex + indexToIncrement >= this.Text.length)
        // {
        //     indexToIncrement = this.Text.length - this.m_currIndex;
        // }

        this.m_elapsedTime += deltaTime;

        let currStr = this.m_textComponent.string;

        if(this.m_elapsedTime >= this.m_timeBetweenChar)
        {
            this.m_elapsedTime = 0;

            // for(let i = 0; i < indexToIncrement; i++)
            // {
                 currStr += this.Text[this.m_currIndex];
            // }
            
            ++this.m_currIndex;   

            this.m_textComponent.string = currStr;

            if(this.m_currIndex >= this.Text.length)
            {
                this.m_done = true;

                if(this.DoneCallback)
                {
                    EventHandler.emitEvents([this.DoneCallback], this);
                }
            }

        }        
    }

    public reset()
    {
        this.m_done = false;

        this.m_timeBetweenChar = this.Duration / this.Text.length;

        this.m_textComponent.string = "";

        this.m_currIndex = 0;
    }
}


